import { apiRequest, publicApiRequest, ErrorHandler } from './core';
import axios from 'axios';
import { ENV } from '../../utils/env';

const BASE_URL = ENV.API_BASE_URL;

const authApi = {
    // 로그인
    signIn: async (email, password) => {
        try {
            return await apiRequest('/auth/signin', {
                method: 'POST',
                data: {email, password},
            }, false); // 로그인은 인증이 필요 없음
        } catch (error) {
            // 로그인 실패 시 구체적인 메시지 표시
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 로그아웃
    signOut: () =>
        apiRequest('/auth/signout', {
            method: 'POST',
        }),

    // 토큰 재발급
    reissueToken: async () => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/reissue`, {}, {
                withCredentials: true, // 쿠키 포함
            });
            return response.data;
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message || '토큰 재발급 실패');
        }
    },

    // 회원가입
    signUp: async (userData) => {
        try {
            return await apiRequest('/users/signup', {
                method: 'POST',
                data: userData,
            });
        } catch (error) {
            // 회원가입 실패 시 구체적인 메시지 표시
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },
};

export { authApi };