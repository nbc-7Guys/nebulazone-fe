import { useEffect, useRef, useCallback, useState } from 'react';
import webSocketManager from '../utils/WebSocketManager';
import { JwtManager } from '../utils/JwtManager';

export const useWebSocket = () => {
    const isInitialized = useRef(false);
    const reconnectInterval = useRef(null);
    const [connected, setConnected] = useState(false);

    // 연결 상태를 실시간으로 업데이트
    useEffect(() => {
        const checkConnection = () => {
            const currentlyConnected = webSocketManager.isConnected();
            if (currentlyConnected !== connected) {
                setConnected(currentlyConnected);
                console.log(`[useWebSocket] Connection status changed: ${connected} -> ${currentlyConnected}`);
            }
        };

        // 주기적으로 연결 상태 확인
        const statusInterval = setInterval(checkConnection, 1000);

        return () => {
            clearInterval(statusInterval);
        };
    }, [connected]);

    // 컴포넌트 마운트 시 자동 연결 시도
    useEffect(() => {
        const autoConnect = async () => {
            if (!isInitialized.current && JwtManager.getToken()) {
                isInitialized.current = true;
                try {
                    await connect();
                } catch (error) {
                    console.error('[useWebSocket] Auto-connect failed:', error);
                }
            }
        };

        autoConnect();

        // 주기적으로 연결 상태 확인 및 재연결
        reconnectInterval.current = setInterval(() => {
            if (JwtManager.getToken() && !webSocketManager.isConnected()) {
                console.log('[useWebSocket] Connection lost, attempting to reconnect...');
                connect().catch(error => {
                    console.error('[useWebSocket] Auto-reconnect failed:', error);
                });
            }
        }, 10000); // 10초마다 확인

        return () => {
            if (reconnectInterval.current) {
                clearInterval(reconnectInterval.current);
            }
        };
    }, []);

    const connect = useCallback(async () => {
        if (!JwtManager.getToken()) {
            console.log('[useWebSocket] No token found, skipping connection');
            return false;
        }

        try {
            await webSocketManager.connect();
            setConnected(true);
            return true;
        } catch (error) {
            console.error('[useWebSocket] Connection failed:', error);
            setConnected(false);
            return false;
        }
    }, []);

    const disconnect = useCallback(() => {
        webSocketManager.disconnect();
        isInitialized.current = false;
        setConnected(false);
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
        return connected;
    }, [connected]);

    return {
        connect,
        disconnect,
        subscribe,
        unsubscribe,
        sendMessage,
        isConnected
    };
};
