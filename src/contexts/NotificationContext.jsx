import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { JwtManager } from '../services/managers/JwtManager';
import { notificationApi } from '../services/api';
import { useToastContext } from './ToastContext';

const NotificationContext = createContext();

// 알림 타입에 따른 Toast 타입 결정
const getToastTypeFromNotification = (notification) => {
    const type = notification.type?.toLowerCase();
    const title = notification.title?.toLowerCase();
    const content = notification.content?.toLowerCase();
    
    // 알림 타입이나 제목, 내용에 따라 Toast 타입 결정
    if (type === 'error' || title?.includes('오류') || title?.includes('실패') || title?.includes('error')) {
        return 'error';
    }
    if (type === 'success' || title?.includes('성공') || title?.includes('완료') || title?.includes('success')) {
        return 'success';
    }
    if (type === 'warning' || title?.includes('경고') || title?.includes('주의') || title?.includes('warning')) {
        return 'warning';
    }
    
    // 채팅 관련 알림은 info로 처리
    if (title?.includes('채팅') || title?.includes('메시지') || content?.includes('채팅') || content?.includes('메시지')) {
        return 'info';
    }
    
    // 거래 관련 알림 처리
    if (title?.includes('거래') || title?.includes('구매') || title?.includes('판매') || title?.includes('결제')) {
        return 'success';
    }
    
    return 'info'; // 기본값
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { subscribe, unsubscribe } = useWebSocket();
    const { toast } = useToastContext();

    // 초기 알림 데이터 로드
    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const response = await notificationApi.getUnreadNotifications();
                setNotifications(response.notifications || []);
                // unread count를 업데이트
                setUnreadCount(
                    (response.notifications || []).filter(notification => !notification.isRead).length
                );
                console.log('[NotificationContext] Loaded initial notifications:', response);
            } catch (error) {
                console.error('[NotificationContext] Failed to load notifications:', error);
            }
        };

        const token = JwtManager.getToken();
        if (token) {
            loadNotifications();
        }
    }, []);

    // 알림 구독
    const subscribeToNotifications = useCallback(async () => {
        // 먼저 userInfo 확인, 없으면 JWT 토큰에서 추출
        let userInfo = JwtManager.getUserInfo();
        
        if (!userInfo || !userInfo.id) {
            // JWT 토큰에서 사용자 ID 추출
            const token = JwtManager.getToken();
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    userInfo = { id: payload.jti };
                    console.log('[NotificationContext] Extracted user ID from token:', userInfo.id);
                } catch (error) {
                    console.error('[NotificationContext] Failed to parse token:', error);
                    return;
                }
            } else {
                console.log('[NotificationContext] No token found');
                return;
            }
        }

        const destination = `/topic/notification/${userInfo.id}`;

        try {
            await subscribe(destination, (message) => {
                const notification = JSON.parse(message.body);
                console.log('[NotificationContext] Received notification:', notification);
                
                setNotifications(prev => {
                    const newNotifications = [notification, ...prev];
                    console.log('[NotificationContext] Updated notifications:', newNotifications.length);
                    return newNotifications;
                });
                
                if (!notification.isRead) {
                    setUnreadCount(prev => {
                        const newCount = prev + 1;
                        console.log('[NotificationContext] Updated unread count:', newCount);
                        return newCount;
                    });
                    
                    // 브라우저 알림 표시 (권한이 있는 경우)
                    if (Notification.permission === 'granted') {
                        new Notification(notification.title, {
                            body: notification.content,
                            icon: '/favicon.ico'
                        });
                    }
                    
                    // Toast 알림 표시
                    if (toast) {
                        const toastType = getToastTypeFromNotification(notification);
                        toast[toastType](notification.content, {
                            title: notification.title,
                            duration: 5000
                        });
                    }
                }
            });

            console.log(`[NotificationContext] Subscribed to notifications for user ${userInfo.id}`);
        } catch (error) {
            console.error('[NotificationContext] Failed to subscribe to notifications:', error);
        }
    }, [subscribe]);

    // 알림 구독 해제
    const unsubscribeFromNotifications = useCallback(() => {
        let userInfo = JwtManager.getUserInfo();
        
        if (!userInfo || !userInfo.id) {
            const token = JwtManager.getToken();
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    userInfo = { id: payload.jti };
                } catch (error) {
                    return;
                }
            } else {
                return;
            }
        }

        const destination = `/topic/notification/${userInfo.id}`;
        unsubscribe(destination);
        console.log(`[NotificationContext] Unsubscribed from notifications for user ${userInfo.id}`);
    }, [unsubscribe]);

    // 알림 읽음 처리
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await notificationApi.markAsRead(notificationId);
            
            setNotifications(prev => 
                prev.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            console.log(`[NotificationContext] Marked notification as read: ${notificationId}`);
        } catch (error) {
            console.error('[NotificationContext] Failed to mark notification as read:', error);
        }
    }, []);

    // 모든 알림 읽음 처리
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationApi.markAllAsRead();
            
            setNotifications(prev => 
                prev.map(notification => ({ ...notification, isRead: true }))
            );
            setUnreadCount(0);
            console.log('[NotificationContext] Marked all notifications as read');
        } catch (error) {
            console.error('[NotificationContext] Failed to mark all notifications as read:', error);
        }
    }, []);

    // 알림 삭제 (클라이언트 측에서만 삭제)
    const removeNotification = useCallback((notificationId) => {
        setNotifications(prev => {
            const notification = prev.find(n => n.id === notificationId);
            if (notification && !notification.isRead) {
                setUnreadCount(count => Math.max(0, count - 1));
            }
            return prev.filter(n => n.id !== notificationId);
        });
    }, []);

    // 브라우저 알림 권한 요청
    const requestNotificationPermission = useCallback(async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                const permission = await Notification.requestPermission();
                console.log('[NotificationContext] Notification permission:', permission);
                return permission === 'granted';
            } catch (error) {
                console.error('[NotificationContext] Failed to request notification permission:', error);
                return false;
            }
        }
        return Notification.permission === 'granted';
    }, []);

    const value = {
        notifications,
        unreadCount,
        subscribeToNotifications,
        unsubscribeFromNotifications,
        markAsRead,
        markAllAsRead,
        removeNotification,
        requestNotificationPermission
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
};
