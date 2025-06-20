import { useState, useCallback, useEffect } from 'react';
import { postApi } from '../services/api';
import { PostType } from '../types/PostType';

export const usePosts = (initialFilters = {}) => {
    // 상태 관리
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        totalPages: 0,
        totalElements: 0,
        currentPage: 1,
        hasNext: false,
        isLast: true,
        hasPrevious: false,
        isFirst: true
    });

    // 필터 상태
    const [filters, setFilters] = useState({
        keyword: '',
        type: PostType.FREE,
        page: 1,
        size: 10,
        ...initialFilters
    });

    // 캐시된 게시글 저장 (옵션)
    const [cachedPosts, setCachedPosts] = useState(new Map());

    // 게시글 목록 조회
    const fetchPosts = useCallback(async (searchFilters = filters) => {
        try {
            setLoading(true);
            setError(null);

            // 캐시 키 생성
            const cacheKey = JSON.stringify(searchFilters);
            
            // 캐시된 데이터가 있고 5분 이내라면 사용
            const cached = cachedPosts.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
                setPosts(cached.data.content || []);
                setPagination({
                    totalPages: cached.data.totalPages || 0,
                    totalElements: cached.data.totalElements || 0,
                    currentPage: (cached.data.page || 0) + 1,
                    hasNext: !cached.data.isLast,
                    isLast: cached.data.isLast || true,
                    hasPrevious: !cached.data.isFirst,
                    isFirst: cached.data.isFirst || true
                });
                setLoading(false);
                return cached.data;
            }

            const params = {
                keyword: searchFilters.keyword || undefined,
                type: searchFilters.type,
                page: searchFilters.page,
                size: searchFilters.size
            };

            // 첫 번째 시도: 인증 없이 요청
            let response;
            try {
                response = await postApi.searchPosts(params, false);
            } catch (error) {
                // 401 에러가 발생하면 인증이 필요한 것으로 판단하고 재시도
                if (error.response?.status === 401) {
                    console.log('[usePosts] 인증 없는 요청 실패, 인증 포함하여 재시도');
                    response = await postApi.searchPosts(params, true);
                } else {
                    throw error;
                }
            }

            setPosts(response.content || []);
            setPagination({
                totalPages: response.totalPages || 0,
                totalElements: response.totalElements || 0,
                currentPage: (response.page || 0) + 1,
                hasNext: !response.isLast,
                isLast: response.isLast || true,
                hasPrevious: !response.isFirst,
                isFirst: response.isFirst || true
            });

            // 캐시에 저장
            setCachedPosts(prev => new Map(prev).set(cacheKey, {
                data: response,
                timestamp: Date.now()
            }));

            return response;

        } catch (err) {
            console.error('게시글 목록 조회 실패:', err);
            setError(err.message || '게시글을 불러오는데 실패했습니다.');
            setPosts([]);
            setPagination({
                totalPages: 0,
                totalElements: 0,
                currentPage: 1,
                hasNext: false,
                isLast: true,
                hasPrevious: false,
                isFirst: true
            });
        } finally {
            setLoading(false);
        }
    }, [filters, cachedPosts]);

    // 필터 업데이트
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => {
            const updated = { ...prev, ...newFilters };
            // 페이지 관련 필터가 아닌 경우 페이지를 1로 리셋
            if (Object.keys(newFilters).some(key => key !== 'page')) {
                updated.page = 1;
            }
            return updated;
        });
    }, []);

    // 검색
    const searchPosts = useCallback(async (keyword, type = null) => {
        const searchFilters = {
            ...filters,
            keyword: keyword || '',
            page: 1,
            ...(type && { type })
        };
        
        setFilters(searchFilters);
        return await fetchPosts(searchFilters);
    }, [filters, fetchPosts]);

    // 페이지 변경
    const changePage = useCallback(async (page) => {
        const newFilters = { ...filters, page };
        setFilters(newFilters);
        return await fetchPosts(newFilters);
    }, [filters, fetchPosts]);

    // 게시글 타입 변경
    const changePostType = useCallback(async (type) => {
        const newFilters = { ...filters, type, page: 1 };
        setFilters(newFilters);
        return await fetchPosts(newFilters);
    }, [filters, fetchPosts]);

    // 새로고침
    const refreshPosts = useCallback(async () => {
        // 캐시 클리어
        setCachedPosts(new Map());
        return await fetchPosts(filters);
    }, [filters, fetchPosts]);

    // 캐시 클리어
    const clearCache = useCallback(() => {
        setCachedPosts(new Map());
    }, []);

    // 특정 게시글 추가 (작성 후)
    const addPost = useCallback((newPost) => {
        setPosts(prev => [newPost, ...prev]);
        setPagination(prev => ({
            ...prev,
            totalElements: prev.totalElements + 1
        }));
        // 캐시 클리어 (새 게시글로 인해 페이지네이션이 변경될 수 있음)
        clearCache();
    }, [clearCache]);

    // 특정 게시글 업데이트 (수정 후)
    const updatePost = useCallback((postId, updatedPost) => {
        setPosts(prev => prev.map(post => 
            post.postId === postId ? { ...post, ...updatedPost } : post
        ));
        // 관련 캐시 클리어
        clearCache();
    }, [clearCache]);

    // 특정 게시글 제거 (삭제 후)
    const removePost = useCallback((postId) => {
        setPosts(prev => prev.filter(post => post.postId !== postId));
        setPagination(prev => ({
            ...prev,
            totalElements: Math.max(0, prev.totalElements - 1)
        }));
        // 캐시 클리어
        clearCache();
    }, [clearCache]);

    // 에러 클리어
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // 초기 로드
    useEffect(() => {
        fetchPosts();
    }, []); // 최초 한 번만 실행

    return {
        // 데이터
        posts,
        pagination,
        filters,
        
        // 상태
        loading,
        error,
        
        // 액션
        fetchPosts,
        searchPosts,
        changePage,
        changePostType,
        updateFilters,
        refreshPosts,
        clearCache,
        
        // 개별 게시글 관리
        addPost,
        updatePost,
        removePost,
        
        // 유틸리티
        clearError,
        
        // 계산된 값
        hasNextPage: pagination.hasNext,
        hasPreviousPage: pagination.hasPrevious,
        isEmpty: posts.length === 0 && !loading,
        isFirstPage: pagination.isFirst,
        isLastPage: pagination.isLast
    };
};

export default usePosts;
