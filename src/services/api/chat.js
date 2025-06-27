import { apiRequest } from './core';

const chatApi = {
    // 채팅방 목록 조회
    getChatRooms: async () => {
        return await apiRequest('/chat/rooms');
    },

    // 채팅방 생성 또는 기존 채팅방 조회
    createOrGetChatRoom: async (productId) => {
        return await apiRequest('/chat/rooms', {
            method: 'POST',
            data: { productId }
        });
    },

    // 채팅 기록 조회
    getChatHistory: async (roomId) => {
        return await apiRequest(`/chat/rooms/history/${roomId}`);
    },

    // 채팅방 나가기
    leaveChatRoom: async (roomId) => {
        return await apiRequest(`/chat/rooms/${roomId}`, {
            method: 'DELETE'
        });
    }
};

export { chatApi };