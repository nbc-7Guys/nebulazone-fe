// 채팅 관련 상수

export const MESSAGE_TYPES = {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
    SYSTEM: 'SYSTEM',
    JOIN: 'JOIN',
    LEAVE: 'LEAVE'
};

export const WEBSOCKET_ENDPOINTS = {
    CONNECT: '/ws',
    SUBSCRIBE_ROOM: (roomId) => `/topic/chat/${roomId}`,
    SEND_MESSAGE: (roomId) => `/chat/send/${roomId}`
};

export const CHAT_CONSTANTS = {
    MAX_MESSAGE_LENGTH: 1000,
    MAX_RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 3000,
    HEARTBEAT_INTERVAL: 30000,
    CONNECTION_TIMEOUT: 10000
};

export const CHAT_STATUS = {
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    DISCONNECTED: 'DISCONNECTED',
    ERROR: 'ERROR',
    RECONNECTING: 'RECONNECTING'
};

export const ERROR_MESSAGES = {
    CONNECTION_FAILED: '채팅 서버 연결에 실패했습니다.',
    MESSAGE_SEND_FAILED: '메시지 전송에 실패했습니다.',
    UNAUTHORIZED: '인증이 필요합니다.',
    ROOM_NOT_FOUND: '채팅방을 찾을 수 없습니다.',
    USER_NOT_IN_ROOM: '채팅방에 참여하지 않은 사용자입니다.'
};
