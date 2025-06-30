import { apiRequest, publicApiRequest, ErrorHandler, axiosInstance } from './core';

const postApi = {
    // 게시글 작성 (JSON만, 이미지 제외)
    createPost: async (postData) => {
        try {
            const response = await apiRequest('/posts', {
                method: 'POST',
                data: {
                    title: postData.title,
                    content: postData.content,
                    type: postData.type
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            }, true); // 인증 필요
            return response;
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 게시글 이미지 업로드
    uploadPostImages: async (postId, images, postData = {}) => {
        if (!images || images.length === 0) {
            return null;
        }

        const formData = new FormData();
        
        // 빈 post 데이터라도 서버에서 요구하므로 추가
        const postBlob = new Blob([JSON.stringify(postData)], {
            type: 'application/json'
        });
        formData.append('post', postBlob);

        // 이미지 파일들 추가
        images.forEach(image => {
            formData.append('images', image);
        });

        try {
            const response = await axiosInstance.put(`/posts/${postId}/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 게시글 수정 (인증 필요)
    updatePost: async (postId, postData, images) => {
        const formData = new FormData();

        // JSON 파트에 Content-Type 명시적으로 설정
        const postBlob = new Blob([JSON.stringify(postData)], {
            type: 'application/json'
        });
        formData.append('post', postBlob);

        // 이미지 파일들 추가
        if (images && images.length > 0) {
            images.forEach(image => {
                formData.append('images', image);
            });
        }

        try {
            const response = await axiosInstance.put(`/posts/${postId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 게시글 삭제 (인증 필요)
    deletePost: async (postId) => {
        try {
            return await apiRequest(`/posts/${postId}`, {
                method: 'DELETE',
            }, true); // 인증 필요
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 게시글 목록 검색 (인증 여부를 매개변수로 받음)
    searchPosts: (params = {}, requireAuth = true) => {
        const queryParams = new URLSearchParams();

        // 검색 키워드
        if (params.keyword) queryParams.append('keyword', params.keyword);

        // 게시글 타입 (필수)
        if (params.type) queryParams.append('type', params.type);

        // 페이지네이션
        if (params.page) queryParams.append('page', params.page);
        if (params.size) queryParams.append('size', params.size);

        const query = queryParams.toString();
        return apiRequest(`/posts${query ? `?${query}` : ''}`, {}, requireAuth);
    },

    // 게시글 상세 조회 (인증 여부를 매개변수로 받음)
    getPost: (postId, requireAuth = true) =>
        apiRequest(`/posts/${postId}`, {}, requireAuth),
};

export { postApi };