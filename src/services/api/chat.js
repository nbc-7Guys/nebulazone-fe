import { apiRequest, ErrorHandler } from './core';

const chatApi = {
    // 채팅방 목록 조회
    getChatRooms: () =>
        apiRequest('/chat/rooms'),

    // 채팅방 생성 또는 기존 채팅방 조회
    createOrGetChatRoom: async (productId) => {
        try {
            return await apiRequest('/chat/rooms', {
                method: 'POST',
                data: {productId},
            });
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 채팅 기록 조회
    getChatHistory: (roomId) =>
        apiRequest(`/chat/rooms/history/${roomId}`),

    // 채팅방 나가기
    leaveChatRoom: (roomId) =>
        apiRequest(`/chat/rooms/${roomId}`, {
            method: 'DELETE',
        }),
};

export { chatApi };