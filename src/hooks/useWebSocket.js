import { useEffect, useRef, useCallback } from 'react';
import webSocketManager from '../utils/WebSocketManager';
import { JwtManager } from '../utils/JwtManager';

export const useWebSocket = () => {
    const isInitialized = useRef(false);

    const connect = useCallback(async () => {
        if (!JwtManager.getToken()) {
            console.log('[useWebSocket] No token found, skipping connection');
            return false;
        }

        try {
            await webSocketManager.connect();
            return true;
        } catch (error) {
            console.error('[useWebSocket] Connection failed:', error);
            return false;
        }
    }, []);

    const disconnect = useCallback(() => {
        webSocketManager.disconnect();
        isInitialized.current = false;
    }, []);

    const subscribe = useCallback(async (destination, callback) => {
        try {
            return await webSocketManager.subscribe(destination, callback);
        } catch (error) {
            console.error('[useWebSocket] Subscribe failed:', error);
            throw error;
        }
    }, []);

    const unsubscribe = useCallback((destination) => {
        webSocketManager.unsubscribe(destination);
    }, []);

    const sendMessage = useCallback(async (destination, body) => {
        try {
            await webSocketManager.sendMessage(destination, body);
        } catch (error) {
            console.error('[useWebSocket] Send message failed:', error);
            throw error;
        }
    }, []);

    const isConnected = useCallback(() => {
        return webSocketManager.isConnected();
    }, []);

    return {
        connect,
        disconnect,
        subscribe,
        unsubscribe,
        sendMessage,
        isConnected
    };
};
