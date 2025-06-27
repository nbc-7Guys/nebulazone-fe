import { apiRequest, ErrorHandler } from './core';

const commentApi = {
    // 댓글 작성
    createComment: async (postId, commentData) => {
        try {
            return await apiRequest(`/posts/${postId}/comments`, {
                method: 'POST',
                data: commentData,
            }, true); // 인증 필요
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 댓글 목록 조회
    getComments: (postId, page = 1, size = 20) => {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('size', size.toString());

        return apiRequest(`/posts/${postId}/comments?${queryParams.toString()}`, {}, true);
    },

    // 댓글 수정
    updateComment: async (postId, commentId, commentData) => {
        try {
            return await apiRequest(`/posts/${postId}/comments/${commentId}`, {
                method: 'PUT',
                data: commentData,
            }, true); // 인증 필요
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 댓글 삭제
    deleteComment: async (postId, commentId) => {
        try {
            return await apiRequest(`/posts/${postId}/comments/${commentId}`, {
                method: 'DELETE',
            }, true); // 인증 필요
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },
};

export { commentApi };