import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client/dist/sockjs';
import { Client } from '@stomp/stompjs';
import { JwtManager } from '../utils/JwtManager';
import { ENV } from '../utils/env';

export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const stompClientRef = useRef(null);

    useEffect(() => {
        const connect = () => {
            const jwt = JwtManager.getJwt();
            if (!jwt) {
                setError('JWT 토큰이 없습니다.');
                return;
            }

            const socket = new SockJS(`${ENV.API_BASE_URL}/ws`);
            const client = new Client({
                webSocketFactory: () => socket,
                connectHeaders: { Authorization: `Bearer ${jwt}` },
                debug: () => {}, // 디버그 로그 비활성화
                onConnect: () => {
                    setIsConnected(true);
                    setError(null);
                },
                onStompError: (frame) => {
                    setIsConnected(false);
                    setError(`WebSocket 연결 실패: ${frame.headers["message"] || "알 수 없는 에러"}`);
                },
                onDisconnect: () => {
                    setIsConnected(false);
                },
            });

            client.activate();
            stompClientRef.current = client;
        };

        connect();

        return () => {
            if (stompClientRef.current) {
                try {
                    stompClientRef.current.deactivate();
                } catch (err) {
                    console.error('WebSocket 연결 해제 에러:', err);
                }
            }
        };
    }, []);

    const subscribe = (destination, callback) => {
        if (stompClientRef.current && isConnected) {
            return stompClientRef.current.subscribe(destination, callback);
        }
        throw new Error('WebSocket이 연결되지 않았습니다.');
    };

    const publish = (destination, body) => {
        if (stompClientRef.current && isConnected) {
            stompClientRef.current.publish({
                destination,
                body: JSON.stringify(body),
            });
        } else {
            throw new Error('WebSocket이 연결되지 않았습니다.');
        }
    };

    return {
        isConnected,
        error,
        subscribe,
        publish,
    };
};

export default useWebSocket;
