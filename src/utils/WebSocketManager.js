import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { JwtManager } from './JwtManager';

class WebSocketManager {
    constructor() {
        this.client = null;
        this.connected = false;
        this.connectionPromise = null;
        this.subscriptions = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect() {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = new Promise((resolve, reject) => {
            const token = JwtManager.getToken();
            if (!token) {
                reject(new Error('No authentication token found'));
                return;
            }

            const serverURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
            const wsURL = serverURL.startsWith('/api') 
                ? 'https://api.nebulazone.store' 
                : serverURL;
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
                    console.log('[WebSocket] Connected:', frame);
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    this.connectionPromise = null;
                    resolve(this.client);
                },
                onStompError: (frame) => {
                    console.error('[WebSocket] STOMP Error:', frame);
                    this.connected = false;
                    this.connectionPromise = null;
                    reject(new Error(frame.headers['message']));
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
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[WebSocket] Reconnecting... Attempt ${this.reconnectAttempts}`);
            
            setTimeout(() => {
                this.connect().catch(error => {
                    console.error('[WebSocket] Reconnection failed:', error);
                });
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('[WebSocket] Max reconnection attempts reached');
        }
    }

    async subscribe(destination, callback) {
        try {
            if (!this.connected) {
                await this.connect();
            }

            const subscription = this.client.subscribe(destination, callback);
            this.subscriptions.set(destination, subscription);
            console.log(`[WebSocket] Subscribed to: ${destination}`);
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
            if (!this.connected) {
                await this.connect();
            }

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
        return this.connected;
    }
}

// 싱글톤 인스턴스 생성
const webSocketManager = new WebSocketManager();

export default webSocketManager;
