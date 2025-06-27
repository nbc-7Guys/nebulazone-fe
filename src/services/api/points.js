import { apiRequest, ErrorHandler } from './core';

const pointApi = {
    // 포인트 내역 조회
    getPointHistory: (page = 1, size = 10) =>
        apiRequest(`/point-history?page=${page}&size=${size}`),

    // 포인트 충전
    chargePoint: async (pointData) => {
        try {
            return await apiRequest('/point-history/charge', {
                method: 'POST',
                data: pointData,
            });
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },
};

export { pointApi };