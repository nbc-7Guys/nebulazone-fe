import { useState, useCallback } from 'react';

let toastId = 0;

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((toastData) => {
        const id = ++toastId;
        const toast = {
            id,
            type: 'info',
            duration: 5000,
            ...toastData
        };

        setToasts(prev => [...prev, toast]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // 편의 메서드들
    const toast = {
        success: (message, options = {}) => addToast({ 
            message, 
            type: 'success', 
            title: options.title || '성공',
            ...options 
        }),
        error: (message, options = {}) => addToast({ 
            message, 
            type: 'error', 
            title: options.title || '오류',
            duration: options.duration || 7000, // 에러는 좀 더 오래 표시
            ...options 
        }),
        warning: (message, options = {}) => addToast({ 
            message, 
            type: 'warning', 
            title: options.title || '경고',
            ...options 
        }),
        info: (message, options = {}) => addToast({ 
            message, 
            type: 'info', 
            title: options.title || '알림',
            ...options 
        })
    };

    return {
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
        toast
    };
};