import { useState, useCallback, useEffect } from 'react';
import { postApi } from '../services/api/posts';
import { getMyUserIdFromJwt } from '../utils/auth/auth';

export const usePost = (postId) => {
    // 상태 관리
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const currentUserId = getMyUserIdFromJwt();

    // 게시글 조회
    const fetchPost = useCallback(async (id = postId) => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            // 첫 번째 시도: 인증 없이 요청
            let response;
            try {
                response = await postApi.getPost(id, false);
            } catch (error) {
                // 401 에러가 발생하면 인증이 필요한 것으로 판단하고 재시도
                if (error.response?.status === 401) {
                    console.log('[usePost] 인증 없는 요청 실패, 인증 포함하여 재시도');
                    response = await postApi.getPost(id, true);
                } else {
                    throw error;
                }
            }
            
            setPost(response);
            return response;

        } catch (err) {
            console.error('게시글 조회 실패:', err);
            setError(err.message || '게시글을 불러오는데 실패했습니다.');
            setPost(null);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    // 게시글 작성
    const createPost = useCallback(async (postData, images = []) => {
        try {
            setSubmitting(true);
            setError(null);

            const response = await postApi.createPost(postData, images);
            return response;

        } catch (err) {
            console.error('게시글 작성 실패:', err);
            setError(err.message || '게시글 작성에 실패했습니다.');
            throw err;
        } finally {
            setSubmitting(false);
        }
    }, []);

    // 게시글 수정
    const updatePost = useCallback(async (id = postId, postData, images = []) => {
        if (!id) {
            throw new Error('게시글 ID가 필요합니다.');
        }

        try {
            setSubmitting(true);
            setError(null);

            const response = await postApi.updatePost(id, postData, images);
            
            // 현재 게시글 상태 업데이트
            if (post && post.postId === id) {
                setPost(prev => ({
                    ...prev,
                    ...response,
                    postId: id
                }));
            }

            return response;

        } catch (err) {
            console.error('게시글 수정 실패:', err);
            setError(err.message || '게시글 수정에 실패했습니다.');
            throw err;
        } finally {
            setSubmitting(false);
        }
    }, [postId, post]);

    // 게시글 삭제
    const deletePost = useCallback(async (id = postId) => {
        if (!id) {
            throw new Error('게시글 ID가 필요합니다.');
        }

        try {
            setSubmitting(true);
            setError(null);

            const response = await postApi.deletePost(id);
            
            // 현재 게시글이 삭제된 게시글이라면 상태 초기화
            if (post && post.postId === id) {
                setPost(null);
            }

            return response;

        } catch (err) {
            console.error('게시글 삭제 실패:', err);
            setError(err.message || '게시글 삭제에 실패했습니다.');
            throw err;
        } finally {
            setSubmitting(false);
        }
    }, [postId, post]);

    // 에러 클리어
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // 게시글 데이터 초기화
    const clearPost = useCallback(() => {
        setPost(null);
        setError(null);
    }, []);

    // 권한 체크
    const canEdit = useCallback(() => {
        return post && currentUserId && post.userId === currentUserId;
    }, [post, currentUserId]);

    const canDelete = useCallback(() => {
        return post && currentUserId && post.userId === currentUserId;
    }, [post, currentUserId]);

    // 게시글 ID가 변경되면 자동으로 조회
    useEffect(() => {
        if (postId) {
            fetchPost(postId);
        } else {
            clearPost();
        }
    }, [postId, fetchPost, clearPost]);

    // 유틸리티 함수들
    const isAuthor = useCallback(() => {
        return post && currentUserId && post.userId === currentUserId;
    }, [post, currentUserId]);

    const hasImages = useCallback(() => {
        return post && post.imageUrls && post.imageUrls.length > 0;
    }, [post]);

    const getImageCount = useCallback(() => {
        return post?.imageUrls?.length || 0;
    }, [post]);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '';
        }
    }, []);

    const getRelativeTime = useCallback((dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffTime / (1000 * 60));

            if (diffMinutes < 1) {
                return '방금 전';
            } else if (diffMinutes < 60) {
                return `${diffMinutes}분 전`;
            } else if (diffHours < 24) {
                return `${diffHours}시간 전`;
            } else if (diffDays === 1) {
                return '1일 전';
            } else if (diffDays < 7) {
                return `${diffDays}일 전`;
            } else {
                return formatDate(dateString);
            }
        } catch {
            return '';
        }
    }, [formatDate]);

    return {
        // 데이터
        post,
        
        // 상태
        loading,
        error,
        submitting,
        
        // 액션
        fetchPost,
        createPost,
        updatePost,
        deletePost,
        clearError,
        clearPost,
        
        // 권한
        canEdit,
        canDelete,
        isAuthor,
        
        // 유틸리티
        hasImages,
        getImageCount,
        formatDate,
        getRelativeTime,
        
        // 계산된 값
        isLoaded: !loading && post !== null,
        isEmpty: !loading && post === null,
        isEditable: canEdit(),
        isDeletable: canDelete()
    };
};

export default usePost;
