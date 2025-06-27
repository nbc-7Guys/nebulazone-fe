import { apiRequest } from './core';

const transactionApi = {
    // 내 거래 내역 조회
    getMyTransactions: (page = 1, size = 20) =>
        apiRequest(`/transactions/me?page=${page}&size=${size}`),

    // 내 거래 상세 조회
    getMyTransaction: (transactionId) =>
        apiRequest(`/transactions/${transactionId}/me`),

    // 일반 거래 내역 조회 (관리자용)
    getTransactions: (page = 1, size = 10) =>
        apiRequest(`/transactions?page=${page}&size=${size}`),

    // 일반 거래 상세 조회 (관리자용)
    getTransaction: (transactionId) =>
        apiRequest(`/transactions/${transactionId}`),
};

export { transactionApi };