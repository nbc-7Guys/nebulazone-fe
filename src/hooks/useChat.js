import { useState, useCallback, useRef, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { JwtManager } from '../utils/JwtManager';
import { chatApi } from '../services/api';

export const useChat = (roomId) => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const currentSubscription = useRef(null);
    const { subscribe, unsubscribe, sendMessage, isConnected } = useWebSocket();

    // 채팅 히스토리 로드
    const loadChatHistory = useCallback(async () => {
        if (!roomId) return;

        setIsLoadingHistory(true);
        try {
            const historyData = await chatApi.getChatHistory(roomId);
            setMessages(historyData || []);
            console.log(`[useChat] Loaded ${historyData?.length || 0} messages for room ${roomId}`);
        } catch (error) {
            console.error('[useChat] Failed to load chat history:', error);
            // 히스토리 로드 실패는 채팅 자체를 막지 않음
        } finally {
            setIsLoadingHistory(false);
        }
    }, [roomId]);

    // 컴포넌트 마운트 시 히스토리 로드
    useEffect(() => {
        if (roomId) {
            loadChatHistory();
        }
        
        // roomId가 변경되면 메시지 초기화
        return () => {
            if (currentSubscription.current) {
                setMessages([]);
            }
        };
    }, [roomId, loadChatHistory]);

    // 채팅방 구독
    const subscribeToChatRoom = useCallback(async () => {
        if (!roomId) {
            console.log('[useChat] No room ID provided');
            return;
        }

        // 이전 구독이 있다면 해제
        if (currentSubscription.current) {
            unsubscribeFromChatRoom();
        }

        // 웹소켓 연결 상태 확인
        if (!isConnected()) {
            console.log('[useChat] WebSocket not connected, cannot subscribe');
            throw new Error('WebSocket not connected');
        }

        const destination = `/topic/chat/${roomId}`;

        try {
            console.log(`[useChat] Attempting to subscribe to ${destination}`);
            console.log(`[useChat] WebSocket connected: ${isConnected()}`);
            
            const subscription = await subscribe(destination, (message) => {
                const chatMessage = JSON.parse(message.body);
                console.log('[useChat] Received message:', chatMessage);
                
                setMessages(prev => [...prev, chatMessage]);
                
                // 타이핑 상태 업데이트 (별도 메시지 타입이 있다면)
                if (chatMessage.type === 'TYPING') {
                    setIsTyping(true);
                    // 3초 후 타이핑 상태 해제
                    setTimeout(() => setIsTyping(false), 3000);
                }
            });

            currentSubscription.current = { destination, subscription };
            setIsSubscribed(true);
            console.log(`[useChat] Successfully subscribed to chat room ${roomId}`, subscription);
            console.log(`[useChat] Current subscription stored:`, currentSubscription.current);
        } catch (error) {
            console.error('[useChat] Failed to subscribe to chat room:', error);
            console.error('[useChat] Error details:', {
                message: error.message,
                stack: error.stack,
                roomId: roomId,
                destination: destination
            });
            throw error;
        }
    }, [roomId, subscribe, unsubscribe, isConnected]);

    // 채팅방 구독 해제
    const unsubscribeFromChatRoom = useCallback(() => {
        if (currentSubscription.current) {
            unsubscribe(currentSubscription.current.destination);
            currentSubscription.current = null;
            setIsSubscribed(false);
            console.log(`[useChat] Unsubscribed from chat room ${roomId}`);
        }
    }, [roomId, unsubscribe]);

    // 메시지 전송
    const sendChatMessage = useCallback(async (content, messageType = 'TEXT') => {
        if (!roomId || !content.trim()) {
            console.log('[useChat] Invalid room ID or empty content');
            return;
        }

        // 먼저 userInfo 확인, 없으면 JWT 토큰에서 추출
        let userInfo = JwtManager.getUserInfo();
        
        if (!userInfo || !userInfo.id) {
            // JWT 토큰에서 사용자 정보 추출
            const token = JwtManager.getToken();
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    userInfo = { 
                        id: payload.jti, 
                        name: payload.sub || 'User',
                        username: payload.sub || 'User'
                    };
                    console.log('[useChat] Extracted user info from token:', userInfo);
                } catch (error) {
                    console.error('[useChat] Failed to parse token:', error);
                    return;
                }
            } else {
                console.error('[useChat] No token found');
                return;
            }
        }

        const message = {
            chatRoomId: roomId,
            senderId: userInfo.id,
            senderName: userInfo.name || userInfo.username,
            content: content.trim(),
            type: messageType,
            timestamp: new Date().toISOString()
        };

        try {
            // 백엔드 설정에 맞춰 /chat prefix 사용, messageType은 TEXT 또는 IMAGE
            await sendMessage(`/chat/send/${roomId}`, {
                message: content.trim(),
                type: messageType || "TEXT"  // 백엔드 MessageType enum에 맞춤
            });
            console.log('[useChat] Message sent:', message);
        } catch (error) {
            console.error('[useChat] Failed to send message:', error);
            throw error;
        }
    }, [roomId, sendMessage]);

    // 타이핑 상태 전송
    const sendTypingStatus = useCallback(async () => {
        if (!roomId) return;

        // 먼저 userInfo 확인, 없으면 JWT 토큰에서 추출
        let userInfo = JwtManager.getUserInfo();
        
        if (!userInfo || !userInfo.id) {
            const token = JwtManager.getToken();
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    userInfo = { 
                        id: payload.jti, 
                        name: payload.sub || 'User',
                        username: payload.sub || 'User'
                    };
                } catch (error) {
                    return;
                }
            } else {
                return;
            }
        }

        try {
            await sendMessage('/chat/typing', {
                chatRoomId: roomId,
                senderId: userInfo.id,
                senderName: userInfo.name || userInfo.username,
                type: 'TYPING'
            });
        } catch (error) {
            console.error('[useChat] Failed to send typing status:', error);
        }
    }, [roomId, sendMessage]);

    // 메시지 초기화
    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    // 연결 상태 확인
    const isChatConnected = useCallback(() => {
        const wsConnected = isConnected();
        const hasSubscription = isSubscribed;
        const result = wsConnected && hasSubscription;
        
        console.log('[useChat] Chat connection status:', {
            webSocketConnected: wsConnected,
            isSubscribed: hasSubscription,
            subscriptionRef: !!currentSubscription.current,
            finalResult: result
        });
        
        return result;
    }, [isConnected, isSubscribed]);

    return {
        messages,
        isTyping,
        onlineUsers,
        isLoadingHistory,
        subscribeToChatRoom,
        unsubscribeFromChatRoom,
        sendChatMessage,
        sendTypingStatus,
        clearMessages,
        loadChatHistory,
        isChatConnected
    };
};
