import React from 'react';

export default function ErrorMessage({ 
    message, 
    onRetry, 
    retryText = '다시 시도',
    type = 'error' 
}) {
    const typeStyles = {
        error: {
            backgroundColor: '#fed7d7',
            borderColor: '#feb2b2',
            color: '#e53e3e'
        },
        warning: {
            backgroundColor: '#fefcbf',
            borderColor: '#f6e05e',
            color: '#d69e2e'
        },
        info: {
            backgroundColor: '#bee3f8',
            borderColor: '#90cdf4',
            color: '#3182ce'
        }
    };

    const style = typeStyles[type] || typeStyles.error;

    return (
        <div style={{
            ...style,
            padding: '16px',
            borderRadius: '8px',
            border: `1px solid ${style.borderColor}`,
            margin: '16px 0',
            textAlign: 'center'
        }}>
            <div style={{
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: onRetry ? '12px' : '0'
            }}>
                {message}
            </div>
            
            {onRetry && (
                <button
                    onClick={onRetry}
                    style={{
                        backgroundColor: style.color,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.opacity = '1';
                    }}
                >
                    {retryText}
                </button>
            )}
        </div>
    );
}
