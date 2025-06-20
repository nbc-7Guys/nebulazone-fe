import React, { useState, useEffect } from 'react';
import { commentApi } from '../services/api';
import { getMyUserIdFromJwt } from '../utils/auth';

export default function CommentForm({ 
    postId, 
    parentId = null, 
    editingComment = null, 
    onCommentCreated, 
    onCommentUpdated, 
    onCancel 
}) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const currentUserId = getMyUserIdFromJwt();

    // 수정 모드일 때 기존 내용 설정
    useEffect(() => {
        if (editingComment) {
            setContent(editingComment.content);
        }
    }, [editingComment]);

    // 댓글 제출
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!content.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        if (!currentUserId) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            setIsSubmitting(true);

            if (editingComment) {
                // 댓글 수정
                const response = await commentApi.updateComment(postId, editingComment.commentId, {
                    content: content.trim()
                });
                onCommentUpdated?.(response);
                setContent('');
            } else {
                // 댓글 작성
                const response = await commentApi.createComment(postId, {
                    content: content.trim(),
                    parentId: parentId
                });
                onCommentCreated?.(response);
                setContent('');
            }
        } catch (error) {
            console.error('댓글 처리 실패:', error);
            alert(error.message || '댓글 처리에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 취소
    const handleCancel = () => {
        setContent('');
        onCancel?.();
    };

    if (!currentUserId) {
        return (
            <div style={{
                padding: '16px',
                backgroundColor: '#f7fafc',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#718096',
                fontSize: '14px'
            }}>
                댓글을 작성하려면 로그인이 필요합니다.
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{
            padding: editingComment ? '16px' : '20px',
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            marginBottom: '16px'
        }}>
            <div style={{ marginBottom: '12px' }}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={parentId ? '대댓글을 입력하세요...' : '댓글을 입력하세요...'}
                    rows={parentId ? 3 : 4}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        resize: 'vertical',
                        minHeight: parentId ? '80px' : '100px',
                        maxLength: 1000, // 댓글 최대 길이 제한
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = '#38d39f';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                    }}
                />
            </div>
            
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{
                    fontSize: '12px',
                    color: '#718096'
                }}>
                    {content.length}/1,000자
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                    {(editingComment || parentId) && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#f7fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#4a5568',
                                cursor: 'pointer'
                            }}
                        >
                            취소
                        </button>
                    )}
                    
                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: content.trim() ? '#38d39f' : '#e2e8f0',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            color: content.trim() ? '#fff' : '#a0aec0',
                            cursor: content.trim() ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {isSubmitting ? '처리 중...' : (editingComment ? '수정' : '댓글 작성')}
                    </button>
                </div>
            </div>
        </form>
    );
}
