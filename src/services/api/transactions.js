import { apiRequest } from './core';

const transactionApi = {
    // 내 거래 내역 조회
    getMyTransactions: async (page = 0, size = 10) => {
        return await apiRequest(`/transactions/me?page=${page}&size=${size}`);
    },

    // 내 거래 상세 조회
    getMyTransaction: async (transactionId) => {
        return await apiRequest(`/transactions/me/${transactionId}`);
    },

    // 모든 거래 내역 조회 (관리자)
    getTransactions: async (page = 0, size = 10) => {
        return await apiRequest(`/transactions?page=${page}&size=${size}`);
    },

    // 거래 상세 조회 (관리자)
    getTransaction: async (transactionId) => {
        return await apiRequest(`/transactions/${transactionId}`);
    }
};

export { transactionApi };