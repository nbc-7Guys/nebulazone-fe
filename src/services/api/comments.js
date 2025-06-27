import { apiRequest } from './core';

const commentApi = {
    // 댓글 생성
    createComment: async (postId, commentData) => {
        return await apiRequest(`/posts/${postId}/comments`, {
            method: 'POST',
            data: commentData
        });
    },

    // 댓글 목록 조회
    getComments: async (postId, page = 0, size = 10) => {
        return await apiRequest(`/posts/${postId}/comments?page=${page}&size=${size}`);
    },

    // 댓글 수정
    updateComment: async (postId, commentId, commentData) => {
        return await apiRequest(`/posts/${postId}/comments/${commentId}`, {
            method: 'PUT',
            data: commentData
        });
    },

    // 댓글 삭제
    deleteComment: async (postId, commentId) => {
        return await apiRequest(`/posts/${postId}/comments/${commentId}`, {
            method: 'DELETE'
        });
    }
};

export { commentApi };