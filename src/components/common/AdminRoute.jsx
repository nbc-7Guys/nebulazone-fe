import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin, getCurrentUserRoles } from '../../utils/auth/auth';
import { JwtManager } from '../../services/managers/JwtManager';

/**
 * 관리자 권한 체크 컴포넌트
 * ROLE_ADMIN 권한이 있는 사용자만 접근 가능
 */
const AdminRoute = ({ children }) => {
    const isAuthenticated = !!JwtManager.getJwt();
    const hasAdminRole = isAdmin();
    const userRoles = getCurrentUserRoles();

    console.log('AdminRoute 체크:', {
        isAuthenticated,
        hasAdminRole,
        userRoles,
        jwt: JwtManager.getJwt()?.substring(0, 50) + '...'
    });

    // 로그인하지 않은 경우 로그인 페이지로
    if (!isAuthenticated) {
        console.log('인증되지 않음 - 로그인 페이지로 이동');
        return <Navigate to="/login" replace />;
    }

    // 관리자 권한이 없는 경우 메인 페이지로
    if (!hasAdminRole) {
        console.log('관리자 권한 없음 - 메인 페이지로 이동');
        return <Navigate to="/" replace />;
    }

    console.log('관리자 권한 확인됨 - 페이지 렌더링');
    // 관리자 권한이 있는 경우 해당 컴포넌트 렌더링
    return children;
};

export default AdminRoute;