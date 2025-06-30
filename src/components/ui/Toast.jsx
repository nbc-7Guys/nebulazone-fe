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
            padding: '16px 20px',
            marginBottom: '12px',
            borderRadius: '12px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            minWidth: '360px',
            maxWidth: '600px',
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
            <span style={{ fontSize: '20px', flexShrink: 0 }}>
                {getToastIcon()}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
                {title && (
                    <div style={{ 
                        fontWeight: 'bold', 
                        marginBottom: '6px',
                        color: '#1f2937',
                        fontSize: '16px'
                    }}>
                        {title}
                    </div>
                )}
                <div style={{ 
                    color: '#4b5563',
                    wordBreak: 'break-word',
                    fontSize: '15px',
                    lineHeight: '1.5'
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
                    fontSize: '22px',
                    cursor: 'pointer',
                    padding: '0',
                    color: '#9ca3af',
                    flexShrink: 0,
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
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