import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { JwtManager } from '../services/managers/JwtManager';
import { notificationApi } from '../services/api';

export const useNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { subscribe, unsubscribe, isConnected } = useWebSocket();

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
                console.log('[useNotification] Loaded initial notifications:', response);
            } catch (error) {
                console.error('[useNotification] Failed to load notifications:', error);
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
                    userInfo = { id: payload.jti }; // jti가 사용자 ID인 것 같음
                    console.log('[useNotification] Extracted user ID from token:', userInfo.id);
                } catch (error) {
                    console.error('[useNotification] Failed to parse token:', error);
                    return;
                }
            } else {
                console.log('[useNotification] No token found');
                return;
            }
        }

        const destination = `/topic/notification/${userInfo.id}`;

        try {
            await subscribe(destination, (message) => {
                const notification = JSON.parse(message.body);
                console.log('[useNotification] Received notification:', notification);
                console.log('[useNotification] Current notifications count:', notifications.length);
                
                setNotifications(prev => {
                    const newNotifications = [notification, ...prev];
                    console.log('[useNotification] Updated notifications:', newNotifications);
                    return newNotifications;
                });
                
                if (!notification.isRead) {
                    setUnreadCount(prev => {
                        const newCount = prev + 1;
                        console.log('[useNotification] Updated unread count:', newCount);
                        return newCount;
                    });
                    
                    // 브라우저 알림 표시 (권한이 있는 경우)
                    if (Notification.permission === 'granted') {
                        new Notification(notification.title, {
                            body: notification.content,
                            icon: '/favicon.ico'
                        });
                    }
                }
            });

            console.log(`[useNotification] Subscribed to notifications for user ${userInfo.id}`);
        } catch (error) {
            console.error('[useNotification] Failed to subscribe to notifications:', error);
        }
    }, [subscribe, notifications.length]);

    // 알림 구독 해제
    const unsubscribeFromNotifications = useCallback(() => {
        const userInfo = JwtManager.getUserInfo();
        if (!userInfo || !userInfo.id) return;

        const destination = `/topic/notification/${userInfo.id}`;
        unsubscribe(destination);
        console.log(`[useNotification] Unsubscribed from notifications for user ${userInfo.id}`);
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
            console.log(`[useNotification] Marked notification as read: ${notificationId}`);
        } catch (error) {
            console.error('[useNotification] Failed to mark notification as read:', error);
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
            console.log('[useNotification] Marked all notifications as read');
        } catch (error) {
            console.error('[useNotification] Failed to mark all notifications as read:', error);
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
                console.log('[useNotification] Notification permission:', permission);
                return permission === 'granted';
            } catch (error) {
                console.error('[useNotification] Failed to request notification permission:', error);
                return false;
            }
        }
        return Notification.permission === 'granted';
    }, []);

    return {
        notifications,
        unreadCount,
        subscribeToNotifications,
        unsubscribeFromNotifications,
        markAsRead,
        markAllAsRead,
        removeNotification,
        requestNotificationPermission
    };
};
