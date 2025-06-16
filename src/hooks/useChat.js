import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '../services/api';
import useWebSocket from './useWebSocket';

export const useChat = (roomId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { isConnected, subscribe, publish } = useWebSocket();

    // 채팅 기록 로드
    const loadChatHistory = useCallback(async () => {
        if (!roomId) return;
        
        try {
            setLoading(true);
            const history = await chatApi.getChatHistory(roomId);
            setMessages(history || []);
            setError(null);
        } catch (err) {
            console.error('채팅 기록 로드 실패:', err);
            setError('채팅 기록을 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    }, [roomId]);

    // 메시지 전송
    const sendMessage = useCallback((message, type = 'TEXT') => {
        if (!isConnected || !roomId) {
            throw new Error('채팅 서버에 연결되지 않았습니다.');
        }

        try {
            publish(`/chat/send/${roomId}`, {
                message,
                type
            });
        } catch (err) {
            console.error('메시지 전송 실패:', err);
            throw new Error('메시지 전송에 실패했습니다.');
        }
    }, [isConnected, roomId, publish]);

    // WebSocket 구독 설정
    useEffect(() => {
        if (!isConnected || !roomId) return;

        let subscription;
        try {
            subscription = subscribe(`/topic/chat/${roomId}`, (message) => {
                try {
                    const content = JSON.parse(message.body);
                    setMessages(prev => [...prev, content]);
                } catch (parseError) {
                    // JSON 파싱 실패 시 시스템 메시지로 처리
                    setMessages(prev => [...prev, {
                        message: message.body,
                        system: true,
                        sendTime: new Date().toISOString()
                    }]);
                }
            });
        } catch (err) {
            console.error('채팅방 구독 실패:', err);
            setError('채팅방 연결에 실패했습니다.');
        }

        return () => {
            if (subscription) {
                try {
                    subscription.unsubscribe();
                } catch (err) {
                    console.error('구독 해제 실패:', err);
                }
            }
        };
    }, [isConnected, roomId, subscribe]);

    // 채팅 기록 로드
    useEffect(() => {
        loadChatHistory();
    }, [loadChatHistory]);

    return {
        messages,
        loading,
        error,
        isConnected,
        sendMessage,
        reload: loadChatHistory
    };
};

export default useChat;
