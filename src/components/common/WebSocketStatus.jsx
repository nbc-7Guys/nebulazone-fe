import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { JwtManager } from '../../services/managers/JwtManager';
import axios from 'axios';

const WebSocketStatus = () => {
    const { isConnected, connect, disconnect } = useWebSocket();
    const { notifications, unreadCount } = useNotificationContext();
    const [connectionStatus, setConnectionStatus] = useState(false);
    const [testMessage, setTestMessage] = useState(''); // 테스트 메시지 입력 상태
    const [isCollapsed, setIsCollapsed] = useState(false); // 최소화 상태 추가
    
    // 연결 상태를 주기적으로 업데이트
    useEffect(() => {
        const updateStatus = () => {
            const status = isConnected();
            setConnectionStatus(status);
        };

        // 초기 상태 설정
        updateStatus();

        // 1초마다 상태 확인
        const interval = setInterval(updateStatus, 1000);

        return () => clearInterval(interval);
    }, [isConnected]);
    
    // 사용자 정보 추출 (userInfo가 없으면 JWT에서 추출)
    let userInfo = JwtManager.getUserInfo();
    const isLoggedIn = !!JwtManager.getToken();
    
    if (!userInfo && isLoggedIn) {
        const token = JwtManager.getToken();
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userInfo = { id: payload.jti, email: payload.sub };
        } catch (error) {
            console.error('Failed to parse token in WebSocketStatus:', error);
        }
    }

    const handleTestNotification = async () => {
        if (!userInfo?.id) return;
        
        const message = testMessage.trim() || '기본 테스트 메시지입니다.';

        try {
            // URL 파라미터로 userId와 message 전송
            const encodedMessage = encodeURIComponent(message);
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/test/notification?userId=${userInfo.id}&message=${encodedMessage}`, null, {
                headers: {
                    'Authorization': `Bearer ${JwtManager.getToken()}`
                }
            });

            console.log('[WebSocketStatus] Test notification sent to server');
            console.log('[WebSocketStatus] 서버에서 WebSocket 알림이 전송됩니다!');
            setTestMessage(''); // 전송 후 입력창 초기화
        } catch (error) {
            console.error('[WebSocketStatus] Error sending test notification:', error);
            fallbackLocalNotification(message);
        }
    };

    const fallbackLocalNotification = (message) => {
        // 기존 로컬 알림 로직
        if (Notification.permission === 'granted') {
            new Notification('테스트 알림 (로컬)', {
                body: message || '서버 요청 실패로 로컬 알림을 표시합니다.',
                icon: '/favicon.ico'
            });
        }
    };

    // 최소화 토글 함수
    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div style={{
            position: 'fixed',
            top: '75%',
            left: '20px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: isCollapsed ? '8px' : '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: isCollapsed ? 'auto' : '280px',
            maxWidth: '300px',
            maxHeight: isCollapsed ? 'auto' : '70vh',
            zIndex: 999,
            transition: 'all 0.3s ease',
            overflow: 'hidden'
        }}>
            {isCollapsed ? (
                // 최소화된 상태
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={toggleCollapse}>
                    <span style={{ marginRight: '8px', fontSize: '14px', fontWeight: '600' }}>
                        WebSocket
                    </span>
                    <span style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: connectionStatus ? '#38d39f' : '#e53e3e' 
                    }}></span>
                    <span style={{ marginLeft: '4px', fontSize: '14px' }}>
                        {connectionStatus ? '연결됨' : '연결 안됨'}
                    </span>
                    <span style={{ marginLeft: '8px', fontSize: '14px' }}>
                        {unreadCount > 0 && `(${unreadCount})`}
                    </span>
                </div>
            ) : (
                // 전체 보기 상태
                <>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '12px'
                    }}>
                        <h4 style={{ margin: '0', fontSize: '14px', fontWeight: '600' }}>
                            WebSocket 상태
                        </h4>
                        <button 
                            onClick={toggleCollapse}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '14px',
                                cursor: 'pointer',
                                color: '#718096'
                            }}
                        >
                            최소화
                        </button>
                    </div>
                    
                    {/* 로그인 상태 */}
                    <div style={{ marginBottom: '8px', fontSize: '12px' }}>
                        <strong>로그인:</strong> {isLoggedIn ? '✅ 로그인됨' : '❌ 로그인 안됨'}
                        {userInfo && (
                            <div style={{ color: '#666', marginTop: '2px' }}>
                                사용자 ID: {userInfo.id}
                            </div>
                        )}
                    </div>

                    {/* 연결 상태 */}
                    <div style={{ marginBottom: '8px', fontSize: '12px' }}>
                        <strong>WebSocket:</strong> {connectionStatus ? '🟢 연결됨' : '🔴 연결 안됨'}
                    </div>

                    {/* 알림 상태 */}
                    <div style={{ marginBottom: '12px', fontSize: '12px' }}>
                        <strong>알림:</strong> {unreadCount}개 읽지 않음
                        <div style={{ color: '#666', marginTop: '2px' }}>
                            총 {notifications.length}개 알림
                        </div>
                    </div>

                    {/* 연결 제어 버튼 */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <button
                            onClick={connect}
                            disabled={connectionStatus || !isLoggedIn}
                            style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                backgroundColor: connectionStatus ? '#ccc' : '#38d39f',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: connectionStatus || !isLoggedIn ? 'not-allowed' : 'pointer'
                            }}
                        >
                            연결
                        </button>
                        <button
                            onClick={disconnect}
                            disabled={!connectionStatus}
                            style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                backgroundColor: !connectionStatus ? '#ccc' : '#e53e3e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: !connectionStatus ? 'not-allowed' : 'pointer'
                            }}
                        >
                            해제
                        </button>
                    </div>

                    {/* 테스트 메시지 입력 */}
                    <div style={{ marginBottom: '8px' }}>
                        <input
                            type="text"
                            placeholder="테스트 메시지를 입력하세요..."
                            value={testMessage}
                            onChange={(e) => setTestMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleTestNotification();
                                }
                            }}
                            disabled={!isLoggedIn}
                            style={{
                                width: '100%',
                                padding: '6px 8px',
                                fontSize: '11px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                backgroundColor: !isLoggedIn ? '#f5f5f5' : 'white'
                            }}
                        />
                    </div>

                    {/* 테스트 버튼 */}
                    <button
                        onClick={handleTestNotification}
                        disabled={!isLoggedIn}
                        style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            backgroundColor: !isLoggedIn ? '#ccc' : '#4a5568',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: !isLoggedIn ? 'not-allowed' : 'pointer',
                            width: '100%'
                        }}
                    >
                        {testMessage.trim() ? '테스트 알림 전송' : '기본 테스트 알림'}
                    </button>

                    {/* 최근 알림 */}
                    {notifications.length > 0 && (
                        <div style={{ marginTop: '12px', fontSize: '11px' }}>
                            <strong>최근 알림:</strong>
                            <div style={{
                                maxHeight: '80px',
                                overflowY: 'auto',
                                marginTop: '4px',
                                padding: '4px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '4px'
                            }}>
                                {notifications.slice(0, 3).map((notification, index) => (
                                    <div key={index} style={{
                                        padding: '4px',
                                        borderBottom: index < 2 ? '1px solid #e2e8f0' : 'none',
                                        fontSize: '10px'
                                    }}>
                                        <div style={{ fontWeight: '600' }}>{notification.title}</div>
                                        <div style={{ color: '#666' }}>{notification.content}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default WebSocketStatus;
