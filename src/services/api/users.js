import {apiRequest, ErrorHandler} from './core';
import {getMyUserIdFromJwt} from "../../utils/auth/index.js";

const userApi = {
    // 내 프로필 조회
    getMyProfile: async () => {
        const userId = getMyUserIdFromJwt();
        if (!userId) {
            throw new Error('로그인이 필요합니다.');
        }
        try {
            return await apiRequest(`/users/${userId}`);
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 특정 사용자 프로필 조회
    getUserProfile: async (userId) => {
        return await apiRequest(`/users/${userId}`);
    },

    // 프로필 업데이트 (닉네임/비밀번호)
    updateProfile: async (userData) => {
        try {
            return await apiRequest('/users', {
                method: 'PATCH',
                data: userData,
            });
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 프로필 이미지 업데이트
    updateProfileImage: async (imageFile) => {
        const formData = new FormData();
        formData.append('profileImage', imageFile);

        try {
            const response = await apiRequest('/users/me/image', {
                method: 'PUT',
                data: formData
            });
            return response.data;
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },


    // 회원 탈퇴
    withdraw: async (password) => {
        return await apiRequest('/users', {
            method: 'DELETE',
            data: {password}
        });
    },

    addAddress: async (address) => {
        return await apiRequest('/users/me/address', {
            method: 'POST',
            data: address
        });
    },

    updateAddress: async (updateRequest) => {
        try {
            return await apiRequest('/users/me/address', {
                method: 'PUT',
                data: updateRequest
            });
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    deleteAddress: async (address) => {
        try {
            return await apiRequest(`/users/me/address`, {
                method: 'DELETE',
                data: address
            });
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

};

export {userApi};