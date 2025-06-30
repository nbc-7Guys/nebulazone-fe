import { apiRequest } from './core';

const notificationApi = {
    // 읽지 않은 알림 목록 조회
    getUnreadNotifications: () =>
        apiRequest('/notification'),

    // 알림 읽음 처리
    markAsRead: (notificationId) =>
        apiRequest(`/notification/${notificationId}/read`, {
            method: 'PATCH'
        }),

    // 모든 알림 읽음 처리
    markAllAsRead: () =>
        apiRequest('/notification/read-all', {
            method: 'PATCH'
        }),
};

export { notificationApi };