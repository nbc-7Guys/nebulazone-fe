import axios from 'axios';
import { JwtManager } from '../utils/JwtManager';
import { ENV } from '../utils/env';
import { getMyUserIdFromJwt } from '../utils/auth';
import { ErrorHandler } from '../utils/errorHandler';

const BASE_URL = ENV.API_BASE_URL;

// Axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 - JWT 토큰 자동 추가
axiosInstance.interceptors.request.use(
    (config) => {
        const jwt = JwtManager.getJwt();
        if (jwt) {
            config.headers.Authorization = `Bearer ${jwt}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 - 에러 처리
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // JWT 에러인지 확인
        if (ErrorHandler.isJwtError(error)) {
            console.warn('JWT Error detected:', error.response?.data?.message);
            JwtManager.removeTokens();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // 401 에러 처리 (일반적인 인증 실패)
        if (error.response && error.response.status === 401) {
            JwtManager.removeTokens();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // 에러 로깅
        console.error('API Request Error:', ErrorHandler.handleApiError(error));
        return Promise.reject(error);
    }
);

// API 요청 헬퍼 함수
const apiRequest = async (endpoint, options = {}) => {
    try {
        const response = await axiosInstance(endpoint, options);
        return response.data;
    } catch (error) {
        // 구체적인 에러 정보 추가
        const errorInfo = ErrorHandler.handleApiError(error);
        console.error(`API Request Failed [${endpoint}]:`, errorInfo);
        
        // 원본 에러에 추가 정보 첨부
        error.errorInfo = errorInfo;
        throw error;
    }
};

// 에러를 포함한 API 요청 헬퍼 함수 (에러 알림 자동 표시)
const apiRequestWithAlert = async (endpoint, options = {}, showAlert = true) => {
    try {
        return await apiRequest(endpoint, options);
    } catch (error) {
        if (showAlert) {
            ErrorHandler.showErrorAlert(error);
        }
        throw error;
    }
};

// 인증 관련 API
export const authApi = {
    // 로그인
    signIn: async (email, password) => {
        try {
            return await apiRequest('/auth/signin', {
                method: 'POST',
                data: { email, password },
            });
        } catch (error) {
            // 로그인 실패 시 구체적인 메시지 표시
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 로그아웃
    signOut: () =>
        apiRequest('/auth/signout', {
            method: 'POST',
        }),

    // 토큰 재발급
    reissueToken: async () => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/reissue`, {}, {
                withCredentials: true, // 쿠키 포함
            });
            return response.data;
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message || '토큰 재발급 실패');
        }
    },

    // 회원가입
    signUp: async (userData) => {
        try {
            return await apiRequest('/users/signup', {
                method: 'POST',
                data: userData,
            });
        } catch (error) {
            // 회원가입 실패 시 구체적인 메시지 표시
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },
};

