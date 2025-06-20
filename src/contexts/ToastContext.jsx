import React, { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

const ToastContext = createContext();

export const useToastContext = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToastContext must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children, position = 'top-right' }) => {
    const toastHook = useToast();

    return (
        <ToastContext.Provider value={toastHook}>
            {children}
            <ToastContainer 
                toasts={toastHook.toasts}
                removeToast={toastHook.removeToast}
                position={position}
            />
        </ToastContext.Provider>
    );
};