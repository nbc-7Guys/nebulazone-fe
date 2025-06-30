import axios from 'axios';
import { ENV } from "../../utils/env";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_INFO_KEY = "userInfo";

// 이벤트 리스너들
const eventListeners = {
    login: [],
    logout: []
};

export const JwtManager = {
    // 이벤트 리스너 등록
    addEventListener: (event, callback) => {
        if (eventListeners[event]) {
            eventListeners[event].push(callback);
        }
    },

    // 이벤트 리스너 제거
    removeEventListener: (event, callback) => {
        if (eventListeners[event]) {
            const index = eventListeners[event].indexOf(callback);
            if (index > -1) {
                eventListeners[event].splice(index, 1);
            }
        }
    },

    // 이벤트 발생
    _emitEvent: (event, data) => {
        if (eventListeners[event]) {
            eventListeners[event].forEach(callback => callback(data));
        }
    },

    // 토큰 저장
    setJwt: (accessToken) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

        // 로그인 이벤트 발생
        JwtManager._emitEvent('login', { accessToken });
    },

    // 사용자 정보 저장
    setUserInfo: (userInfo) => {
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    },

    // Access Token 조회
    getJwt: () => localStorage.getItem(ACCESS_TOKEN_KEY),
    getToken: () => localStorage.getItem(ACCESS_TOKEN_KEY), // 호환성

    // Refresh Token 조회
    getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

    // 사용자 정보 조회
    getUserInfo: () => {
        const userInfo = localStorage.getItem(USER_INFO_KEY);
        return userInfo ? JSON.parse(userInfo) : null;
    },

    // 토큰 삭제
    removeTokens: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_INFO_KEY);
        
        // 로그아웃 이벤트 발생
        JwtManager._emitEvent('logout');
    },

    // 토큰 유효성 검사
    isTokenValid: () => {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (!token) return false;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp > currentTime;
        } catch {
            return false;
        }
    },

    // 토큰 자동 갱신
    refreshTokenIfNeeded: async () => {
        const isValid = JwtManager.isTokenValid();
        if (!isValid) {
            try {
                const response = await axios.post(`${ENV.API_BASE_URL}/auth/reissue`, {}, {
                    withCredentials: true
                });
                
                if (response.status === 200) {
                    const data = response.data;
                    JwtManager.setJwt(data.accessToken);
                    return true;
                } else {
                    JwtManager.removeTokens();
                    return false;
                }
            } catch (error) {
                console.error('토큰 갱신 실패:', error);
                JwtManager.removeTokens();
                return false;
            }
        }
        return true;
    }
};
