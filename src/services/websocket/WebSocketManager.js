import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { JwtManager } from '../managers/JwtManager';

class WebSocketManager {
    constructor() {
        this.client = null;
        this.connected = false;
        this.connectionPromise = null;
        this.subscriptions = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.lastLoggedConnectionState = null;
    }

    connect() {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = new Promise((resolve, reject) => {
            const token = JwtManager.getToken();
            if (!token) {
                console.error('[WebSocket] No authentication token found');
                reject(new Error('No authentication token found'));
                return;
            }
            
            console.log('[WebSocket] Connecting with token:', token.substring(0, 50) + '...');

            const serverURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
            const wsURL = serverURL.startsWith('/api') 
                ? 'https://api2.nebulazone.store'
                : serverURL;
            
            console.log('[WebSocket] Connecting to:', `${wsURL}/ws`);
            const socket = new SockJS(`${wsURL}/ws`);
            
            this.client = new Client({
                webSocketFactory: () => socket,
                connectHeaders: {
                    'Authorization': `Bearer ${token}`
                },
                debug: (str) => {
                    console.log('[WebSocket Debug]:', str);
                },
                reconnectDelay: this.reconnectDelay,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                onConnect: (frame) => {
                    console.log('[WebSocket] Connected successfully:', frame);
                    console.log('[WebSocket] Connection headers:', frame.headers);
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    this.connectionPromise = null;
                    resolve(this.client);
                },
                onStompError: (frame) => {
                    console.error('[WebSocket] STOMP Error Details:', {
                        command: frame.command,
                        headers: frame.headers,
                        body: frame.body
                    });
                    this.connected = false;
                    this.connectionPromise = null;
                    reject(new Error(`STOMP Error: ${frame.headers['message'] || frame.body || 'Unknown error'}`));
                },
                onWebSocketError: (error) => {
                    console.error('[WebSocket] WebSocket Error:', error);
                    this.connected = false;
                    this.connectionPromise = null;
                    reject(error);
                },
                onDisconnect: () => {
                    console.log('[WebSocket] Disconnected');
                    this.connected = false;
                    this.connectionPromise = null;
                    this.handleReconnect();
                }
            });

            this.client.activate();
        });

        return this.connectionPromise;
    }

    handleReconnect() {
        // 이미 재연결 시도 중이면 중단
        if (this.connectionPromise) {
            console.log('[WebSocket] Reconnection already in progress');
            return;
        }

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[WebSocket] Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            setTimeout(() => {
                // 토큰이 있는 경우에만 재연결 시도
                if (JwtManager.getToken()) {
                    this.connect().catch(error => {
                        console.error('[WebSocket] Reconnection failed:', error);
                    });
                } else {
                    console.log('[WebSocket] No token found, stopping reconnection attempts');
                    this.reconnectAttempts = this.maxReconnectAttempts;
                }
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('[WebSocket] Max reconnection attempts reached');
        }
    }

    // 연결 대기 헬퍼 메소드
    async waitForConnection(timeout = 10000) {
        const startTime = Date.now();
        console.log(`[WebSocket] Starting connection wait, timeout: ${timeout}ms`);
        
        while (!this.isConnected()) {
            const elapsed = Date.now() - startTime;
            
            if (elapsed > timeout) {
                console.error(`[WebSocket] Connection timeout after ${elapsed}ms`);
                throw new Error('Connection timeout');
            }
            
            console.log(`[WebSocket] Waiting for connection... (${elapsed}ms elapsed)`);
            
            if (!this.connectionPromise) {
                console.log(`[WebSocket] No active connection promise, starting new connection`);
                await this.connect();
            }
            
            // 100ms 대기 후 다시 확인
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`[WebSocket] Connection ready after ${Date.now() - startTime}ms`);
        return true;
    }

    async subscribe(destination, callback) {
        try {
            console.log(`[WebSocket] Subscribe request for: ${destination}`);
            
            // 연결 대기
            console.log(`[WebSocket] Waiting for connection...`);
            await this.waitForConnection();
            console.log(`[WebSocket] Connection ready, proceeding with subscription`);

            const subscription = this.client.subscribe(destination, callback);
            this.subscriptions.set(destination, subscription);
            console.log(`[WebSocket] Successfully subscribed to: ${destination}`);
            console.log(`[WebSocket] Subscription object:`, subscription);
            console.log(`[WebSocket] Total subscriptions:`, this.subscriptions.size);
            return subscription;
        } catch (error) {
            console.error(`[WebSocket] Subscription failed for ${destination}:`, error);
            throw error;
        }
    }

    unsubscribe(destination) {
        const subscription = this.subscriptions.get(destination);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
            console.log(`[WebSocket] Unsubscribed from: ${destination}`);
        }
    }

    async sendMessage(destination, body) {
        try {
            // 연결 대기
            await this.waitForConnection();

            this.client.publish({
                destination,
                body: JSON.stringify(body)
            });
            console.log(`[WebSocket] Message sent to ${destination}:`, body);
        } catch (error) {
            console.error(`[WebSocket] Send message failed for ${destination}:`, error);
            throw error;
        }
    }

    disconnect() {
        if (this.client) {
            // 모든 구독 해제
            this.subscriptions.forEach((subscription, destination) => {
                subscription.unsubscribe();
                console.log(`[WebSocket] Unsubscribed from: ${destination}`);
            });
            this.subscriptions.clear();

            this.client.deactivate();
            this.client = null;
            this.connected = false;
            this.connectionPromise = null;
            console.log('[WebSocket] Disconnected and cleaned up');
        }
    }

    isConnected() {
        const connected = this.connected && this.client && this.client.connected;
        // 로그 빈도 줄이기 - 상태가 변경될 때만 로그
        if (this.lastLoggedConnectionState !== connected) {
            console.log('[WebSocket] Connection state changed:', {
                managerConnected: this.connected,
                clientExists: !!this.client,
                clientConnected: this.client?.connected,
                finalResult: connected
            });
            this.lastLoggedConnectionState = connected;
        }
        return connected;
    }
}

// 싱글톤 인스턴스 생성
const webSocketManager = new WebSocketManager();

export default webSocketManager;
