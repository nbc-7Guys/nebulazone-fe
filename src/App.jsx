import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ProductListPage from "./pages/ProductListPage";
import DirectProductDetailPage from "./pages/DirectProductDetailPage.jsx";
import ProductCreatePage from "./pages/ProductCreatePage";
import MyPage from "./pages/MyPage";
import ChatRoomPage from "./pages/ChatRoomPage";
import ChatRoomListPage from "./pages/ChatRoomListPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";
import PostListPage from "./pages/PostListPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostCreatePage from "./pages/PostCreatePage";
import PostEditPage from "./pages/PostEditPage";
import PrivateRoute from "./components/common/PrivateRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { JwtManager } from "./services/managers/JwtManager";
import { useWebSocket } from "./hooks/useWebSocket";
import { NotificationProvider, useNotificationContext } from "./contexts/NotificationContext";
import { ToastProvider, useToastContext } from "./contexts/ToastContext";
import { ToastManager } from "./utils/error/errorHandler";
import ToastDemo from "./components/ui/ToastDemo";
import WebSocketStatus from "./components/common/WebSocketStatus";
import AuctionProductDetailPage from "./pages/AuctionProductDetailPage.jsx";
import TossPaymenrSuccesspage from "./pages/TossPaymenrSuccesspage.jsx";
import CatalogDetailPage from "./pages/CatalogDetailPage.jsx";
import CatalogListPage from "./pages/CatalogListPage.jsx";

// Toast Manager 초기화 컴포넌트
function ToastManagerInitializer({ children }) {
    const toastContext = useToastContext();
    
    useEffect(() => {
        // ToastManager에 Toast 인스턴스 설정
        ToastManager.setToastInstance({
            success: (message, title) => toastContext.toast.success(message, { title }),
            error: (message, title) => toastContext.toast.error(message, { title }),
            warning: (message, title) => toastContext.toast.warning(message, { title }),
            info: (message, title) => toastContext.toast.info(message, { title })
        });
    }, [toastContext]);
    
    return children;
}

// WebSocket 및 알림 관리 컴포넌트
function WebSocketProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { connect, disconnect, isConnected } = useWebSocket();
    const {
        subscribeToNotifications,
        unsubscribeFromNotifications,
        requestNotificationPermission
    } = useNotificationContext();
    const location = useLocation();

    // 인증 상태 체크
    useEffect(() => {
        const checkAuthStatus = () => {
            const token = JwtManager.getToken();
            // const userInfo = JwtManager.getUserInfo(); // 현재 사용하지 않음

            // 임시: 토큰만 있어도 인증된 것으로 처리 (userInfo가 없을 수 있음)
            const newAuthStatus = !!token;


            if (newAuthStatus !== isAuthenticated) {
                setIsAuthenticated(newAuthStatus);
            }
        };

        // 초기 체크
        checkAuthStatus();

        // JwtManager 이벤트 리스너 등록
        const handleLogin = () => {
            setIsAuthenticated(true);
        };

        const handleLogout = () => {
            setIsAuthenticated(false);
        };

        JwtManager.addEventListener('login', handleLogin);
        JwtManager.addEventListener('logout', handleLogout);

        // 토큰 변경 감지를 위한 이벤트 리스너 (다른 탭에서의 변경사항)
        const handleStorageChange = (e) => {
            if (e.key === 'accessToken' || e.key === 'userInfo') {
                checkAuthStatus();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // 페이지 이동 시에도 체크 (SPA에서 storage 이벤트가 발생하지 않을 수 있음)
        checkAuthStatus();

        return () => {
            JwtManager.removeEventListener('login', handleLogin);
            JwtManager.removeEventListener('logout', handleLogout);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [location.pathname, isAuthenticated]);

    // WebSocket 연결 관리
    useEffect(() => {
        const initializeWebSocket = async () => {
            if (isAuthenticated && !isConnected()) {
                try {

                    // 브라우저 알림 권한 요청
                    await requestNotificationPermission();

                    // WebSocket 연결
                    const connected = await connect();

                    if (connected) {

                        // 알림 구독
                        await subscribeToNotifications();
                    }
                } catch (error) {
                    console.error('[App] Failed to initialize WebSocket:', error);
                }
            } else if (!isAuthenticated && isConnected()) {
                console.log('[App] User logged out, disconnecting WebSocket...');
                unsubscribeFromNotifications();
                disconnect();
            }
        };

        initializeWebSocket();
    }, [isAuthenticated, connect, disconnect, isConnected, subscribeToNotifications, unsubscribeFromNotifications, requestNotificationPermission]);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            if (isConnected()) {
                unsubscribeFromNotifications();
                disconnect();
            }
        };
    }, [disconnect, unsubscribeFromNotifications, isConnected]);

    // 페이지 새로고침 시에는 웹소켓을 끊지 않음 (자동 재연결 활용)
    // beforeunload에서 disconnect하면 새로고침 후 재연결이 어려워짐

    return children;
}
import AdminPointManagementPage from "./pages/AdminPointManagementPage";
import PointManagementPage from "./pages/PointManagementPage";
import OAuthRedirectPage from "./pages/OAuthRedirectPage";

function App() {
    

    return (
        <BrowserRouter>
            <ToastProvider position="top-right">
                <ToastManagerInitializer>
                    <NotificationProvider>
                        <WebSocketProvider>
                        <ErrorBoundary>
                            <Routes>
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

                                {/* 관리자 관련 라우트 */}
                                <Route path="/admin/points" element={
                                    <PrivateRoute>
                                        <AdminPointManagementPage />
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
                                        <TossPaymenrSuccesspage />
                                    </PrivateRoute>
                                } />

                            </Routes>
                        </ErrorBoundary>
                        <Analytics />
                        {/* 개발 환경에서만 WebSocket 상태 표시 */}
                        {/*{isDevelopment && <WebSocketStatus />}*/}
                        {/* 개발 환경에서만 Toast 데모 표시 */}
                        {/*{isDevelopment && <ToastDemo />}*/}
                        {/*<WebSocketStatus />*/}
                        </WebSocketProvider>
                    </NotificationProvider>
                </ToastManagerInitializer>
            </ToastProvider>
        </BrowserRouter>
    );
}

export default App;
