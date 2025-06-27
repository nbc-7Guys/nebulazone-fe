import { apiRequest, publicApiRequest } from './core';

const authApi = {
    // 로그인
    signIn: async (email, password) => {
        return await publicApiRequest('/auth/signin', {
            method: 'POST',
            data: { email, password }
        });
    },

    // 로그아웃
    signOut: async () => {
        return await apiRequest('/auth/signout', {
            method: 'POST'
        });
    },

    // 토큰 재발급
    reissueToken: async () => {
        return await publicApiRequest('/auth/reissue', {
            method: 'POST'
        });
    },

    // 회원가입
    signUp: async (userData) => {
        return await publicApiRequest('/auth/signup', {
            method: 'POST',
            data: userData
        });
    }
};

export { authApi };