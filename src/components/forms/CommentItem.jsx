import React, { useState } from 'react';
import CommentForm from './CommentForm';
import { commentApi } from '../../services/api';
import { getMyUserIdFromJwt } from '../../utils/auth/auth';

export default function CommentItem({ 
    comment, 
    postId, 
    onCommentUpdated, 
    onCommentDeleted, 
    onReplyCreated,
    isReply = false,
    currentUserNickname = null // 현재 사용자 닉네임을 props로 받음
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const currentUserId = getMyUserIdFromJwt();
    // 닉네임으로 작성자 확인 (서버에서 사용자 정보를 추가로 제공할 때까지 임시)
    const isAuthor = currentUserNickname && currentUserNickname === comment.author;

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return diffInMinutes < 1 ? '방금 전' : `${diffInMinutes}분 전`;
        } else if (diffInHours < 24) {
            return `${diffInHours}시간 전`;
        } else {
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    };

    // 댓글 삭제
    const handleDelete = async () => {
        if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
            return;
        }

        try {
            setIsDeleting(true);
            await commentApi.deleteComment(postId, comment.commentId);
            onCommentDeleted?.(comment.commentId);
        } catch (error) {
            console.error('댓글 삭제 실패:', error);
            alert(error.message || '댓글 삭제에 실패했습니다.');
        } finally {
            setIsDeleting(false);
        }
    };

    // 댓글 수정 완료
    const handleCommentUpdated = (updatedComment) => {
        setIsEditing(false);
        onCommentUpdated?.(updatedComment);
    };

    // 대댓글 작성 완료
    const handleReplyCreated = (newReply) => {
        setIsReplying(false);
        onReplyCreated?.(newReply);
    };

    // 내용 포맷팅 (줄바꿈 처리)
    const formatContent = (content) => {
        return content.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                {index < content.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    return (
        <div style={{
            marginBottom: '12px'
        }}>
            <div style={{
                backgroundColor: '#fff',
                border: isReply ? '1px solid #e6fffa' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px'
            }}>
                {/* 댓글 헤더 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{
                            fontWeight: '500',
                            color: isReply ? '#38d39f' : '#2d3748',
                            fontSize: '14px'
                        }}>
                            {isReply && '↳ '}{comment.author}
                        </span>
                        <span style={{
                            color: '#718096',
                            fontSize: '12px'
                        }}>
                            {formatDate(comment.createdAt)}
                        </span>
                        {comment.modifiedAt && comment.modifiedAt !== comment.createdAt && (
                            <span style={{
                                color: '#a0aec0',
                                fontSize: '11px'
                            }}>
                                (수정됨)
                            </span>
                        )}
                    </div>

                    {isAuthor && !isEditing && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{
                                    padding: '4px 8px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: '#718096',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#f7fafc';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                }}
                            >
                                수정
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                style={{
                                    padding: '4px 8px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: '#e53e3e',
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    opacity: isDeleting ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!isDeleting) {
                                        e.target.style.backgroundColor = '#fed7d7';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                }}
                            >
                                {isDeleting ? '삭제 중...' : '삭제'}
                            </button>
                        </div>
                    )}
                </div>

                {/* 댓글 내용 */}
                {isEditing ? (
                    <CommentForm
                        postId={postId}
                        editingComment={comment}
                        onCommentUpdated={handleCommentUpdated}
                        onCancel={() => setIsEditing(false)}
                    />
                ) : (
                    <>
                        <div style={{
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: '#2d3748',
                            marginBottom: '12px'
                        }}>
                            {formatContent(comment.content)}
                        </div>

                        {/* 대댓글 버튼 (최상위 댓글에만 표시) */}
                        {!isReply && currentUserId && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setIsReplying(!isReplying)}
                                    style={{
                                        padding: '4px 8px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        color: '#38d39f',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#e6fffa';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    {isReplying ? '답글 취소' : '답글'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* 대댓글 작성 폼 */}
            {isReplying && (
                <div style={{ 
                    marginTop: '12px',
                    padding: '16px',
                    backgroundColor: '#f7fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                }}>
                    <CommentForm
                        postId={postId}
                        parentId={comment.commentId}
                        onCommentCreated={handleReplyCreated}
                        onCancel={() => setIsReplying(false)}
                    />
                </div>
            )}
        </div>
    );
}
