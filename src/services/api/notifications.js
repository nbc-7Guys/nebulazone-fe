import { apiRequest } from './core';

const notificationApi = {
    // 읽지 않은 알림 조회
    getUnreadNotifications: async () => {
        return await apiRequest('/notifications/unread');
    },

    // 알림 읽음 처리
    markAsRead: async (notificationId) => {
        return await apiRequest(`/notifications/${notificationId}/read`, {
            method: 'POST'
        });
    },

    // 모든 알림 읽음 처리
    markAllAsRead: async () => {
        return await apiRequest('/notifications/read-all', {
            method: 'POST'
        });
    }
};

export { notificationApi };