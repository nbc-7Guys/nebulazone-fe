import { apiRequest, publicApiRequest, ErrorHandler } from './core';

const auctionApi = {
    // 경매 목록 조회 (인증 필요 없음)
    getAuctions: (page = 1, size = 10) =>
        apiRequest(`/auctions?page=${page}&size=${size}`, {}, false), // 인증 필요 없음

    // 경매 상세 조회 (인증 필요 없음)
    getAuction: (auctionId) =>
        apiRequest(`/auctions/${auctionId}`, {}, false), // 인증 필요 없음

    // 경매 삭제
    deleteAuction: (auctionId) =>
        apiRequest(`/auctions/${auctionId}`, {
            method: 'DELETE',
        }),

    // 수동 경매 종료
    endAuction: (auctionId, endData) =>
        apiRequest(`/auctions/${auctionId}`, {
            method: 'POST',
            data: endData,
        }),

    // 정렬별 경매 조회 (인증 필요 없음)
    getAuctionsBySort: async (sortType) => {
        try {
            const response = await apiRequest(`/auctions/sorted?sort=${sortType}`, {}, false);
            return response;
        } catch (error) {
            console.error(`${sortType} 타입 경매 조회 오류:`, error);
            return []; // 오류 발생 시 빈 배열 반환
        }
    },
};

const bidApi = {
    // 입찰하기
    createBid: async (auctionId, bidData) => {
        try {
            return await apiRequest(`/auctions/${auctionId}/bids`, {
                method: 'POST',
                data: bidData,
            });
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 특정 경매의 입찰 내역 조회
    getAuctionBids: (auctionId, page = 1, size = 10) =>
        apiRequest(`/auctions/${auctionId}/bids?page=${page}&size=${size}`, {}, false),

    // 내 입찰 목록
    getMyBids: (page = 1, size = 10) =>
        apiRequest(`/bids/me?page=${page}&size=${size}`),

    // 입찰 취소
    deleteBid: async (auctionId, bidPrice) => {
        try {
            return await apiRequest(`/auctions/${auctionId}/bids/${bidPrice}`, {
                method: 'DELETE',
            });
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },
};

export { auctionApi, bidApi };