import React, { useState, useEffect } from 'react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { commentApi } from '../../services/api';
import { getMyUserIdFromJwt } from '../../utils/auth/auth';
import { userApi } from '../../services/api';

export default function CommentList({ postId }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [hasNext, setHasNext] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [currentUserNickname, setCurrentUserNickname] = useState(null);

    const currentUserId = getMyUserIdFromJwt();

    // 현재 사용자 정보 로드
    useEffect(() => {
        const loadUserInfo = async () => {
            if (currentUserId) {
                try {
                    const userInfo = await userApi.getMyProfile();
                    setCurrentUserNickname(userInfo.nickname);
                } catch (error) {
                    console.error('사용자 정보 로드 실패:', error);
                }
            }
        };

        loadUserInfo();
    }, [currentUserId]);

    // 댓글 목록 로드
    const loadComments = async (page = 1, isAppend = false) => {
        try {
            if (isAppend) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            setError('');

            const response = await commentApi.getComments(postId, page, 20);
            
            if (isAppend) {
                setComments(prev => [...prev, ...response.content]);
            } else {
                setComments(response.content);
            }
            
            setHasNext(response.hasNext);
            setCurrentPage(page);
            setTotalElements(response.totalElements);
            
        } catch (error) {
            console.error('댓글 로드 실패:', error);
            setError('댓글을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // 초기 댓글 로드
    useEffect(() => {
        if (postId) {
            loadComments(1, false);
        }
    }, [postId]);

    // 더 많은 댓글 로드
    const loadMoreComments = () => {
        if (hasNext && !loadingMore) {
            loadComments(currentPage + 1, true);
        }
    };

    // 댓글 작성 성공 핸들러
    const handleCommentCreated = (newComment) => {
        // 새 댓글이 추가되면 전체 목록을 다시 로드하여 최신 상태 반영
        loadComments(1, false);
    };

    // 댓글 수정 성공 핸들러
    const handleCommentUpdated = (updatedComment) => {
        // 댓글이 수정되면 전체 목록을 다시 로드
        loadComments(1, false);
    };

    // 댓글 삭제 성공 핸들러
    const handleCommentDeleted = (commentId) => {
        // 댓글이 삭제되면 전체 목록을 다시 로드
        loadComments(1, false);
    };

    // 대댓글 작성 성공 핸들러
    const handleReplyCreated = () => {
        // 대댓글이 추가되면 전체 목록을 다시 로드
        loadComments(1, false);
    };

    if (loading) {
        return (
            <div style={{
                padding: '40px 20px',
                textAlign: 'center'
            }}>
                <LoadingSpinner size="medium" message="댓글을 불러오는 중..." />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <ErrorMessage
                    message={error}
                    onRetry={() => loadComments(1, false)}
                    retryText="다시 불러오기"
                />
            </div>
        );
    }

    return (
        <div style={{
            marginTop: '40px',
            padding: '0 20px'
        }}>
            {/* 댓글 헤더 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid #e2e8f0'
            }}>
                <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#2d3748',
                    margin: '0'
                }}>
                    댓글 {totalElements.toLocaleString()}개
                </h3>
            </div>

            {/* 댓글 작성 폼 */}
            <CommentForm
                postId={postId}
                onCommentCreated={handleCommentCreated}
            />

            {/* 댓글 목록 */}
            {comments.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#718096'
                }}>
                    <div style={{
                        fontSize: '48px',
                        marginBottom: '16px'
                    }}>
                        💬
                    </div>
                    <p style={{
                        fontSize: '16px',
                        margin: '0'
                    }}>
                        아직 댓글이 없습니다.<br />
                        첫 번째 댓글을 작성해보세요!
                    </p>
                </div>
            ) : (
                <div style={{ marginTop: '24px' }}>
                    {comments.map((comment) => (
                        <div key={comment.commentId}>
                            {/* 부모 댓글 */}
                            <CommentItem
                                comment={comment}
                                postId={postId}
                                onCommentUpdated={handleCommentUpdated}
                                onCommentDeleted={handleCommentDeleted}
                                onReplyCreated={handleReplyCreated}
                                currentUserNickname={currentUserNickname}
                                isReply={false}
                            />
                            
                            {/* 대댓글들 (children 사용) */}
                            {comment.children && comment.children.length > 0 && (
                                <div style={{
                                    marginLeft: '20px',
                                    borderLeft: '2px solid #e2e8f0',
                                    paddingLeft: '20px',
                                    marginTop: '8px'
                                }}>
                                    {comment.children.map((reply) => (
                                        <CommentItem
                                            key={reply.commentId}
                                            comment={reply}
                                            postId={postId}
                                            onCommentUpdated={handleCommentUpdated}
                                            onCommentDeleted={handleCommentDeleted}
                                            onReplyCreated={handleReplyCreated}
                                            currentUserNickname={currentUserNickname}
                                            isReply={true}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* 더보기 버튼 */}
            {hasNext && (
                <div style={{
                    textAlign: 'center',
                    marginTop: '32px',
                    paddingTop: '24px',
                    borderTop: '1px solid #e2e8f0'
                }}>
                    <button
                        onClick={loadMoreComments}
                        disabled={loadingMore}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: loadingMore ? '#e2e8f0' : '#f7fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: loadingMore ? '#a0aec0' : '#4a5568',
                            cursor: loadingMore ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!loadingMore) {
                                e.target.style.backgroundColor = '#edf2f7';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loadingMore) {
                                e.target.style.backgroundColor = '#f7fafc';
                            }
                        }}
                    >
                        {loadingMore ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid #e2e8f0',
                                    borderTop: '2px solid #38d39f',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                댓글 불러오는 중...
                            </span>
                        ) : (
                            `댓글 더보기 (${comments.length}/${totalElements})`
                        )}
                    </button>
                </div>
            )}

            {/* 스피너 애니메이션 */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
