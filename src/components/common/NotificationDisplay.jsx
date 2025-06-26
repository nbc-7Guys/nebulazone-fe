import React, { useState } from 'react';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { NotificationType } from '../../types/NotificationType';

const NotificationDisplay = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        removeNotification 
    } = useNotificationContext();

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        
        // 알림 클릭 시 해당 URL로 이동
        if (notification.targetUrl) {
            window.location.href = notification.targetUrl;
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return '방금 전';
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case NotificationType.PRODUCT_PURCHASE:
                return '🛒';
            case NotificationType.CHAT_MESSAGE:
                return '💬';
            case NotificationType.AUCTION_WIN:
                return '🏆';
            case NotificationType.AUCTION_OUTBID:
                return '⚡';
            default:
                return '📢';
        }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* 알림 버튼 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
                <span style={{ fontSize: '20px' }}>🔔</span>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        background: '#e53e3e',
                        color: 'white',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        minWidth: '18px'
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* 알림 드롭다운 */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '350px',
                    maxHeight: '400px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    overflow: 'hidden'
                }}>
                    {/* 헤더 */}
                    <div style={{
                        padding: '16px',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                            알림 {unreadCount > 0 && `(${unreadCount})`}
                        </h3>
                        {notifications.length > 0 && unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#38d39f',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                모두 읽음
                            </button>
                        )}
                    </div>

                    {/* 알림 목록 */}
                    <div style={{
                        maxHeight: '320px',
                        overflowY: 'auto'
                    }}>
                        {notifications.length === 0 ? (
                            <div style={{
                                padding: '40px 16px',
                                textAlign: 'center',
                                color: '#718096',
                                fontSize: '14px'
                            }}>
                                새로운 알림이 없습니다
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #f7fafc',
                                        cursor: notification.targetUrl ? 'pointer' : 'default',
                                        backgroundColor: notification.isRead ? 'white' : '#f0fff4',
                                        transition: 'background-color 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (notification.targetUrl) {
                                            e.target.style.backgroundColor = '#e6fffa';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = notification.isRead ? 'white' : '#f0fff4';
                                    }}
                                >
                                    <span style={{ fontSize: '16px', flexShrink: 0 }}>
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: notification.isRead ? 'normal' : '600',
                                            fontSize: '14px',
                                            color: '#2d3748',
                                            marginBottom: '2px'
                                        }}>
                                            {notification.title}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#718096',
                                            lineHeight: '1.4',
                                            marginBottom: '4px'
                                        }}>
                                            {notification.content}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#a0aec0'
                                        }}>
                                            {formatTime(notification.createdAt)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeNotification(notification.id);
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#a0aec0',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            flexShrink: 0,
                                            padding: '2px'
                                        }}
                                        onMouseEnter={(e) => e.target.style.color = '#718096'}
                                        onMouseLeave={(e) => e.target.style.color = '#a0aec0'}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* 오버레이 (드롭다운 외부 클릭 시 닫기) */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                    }}
                />
            )}
        </div>
    );
};

export default NotificationDisplay;
