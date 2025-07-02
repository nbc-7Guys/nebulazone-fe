import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserRoutes from './UserRoutes';
import AdminRoutes from './AdminRoutes';
import AdminDashboard from '../pages/AdminDashboard';
import AdminRoute from '../components/common/AdminRoute';

/**
 * 관리자 경로 상수
 */
export const ADMIN_PATH = '/admin';

/**
 * 글로벌 라우터
 * 사용자와 관리자 라우트를 분리해서 관리
 */
const GlobalRoutes = () => {
    return (
        <Routes>
            {/* 관리자 대시보드 진입점 */}
            <Route
                path="/nebulazone-admin"
                element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                }
            />

            {/* 관리자 전용 라우트 */}
            <Route
                path={`${ADMIN_PATH}/*`}
                element={
                    <AdminRoute>
                        <AdminRoutes />
                    </AdminRoute>
                }
            />
            
            {/* 일반 사용자 라우트 (모든 경로) */}
            <Route path="/*" element={<UserRoutes />} />
        </Routes>
    );
};

export default GlobalRoutes;