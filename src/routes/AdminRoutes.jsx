import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPointManagementPage from '../pages/AdminPointManagementPage';
import AdminDashboard from '../pages/AdminDashboard';
import AdminBanManagementPage from '../pages/AdminBanManagementPage';
import AdminBanCreatePage from '../pages/AdminBanCreatePage';

/**
 * 관리자 전용 라우트들
 * /admin 경로 하위의 모든 관리자 페이지들을 관리
 */
const AdminRoutes = () => {
    return (
        <Routes>
            {/* 관리자 포인트 관리 */}
            <Route path="/points" element={<AdminPointManagementPage />} />
            <Route path="/ban" element={<AdminBanManagementPage />} />
            <Route path="/ban/create" element={<AdminBanCreatePage />} />
            
            {/* 추후 관리자 기능 추가 시 여기에 라우트 추가 */}
            {/* <Route path="/users" element={<AdminUserManagementPage />} /> */}
            {/* <Route path="/products" element={<AdminProductManagementPage />} /> */}
            {/* <Route path="/orders" element={<AdminOrderManagementPage />} /> */}
            
            {/* 기본 관리자 페이지 (대시보드) */}
            <Route path="/" element={<AdminDashboard />} />
            <Route index element={<AdminDashboard />} />
        </Routes>
    );
};

export default AdminRoutes;