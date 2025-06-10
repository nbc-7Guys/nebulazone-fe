const JWT_KEY = "jwt";
const REFRESH_KEY = "refreshToken";

export const JwtManager = {
    setTokens: ({ accessToken, refreshToken }) => {
        localStorage.setItem(JWT_KEY, accessToken);
        if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    },
    setJwt: (jwt) => localStorage.setItem(JWT_KEY, jwt),
    getJwt: () => localStorage.getItem(JWT_KEY),
    getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
    removeTokens: () => {
        localStorage.removeItem(JWT_KEY);
        localStorage.removeItem(REFRESH_KEY);
    }
};
