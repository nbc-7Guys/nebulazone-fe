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

    // 이미지 메시지 전송
    sendImageMessage: async (roomId, imageFile, type = 'IMAGE') => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('type', type);

            return await apiRequest(`/send/image/${roomId}`, {
                method: 'POST',
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },
};

export { chatApi };