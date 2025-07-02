import { jwtDecode } from "jwt-decode";
import { JwtManager } from "../../services/managers/JwtManager";

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

// JWT 토큰에서 roles 추출
export function getRolesFromJwt() {
    const jwt = JwtManager.getJwt();
    if (!jwt) return [];
    try {
        const decoded = jwtDecode(jwt);
        return decoded.roles || decoded.authorities || [];
    } catch (error) {
        console.error('JWT decode error:', error);
        return [];
    }
}

// 특정 권한을 가지고 있는지 확인
export function hasRole(requiredRole) {
    const roles = getRolesFromJwt();
    return roles.includes(requiredRole);
}

// 관리자 권한 확인
export function isAdmin() {
    return hasRole('ROLE_ADMIN');
}

// 사용자 권한 확인
export function isUser() {
    return hasRole('ROLE_USER');
}

// 현재 사용자의 모든 권한 가져오기
export function getCurrentUserRoles() {
    return getRolesFromJwt();
}
