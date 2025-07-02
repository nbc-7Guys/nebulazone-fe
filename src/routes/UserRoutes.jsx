import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import ProductListPage from '../pages/ProductListPage';
import DirectProductDetailPage from '../pages/DirectProductDetailPage';
import ProductCreatePage from '../pages/ProductCreatePage';
import MyPage from '../pages/MyPage';
import ChatRoomPage from '../pages/ChatRoomPage';
import ChatRoomListPage from '../pages/ChatRoomListPage';
import SignUpPage from '../pages/SignUpPage';
import LoginPage from '../pages/LoginPage';
import TransactionHistoryPage from '../pages/TransactionHistoryPage';
import PostListPage from '../pages/PostListPage';
import PostDetailPage from '../pages/PostDetailPage';
import PostCreatePage from '../pages/PostCreatePage';
import PostEditPage from '../pages/PostEditPage';
import AuctionProductDetailPage from '../pages/AuctionProductDetailPage';
import TossPaymentSuccessPage from '../pages/TossPaymentSuccessPage';
import CatalogDetailPage from '../pages/CatalogDetailPage';
import CatalogListPage from '../pages/CatalogListPage';
import PointManagementPage from '../pages/PointManagementPage';
import OAuthRedirectPage from '../pages/OAuthRedirectPage';
import PrivateRoute from '../components/common/PrivateRoute';

/**
 * 일반 사용자용 라우트들
 * 메인 애플리케이션의 모든 사용자 기능들을 관리
 */
const UserRoutes = () => {
    return (
        <Routes>
            {/* 메인 페이지 */}
            <Route path="/" element={<LandingPage />} />

            {/* 상품 관련 라우트 */}
            <Route path="/products/direct" element={<ProductListPage />} />
            <Route path="/products/auction" element={<ProductListPage />} />
            <Route path="/products/create" element={
                <PrivateRoute>
                    <ProductCreatePage />
                </PrivateRoute>
            } />
            <Route path="/products/direct/:id" element={<DirectProductDetailPage />} />
            <Route path="/products/auction/:id" element={<AuctionProductDetailPage />} />
            
            {/* 카탈로그 관련 라우트 */}
            <Route path="/catalogs" element={<CatalogListPage />} />
            <Route path="/catalogs/:catalogId" element={<CatalogDetailPage />} />

            {/* 게시글 관련 라우트 */}
            <Route path="/posts" element={<PostListPage />} />
            <Route path="/posts/create" element={
                <PrivateRoute>
                    <PostCreatePage />
                </PrivateRoute>
            } />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/posts/:postId/edit" element={
                <PrivateRoute>
                    <PostEditPage />
                </PrivateRoute>
            } />

            {/* 사용자 관련 라우트 */}
            <Route path="/mypage" element={
                <PrivateRoute>
                    <MyPage />
                </PrivateRoute>
            } />
            <Route path="/signup" element={
                <PrivateRoute requireAuth={false}>
                    <SignUpPage />
                </PrivateRoute>
            } />
            <Route path="/login" element={
                <PrivateRoute requireAuth={false}>
                    <LoginPage />
                </PrivateRoute>
            } />

            {/* 채팅 관련 라우트 */}
            <Route path="/chat/:roomId" element={
                <PrivateRoute>
                    <ChatRoomPage />
                </PrivateRoute>
            } />
            <Route path="/chat/rooms" element={
                <PrivateRoute>
                    <ChatRoomListPage />
                </PrivateRoute>
            } />

            {/* 거래 관련 라우트 */}
            <Route path="/transactions" element={
                <PrivateRoute>
                    <TransactionHistoryPage />
                </PrivateRoute>
            } />

            {/* 포인트 관련 라우트 */}
            <Route path="/points" element={
                <PrivateRoute>
                    <PointManagementPage />
                </PrivateRoute>
            } />

            {/* 소셜 로그인 */}
            <Route path="/oauth/redirect" element={<OAuthRedirectPage />} />

            {/* 포인트 충전 관련 라우트 - 기존 경로를 포인트 관리 페이지로 리다이렉트 */}
            <Route path="/point/charge" element={
                <PrivateRoute>
                    <PointManagementPage />
                </PrivateRoute>
            } />
            <Route path="/toss/success" element={
                <PrivateRoute>
                    <TossPaymentSuccessPage />
                </PrivateRoute>
            } />
        </Routes>
    );
};

export default UserRoutes;