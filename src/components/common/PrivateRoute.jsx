import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { JwtManager } from '../../services/managers/JwtManager';

export default function PrivateRoute({ children, requireAuth = true, redirectTo = '/login' }) {
    const location = useLocation();
    const isAuthenticated = !!JwtManager.getJwt();

    if (requireAuth && !isAuthenticated) {
        // 로그인 후 원래 페이지로 돌아가기 위해 현재 경로를 state에 저장
        return <Navigate 
            to={redirectTo} 
            state={{ from: location.pathname + location.search }} 
            replace 
        />;
    }

    if (!requireAuth && isAuthenticated) {
        // 이미 로그인된 사용자가 로그인/회원가입 페이지 접근 시 홈으로 리다이렉트
        return <Navigate to="/" replace />;
    }

    return children;
}
