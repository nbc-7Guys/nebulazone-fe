import React from 'react';
import { useToastNotification } from '../../hooks/useToastNotification';

const ToastDemo = () => {
    const { showSuccess, showError, showWarning, showInfo, messages } = useToastNotification();

    const demoStyle = {
        position: 'fixed',
        top: '50%',
        right: '20px',
        transform: 'translateY(-50%)',
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '70vh',
        overflow: 'hidden'
    };

    const buttonStyle = {
        padding: '8px 12px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold'
    };

    return (
        <div style={demoStyle}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Toast 테스트</h4>
            
            <button 
                style={{ ...buttonStyle, background: '#10b981', color: 'white' }}
                onClick={() => showSuccess('성공 메시지입니다!')}
            >
                성공 Toast
            </button>
            
            <button 
                style={{ ...buttonStyle, background: '#ef4444', color: 'white' }}
                onClick={() => showError('오류 메시지입니다!')}
            >
                오류 Toast
            </button>
            
            <button 
                style={{ ...buttonStyle, background: '#f59e0b', color: 'white' }}
                onClick={() => showWarning('경고 메시지입니다!')}
            >
                경고 Toast
            </button>
            
            <button 
                style={{ ...buttonStyle, background: '#3b82f6', color: 'white' }}
                onClick={() => showInfo('정보 메시지입니다!')}
            >
                정보 Toast
            </button>

            <hr style={{ margin: '8px 0' }} />
            
            <button 
                style={{ ...buttonStyle, background: '#6366f1', color: 'white' }}
                onClick={() => messages.loginSuccess()}
            >
                로그인 성공
            </button>
            
            <button 
                style={{ ...buttonStyle, background: '#8b5cf6', color: 'white' }}
                onClick={() => messages.messageReceived('홍길동', '안녕하세요!')}
            >
                메시지 수신
            </button>
            
            <button 
                style={{ ...buttonStyle, background: '#06b6d4', color: 'white' }}
                onClick={() => messages.orderSuccess()}
            >
                주문 완료
            </button>
        </div>
    );
};

export default ToastDemo;