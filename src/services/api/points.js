import { apiRequest } from './core';

const pointApi = {
    // 포인트 내역 조회
    getPointHistory: async (page = 0, size = 10) => {
        return await apiRequest(`/point/history?page=${page}&size=${size}`);
    },

    // 포인트 충전
    chargePoint: async (pointData) => {
        return await apiRequest('/point/charge', {
            method: 'POST',
            data: pointData
        });
    }
};

export { pointApi };