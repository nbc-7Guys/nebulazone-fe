import React from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';

const ToastContainer = ({ toasts, removeToast, position = 'top-right' }) => {
    const getContainerStyles = () => {
        const baseStyles = {
            position: 'fixed',
            zIndex: 99999,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: position.includes('right') ? 'flex-end' : 
                        position.includes('left') ? 'flex-start' : 'center'
        };

        const positions = {
            'top-right': {
                top: '80px', // navbar 밑으로 이동
                right: '20px'
            },
            'top-left': {
                top: '80px', // navbar 밑으로 이동
                left: '20px'
            },
            'top-center': {
                top: '80px', // navbar 밑으로 이동
                left: '50%',
                transform: 'translateX(-50%)'
            },
            'bottom-right': {
                bottom: '20px',
                right: '20px'
            },
            'bottom-left': {
                bottom: '20px',
                left: '20px'
            },
            'bottom-center': {
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)'
            }
        };

        return { ...baseStyles, ...positions[position] };
    };

    if (toasts.length === 0) return null;

    const containerElement = (
        <div style={getContainerStyles()}>
            {toasts.map((toast) => (
                <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                    <Toast
                        {...toast}
                        onClose={removeToast}
                        position={position}
                    />
                </div>
            ))}
        </div>
    );

    return createPortal(containerElement, document.body);
};

export default ToastContainer;