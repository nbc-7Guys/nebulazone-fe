import { jwtDecode } from "jwt-decode";
import { JwtManager } from "./JwtManager";

export function getMyUserIdFromJwt() {
    const jwt = JwtManager.getJwt();
    if (!jwt) return null;
    try {
        const decoded = jwtDecode(jwt);
        return decoded.jti;
    } catch {
        return null;
    }
}

export function getMyEmailFromJwt() {
    const jwt = JwtManager.getJwt();
    if (!jwt) return null;
    try {
        const decoded = jwtDecode(jwt);
        // JWT에서 이메일을 찾는 여러 시도
        return decoded.email || decoded.sub || decoded.username || null;
    } catch (error) {
        console.error('JWT decode error:', error);
        return null;
    }
}
