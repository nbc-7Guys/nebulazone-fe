import React from 'react';

export default function LoadingSpinner({ size = 'medium', message = '로딩 중...' }) {
    const sizeMap = {
        small: 24,
        medium: 40,
        large: 56
    };

    const spinnerSize = sizeMap[size] || sizeMap.medium;

    const spinnerStyle = {
        width: spinnerSize,
        height: spinnerSize,
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #38d39f',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    };

    return (
        <>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                color: '#666'
            }}>
                <div style={spinnerStyle} />
                {message && (
                    <div style={{
                        marginTop: '12px',
                        fontSize: '14px',
                        color: '#666'
                    }}>
                        {message}
                    </div>
                )}
            </div>
        </>
    );
}
