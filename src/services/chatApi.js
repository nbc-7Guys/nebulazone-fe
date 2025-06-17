import axios from 'axios';
import { JwtManager } from "../utils/JwtManager";
import { ENV } from "../utils/env";

const BASE_URL = ENV.API_BASE_URL;

// Axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 - JWT 토큰 자동 추가
axiosInstance.interceptors.request.use(
    (config) => {
        const token = JwtManager.getJwt();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 - 401 에러 처리
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // 토큰 만료 시 로그인 페이지로 리다이렉트
            JwtManager.removeTokens();
            window.location.href = '/login';
            throw new Error('인증이 만료되었습니다.');
        }
        
        console.error('API 호출 에러:', error);
        throw error;
    }
);

// API 호출 헬퍼 함수
const apiCall = async (url, options = {}) => {
    try {
        const response = await axiosInstance(url, options);
        return response.data;
    } catch (error) {
        console.error('API 호출 에러:', error);
        throw error;
    }
};

// 채팅 API 함수들
export const chatApi = {
    // 채팅방 생성 또는 기존 채팅방 조회
    createOrGetChatRoom: async (productId) => {
        return await apiCall('/chat/rooms', {
            method: 'POST',
            data: { productId }
        });
    },

    // 내 채팅방 목록 조회
    getChatRooms: async () => {
        return await apiCall('/chat/rooms');
    },

    // 채팅 내역 조회
    getChatHistory: async (roomId) => {
        return await apiCall(`/chat/rooms/history/${roomId}`);
    },

    // 채팅방 나가기
    leaveChatRoom: async (roomId) => {
        return await apiCall(`/chat/rooms/${roomId}`, {
            method: 'DELETE'
        });
    }
};

// WebSocket 연결 관리 클래스
export class ChatWebSocketManager {
    constructor() {
        this.stompClient = null;
        this.isConnected = false;
        this.connectionCallbacks = [];
        this.disconnectionCallbacks = [];
        this.errorCallbacks = [];
    }

    // 연결 상태 변경 리스너
    onConnectionChange(callback) {
        this.connectionCallbacks.push(callback);
    }

    onDisconnection(callback) {
        this.disconnectionCallbacks.push(callback);
    }

    onError(callback) {
        this.errorCallbacks.push(callback);
    }

    // 연결
    connect() {
        return new Promise((resolve, reject) => {
            const token = JwtManager.getJwt();
            if (!token) {
                reject(new Error('JWT 토큰이 없습니다.'));
                return;
            }

            import('sockjs-client/dist/sockjs').then(({ default: SockJS }) => {
                return import('@stomp/stompjs');
            }).then(({ Client }) => {
                const socket = new SockJS(`${BASE_URL}/ws`);
                this.stompClient = new Client({
                    webSocketFactory: () => socket,
                    connectHeaders: { Authorization: `Bearer ${token}` },
                    debug: () => {}, // 디버그 로그 비활성화
                    onConnect: () => {
                        this.isConnected = true;
                        this.connectionCallbacks.forEach(callback => callback(true));
                        resolve();
                    },
                    onStompError: (frame) => {
                        this.isConnected = false;
                        const error = new Error(`WebSocket 연결 실패: ${frame.headers["message"] || "알 수 없는 에러"}`);
                        this.errorCallbacks.forEach(callback => callback(error));
                        reject(error);
                    },
                    onDisconnect: () => {
                        this.isConnected = false;
                        this.connectionCallbacks.forEach(callback => callback(false));
                        this.disconnectionCallbacks.forEach(callback => callback());
                    },
                });

                this.stompClient.activate();
            }).catch(reject);
        });
    }

    // 연결 해제
    disconnect() {
        if (this.stompClient) {
            try {
                this.stompClient.deactivate();
            } catch (error) {
                console.error('WebSocket 연결 해제 에러:', error);
            }
        }
        this.isConnected = false;
    }

    // 채팅방 구독
    subscribeToRoom(roomId, messageCallback) {
        if (!this.stompClient || !this.isConnected) {
            throw new Error('WebSocket이 연결되지 않았습니다.');
        }

        return this.stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
            try {
                const content = JSON.parse(message.body);
                messageCallback(content);
            } catch (error) {
                // JSON 파싱 실패 시 시스템 메시지로 처리
                messageCallback({
                    message: message.body,
                    system: true,
                    sendTime: new Date().toISOString()
                });
            }
        });
    }

    // 메시지 전송
    sendMessage(roomId, message, messageType = 'TEXT') {
        if (!this.stompClient || !this.isConnected) {
            throw new Error('WebSocket이 연결되지 않았습니다.');
        }

        this.stompClient.publish({
            destination: `/chat/send/${roomId}`,
            body: JSON.stringify({
                message,
                type: messageType
            }),
        });
    }

    // 연결 상태 확인
    getConnectionStatus() {
        return this.isConnected;
    }
}

// 전역 WebSocket 인스턴스 (싱글톤)
export const chatWebSocket = new ChatWebSocketManager();