// 상품 관련 API
export const productApi = {
    // 상품 목록 조회
    getProducts: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.name) queryParams.append('name', params.name);
        if (params.type) queryParams.append('type', params.type);
        if (params.from) queryParams.append('from', params.from);
        if (params.to) queryParams.append('to', params.to);
        if (params.page) queryParams.append('page', params.page);
        if (params.size) queryParams.append('size', params.size);
        
        const query = queryParams.toString();
        return apiRequest(`/products${query ? `?${query}` : ''}`);
    },

    // 상품 상세 조회
    getProduct: (catalogId, productId) => 
        apiRequest(`/catalogs/${catalogId}/products/${productId}`),

    // 상품 등록
    createProduct: async (catalogId, productData, images) => {
        const formData = new FormData();
        
        // JSON 파트에 Content-Type 명시적으로 설정
        const productBlob = new Blob([JSON.stringify(productData)], {
            type: 'application/json'
        });
        formData.append('product', productBlob);
        
        if (images && images.length > 0) {
            images.forEach(image => {
                formData.append('images', image);
            });
        }

        try {
            const response = await axiosInstance.post(`/catalogs/${catalogId}/products`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 상품 수정
    updateProduct: async (catalogId, productId, productData, images) => {
        const formData = new FormData();
        
        // JSON 파트에 Content-Type 명시적으로 설정
        const productBlob = new Blob([JSON.stringify(productData)], {
            type: 'application/json'
        });
        formData.append('product', productBlob);
        
        if (images && images.length > 0) {
            images.forEach(image => {
                formData.append('images', image);
            });
        }

        try {
            const response = await axiosInstance.put(`/catalogs/${catalogId}/products/${productId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 상품 삭제
    deleteProduct: (catalogId, productId) =>
        apiRequest(`/catalogs/${catalogId}/products/${productId}`, {
            method: 'DELETE',
        }),

    // 상품 구매
    purchaseProduct: async (catalogId, productId) => {
        try {
            return await apiRequest(`/catalogs/${Number(catalogId)}/products/${Number(productId)}/purchase`, {
                method: 'POST',
            });
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },
};

// 경매 관련 API
export const auctionApi = {
    // 경매 목록 조회
    getAuctions: (page = 1, size = 10) =>
        apiRequest(`/auctions?page=${page}&size=${size}`),

    // 경매 상세 조회
    getAuction: (auctionId) =>
        apiRequest(`/auctions/${auctionId}`),

    // 경매 삭제
    deleteAuction: (auctionId) =>
        apiRequest(`/auctions/${auctionId}`, {
            method: 'DELETE',
        }),

    // 수동 경매 종료
    endAuction: (auctionId, endData) =>
        apiRequest(`/auctions/${auctionId}/manual-end`, {
            method: 'PATCH',
            data: endData,
        }),

    // 정렬별 경매 조회
    getAuctionsBySort: (sortType) =>
        apiRequest(`/auctions/sorted?sortType=${sortType}`),
};

// 입찰 관련 API
export const bidApi = {
    // 입찰하기
    createBid: async (bidData) => {
        try {
            return await apiRequest('/bids', {
                method: 'POST',
                data: bidData,
            });
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 내 입찰 목록
    getMyBids: (page = 1, size = 10) =>
        apiRequest(`/bids/my?page=${page}&size=${size}`),

    // 입찰 취소
    deleteBid: async (bidId) => {
        try {
            return await apiRequest(`/bids/${bidId}`, {
                method: 'DELETE',
            });
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },
};

// 카테고리 관련 API
export const catalogApi = {
    // 카테고리 목록 조회
    getCatalogs: (keyword = '', page = 1, size = 10, type = 'CPU') => {
        const queryParams = new URLSearchParams();
        queryParams.append('type', type); // 파라미터로 받은 type 사용
        if (keyword) queryParams.append('keyword', keyword);
        queryParams.append('page', page.toString());
        queryParams.append('size', size.toString());
        
        return apiRequest(`/catalogs?${queryParams.toString()}`);
    },

    // 카테고리 상세 조회
    getCatalog: (catalogId) =>
        apiRequest(`/catalogs/${catalogId}`),
};

// 채팅 관련 API
export const chatApi = {
    // 채팅방 목록 조회
    getChatRooms: () =>
        apiRequest('/chat/rooms'),

    // 채팅방 생성 또는 기존 채팅방 조회
    createOrGetChatRoom: async (productId) => {
        try {
            return await apiRequest('/chat/rooms', {
                method: 'POST',
                data: { productId },
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

// 사용자 관련 API
export const userApi = {
    // 내 정보 조회 (현재 사용자 ID를 사용해서 조회)
    getMyProfile: async () => {
        const userId = getMyUserIdFromJwt();
        if (!userId) {
            throw new Error('로그인이 필요합니다.');
        }
        try {
            return await apiRequest(`/users/${userId}`);
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 사용자 정보 조회
    getUserProfile: (userId) =>
        apiRequest(`/users/${userId}`),

    // 프로필 수정 (닉네임 또는 비밀번호)
    updateProfile: async (userData) => {
        try {
            return await apiRequest('/users', {
                method: 'PATCH',
                data: userData,
            });
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 프로필 이미지 업데이트
    updateProfileImage: async (imageFile) => {
        const formData = new FormData();
        formData.append('profileImage', imageFile);
        
        try {
            const response = await axiosInstance.put('/users', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 회원 탈퇴
    withdraw: async (password) => {
        try {
            return await apiRequest('/users', {
                method: 'DELETE',
                data: { password },
            });
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },
};

// 거래 관련 API
export const transactionApi = {
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

// 알림 관련 API
export const notificationApi = {
    // 알림 목록 조회
    getNotifications: (page = 1, size = 10) =>
        apiRequest(`/notifications?page=${page}&size=${size}`),
};

// 포인트 관련 API  
export const pointApi = {
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

// 추가로 개발된 에러 처리 유틸리티 함수들을 export
export { ErrorHandler, apiRequestWithAlert };
