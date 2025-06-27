import { apiRequest, publicApiRequest } from './core';

const auctionApi = {
    // 경매 목록 조회 (공개)
    getAuctions: async (page = 0, size = 10) => {
        return await publicApiRequest(`/auctions?page=${page}&size=${size}`, {}, false);
    },

    // 경매 상세 조회 (공개)
    getAuction: async (auctionId) => {
        return await publicApiRequest(`/auctions/${auctionId}`, {}, false);
    },

    // 경매 삭제
    deleteAuction: async (auctionId) => {
        return await apiRequest(`/auctions/${auctionId}`, {
            method: 'DELETE'
        });
    },

    // 경매 수동 종료
    endAuction: async (auctionId, endData) => {
        return await apiRequest(`/auctions/${auctionId}/end`, {
            method: 'POST',
            data: endData
        });
    },

    // 정렬된 경매 목록 조회 (공개)
    getAuctionsBySort: async (sortType) => {
        return await publicApiRequest(`/auctions/sort/${sortType}`, {}, false);
    }
};

const bidApi = {
    // 입찰하기
    createBid: async (bidData) => {
        return await apiRequest('/bids', {
            method: 'POST',
            data: bidData
        });
    },

    // 내 입찰 내역 조회
    getMyBids: async (page = 0, size = 10) => {
        return await apiRequest(`/bids/me?page=${page}&size=${size}`);
    },

    // 입찰 취소
    deleteBid: async (bidId) => {
        return await apiRequest(`/bids/${bidId}`, {
            method: 'DELETE'
        });
    }
};

export { auctionApi, bidApi };