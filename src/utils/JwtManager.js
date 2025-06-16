import { ENV } from "./env";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const JwtManager = {
    // 토큰 저장
    setJwt: (accessToken, refreshToken) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
    },

    // Access Token 조회
    getJwt: () => localStorage.getItem(ACCESS_TOKEN_KEY),

    // Refresh Token 조회
    getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

    // 토큰 삭제
    removeTokens: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
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
                const response = await fetch(`${ENV.API_BASE_URL}/auth/reissue`, {
                    method: 'POST',
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const data = await response.json();
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
