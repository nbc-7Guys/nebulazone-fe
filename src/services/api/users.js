import { apiRequest } from './core';

const userApi = {
    // 내 프로필 조회
    getMyProfile: async () => {
        return await apiRequest('/users/me');
    },

    // 특정 사용자 프로필 조회
    getUserProfile: async (userId) => {
        return await apiRequest(`/users/${userId}`);
    },

    // 프로필 업데이트 (닉네임/비밀번호)
    updateProfile: async (userData) => {
        return await apiRequest('/users/me', {
            method: 'PUT',
            data: userData
        });
    },

    // 프로필 이미지 업데이트
    updateProfileImage: async (imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        return await apiRequest('/users/me/image', {
            method: 'PUT',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // 회원 탈퇴
    withdraw: async (password) => {
        return await apiRequest('/users/me', {
            method: 'DELETE',
            data: { password }
        });
    }
};

export { userApi };