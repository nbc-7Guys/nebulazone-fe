import React, { useEffect } from 'react';

const Toast = ({ 
    id,
    message, 
    type = 'info', 
    duration = 5000, 
    onClose, 
    title = '',
    position = 'top-right'
}) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, id, onClose]);

    const getToastIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
            default:
                return 'ℹ️';
        }
    };

    const getToastStyles = () => {
        const baseStyles = {
            padding: '12px 16px',
            marginBottom: '8px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            minWidth: '300px',
            maxWidth: '500px',
            backgroundColor: '#fff',
            border: '1px solid #e1e5e9',
            animation: 'slideInRight 0.3s ease-out',
            position: 'relative',
            cursor: 'pointer'
        };

        const typeStyles = {
            success: {
                borderLeftColor: '#10b981',
                borderLeftWidth: '4px'
            },
            error: {
                borderLeftColor: '#ef4444',
                borderLeftWidth: '4px'
            },
            warning: {
                borderLeftColor: '#f59e0b',
                borderLeftWidth: '4px'
            },
            info: {
                borderLeftColor: '#3b82f6',
                borderLeftWidth: '4px'
            }
        };

        return { ...baseStyles, ...typeStyles[type] };
    };

    const handleClick = () => {
        onClose(id);
    };

    const toastElement = (
        <div 
            style={getToastStyles()}
            onClick={handleClick}
        >
            <span style={{ fontSize: '16px', flexShrink: 0 }}>
                {getToastIcon()}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
                {title && (
                    <div style={{ 
                        fontWeight: 'bold', 
                        marginBottom: '4px',
                        color: '#1f2937'
                    }}>
                        {title}
                    </div>
                )}
                <div style={{ 
                    color: '#6b7280',
                    wordBreak: 'break-word'
                }}>
                    {message}
                </div>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose(id);
                }}
                style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '0',
                    color: '#9ca3af',
                    flexShrink: 0
                }}
            >
                ×
            </button>
        </div>
    );

    return toastElement;
};

// CSS를 JavaScript로 주입
const injectStyles = () => {
    if (document.getElementById('toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideInLeft {
            from {
                transform: translateX(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutLeft {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(-100%);
                opacity: 0;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
};

// 컴포넌트가 처음 로드될 때 스타일 주입
injectStyles();

export default Toast;