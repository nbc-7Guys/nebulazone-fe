import { apiRequest, publicApiRequest } from './core';

const postApi = {
    // 게시글 생성
    createPost: async (postData, images = []) => {
        const formData = new FormData();
        
        // 게시글 데이터를 JSON 문자열로 변환하여 추가
        formData.append('postData', JSON.stringify(postData));
        
        // 이미지 파일들 추가
        images.forEach((image, index) => {
            formData.append('images', image);
        });

        return await apiRequest('/posts', {
            method: 'POST',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // 게시글 수정
    updatePost: async (postId, postData, images = []) => {
        const formData = new FormData();
        
        // 게시글 데이터를 JSON 문자열로 변환하여 추가
        formData.append('postData', JSON.stringify(postData));
        
        // 이미지 파일들 추가
        images.forEach((image, index) => {
            formData.append('images', image);
        });

        return await apiRequest(`/posts/${postId}`, {
            method: 'PUT',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // 게시글 삭제
    deletePost: async (postId) => {
        return await apiRequest(`/posts/${postId}`, {
            method: 'DELETE'
        });
    },

    // 게시글 검색 (인증 선택적)
    searchPosts: async (params = {}, requireAuth = false) => {
        const queryParams = new URLSearchParams();
        
        if (params.keyword) queryParams.append('keyword', params.keyword);
        if (params.page !== undefined) queryParams.append('page', params.page);
        if (params.size !== undefined) queryParams.append('size', params.size);
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.type) queryParams.append('type', params.type);

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/posts/search?${queryString}` : '/posts/search';
        
        return requireAuth 
            ? await apiRequest(endpoint)
            : await publicApiRequest(endpoint, {}, false);
    },

    // 게시글 상세 조회 (인증 선택적)
    getPost: async (postId, requireAuth = false) => {
        return requireAuth 
            ? await apiRequest(`/posts/${postId}`)
            : await publicApiRequest(`/posts/${postId}`, {}, false);
    }
};

export { postApi };