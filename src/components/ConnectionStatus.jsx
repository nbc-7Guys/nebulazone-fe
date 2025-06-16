import React from 'react';

export default function ConnectionStatus({ 
    isConnected, 
    isConnecting = false, 
    error = null,
    showText = true 
}) {
    const getStatusConfig = () => {
        if (error) {
            return {
                color: '#e53e3e',
                bgColor: '#fed7d7',
                text: '연결 오류'
            };
        }
        
        if (isConnecting) {
            return {
                color: '#d69e2e',
                bgColor: '#fefcbf',
                text: '연결 중...'
            };
        }
        
        if (isConnected) {
            return {
                color: '#38d39f',
                bgColor: '#c6f6d5',
                text: '연결됨'
            };
        }
        
        return {
            color: '#e53e3e',
            bgColor: '#fed7d7',
            text: '연결 안됨'
        };
    };

    const config = getStatusConfig();

    const pulseAnimation = isConnecting ? {
        animation: 'pulse 1.5s ease-in-out infinite'
    } : {};

    return (
        <>
            <style>
                {`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `}
            </style>
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: showText ? '4px 8px' : '4px',
                backgroundColor: config.bgColor,
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500'
            }}>
                <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: config.color,
                    ...pulseAnimation
                }} />
                
                {showText && (
                    <span style={{ color: config.color }}>
                        {config.text}
                    </span>
                )}
            </div>
        </>
    );
}
