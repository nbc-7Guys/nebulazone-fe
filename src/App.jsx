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
import { Analytics } from "@vercel/analytics/react";
import { JwtManager } from "./utils/JwtManager";
import { useWebSocket } from "./hooks/useWebSocket";
import { NotificationProvider, useNotificationContext } from "./contexts/NotificationContext";
import WebSocketStatus from "./components/WebSocketStatus";
import AuctionProductDetailPage from "./pages/AuctionProductDetailPage.jsx";

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
            const userInfo = JwtManager.getUserInfo();
            
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

    // 페이지 새로고침 시 정리
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (isConnected()) {
                unsubscribeFromNotifications();
                disconnect();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [disconnect, unsubscribeFromNotifications, isConnected]);

    return children;
}

function App() {
    const isDevelopment = import.meta.env.DEV;
    
    return (
        <BrowserRouter>
            <NotificationProvider>
                <WebSocketProvider>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/products/direct" element={<ProductListPage />} />
                        <Route path="/products/auction" element={<ProductListPage />} />
                        <Route path="/products/create" element={<ProductCreatePage />} />
                        <Route path="/products/direct/:id" element={<DirectProductDetailPage />} />
                        <Route path="/products/auction/:id" element={<AuctionProductDetailPage />} />
                        <Route path="/mypage" element={<MyPage />} />
                        <Route path="/chat/:roomId" element={<ChatRoomPage />} />
                        <Route path="/chat/rooms" element={<ChatRoomListPage />} />
                        <Route path="/transactions" element={<TransactionHistoryPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/login" element={<LoginPage />} />
                    </Routes>
                    <Analytics />
                    {/* 개발 환경에서만 WebSocket 상태 표시 */}
                    {isDevelopment && <WebSocketStatus />}
                </WebSocketProvider>
            </NotificationProvider>
        </BrowserRouter>
    );
}

export default App;
