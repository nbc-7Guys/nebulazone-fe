import { JwtManager } from '../utils/JwtManager';

const BASE_URL = 'http://localhost:8080';

// API 요청 헬퍼 함수
const apiRequest = async (endpoint, options = {}) => {
    const jwt = JwtManager.getJwt();
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(jwt && { Authorization: `Bearer ${jwt}` }),
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        
        if (response.status === 401) {
            // 토큰 만료 시 로그인 페이지로 리다이렉트
            JwtManager.removeTokens();
            window.location.href = '/login';
            return;
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

// 인증 관련 API
export const authApi = {
    // 로그인
    signIn: (email, password) =>
        apiRequest('/auth/signin', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    // 로그아웃
    signOut: () =>
        apiRequest('/auth/signout', {
            method: 'POST',
        }),

    // 토큰 재발급
    reissueToken: () =>
        fetch(`${BASE_URL}/auth/reissue`, {
            method: 'POST',
            credentials: 'include', // 쿠키 포함
        }).then(response => {
            if (!response.ok) {
                throw new Error('토큰 재발급 실패');
            }
            return response.json();
        }),

    // 회원가입
    signUp: (userData) =>
        apiRequest('/users/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),
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
    createProduct: (catalogId, productData, images) => {
        const formData = new FormData();
        formData.append('product', JSON.stringify(productData));
        
        if (images && images.length > 0) {
            images.forEach(image => {
                formData.append('images', image);
            });
        }

        return apiRequest(`/catalogs/${catalogId}/products`, {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: `Bearer ${JwtManager.getJwt()}`,
            },
        });
    },

    // 상품 수정
    updateProduct: (catalogId, productId, productData, images) => {
        const formData = new FormData();
        formData.append('product', JSON.stringify(productData));
        
        if (images && images.length > 0) {
            images.forEach(image => {
                formData.append('images', image);
            });
        }

        return apiRequest(`/catalogs/${catalogId}/products/${productId}`, {
            method: 'PUT',
            body: formData,
            headers: {
                Authorization: `Bearer ${JwtManager.getJwt()}`,
            },
        });
    },

    // 상품 삭제
    deleteProduct: (catalogId, productId) =>
        apiRequest(`/catalogs/${catalogId}/products/${productId}`, {
            method: 'DELETE',
        }),

    // 상품 구매
    purchaseProduct: (catalogId, productId) =>
        apiRequest(`/catalogs/${catalogId}/products/${productId}/purchase`, {
            method: 'POST',
        }),

    // 경매로 전환
    changeToAuction: (catalogId, productId, auctionData) =>
        apiRequest(`/catalogs/${catalogId}/products/${productId}/auction-type`, {
            method: 'PATCH',
            body: JSON.stringify(auctionData),
        }),
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
            body: JSON.stringify(endData),
        }),

    // 정렬별 경매 조회
    getAuctionsBySort: (sortType) =>
        apiRequest(`/auctions/sorted?sortType=${sortType}`),
};

// 입찰 관련 API
export const bidApi = {
    // 입찰하기
    createBid: (bidData) =>
        apiRequest('/bids', {
            method: 'POST',
            body: JSON.stringify(bidData),
        }),

    // 내 입찰 목록
    getMyBids: (page = 1, size = 10) =>
        apiRequest(`/bids/my?page=${page}&size=${size}`),

    // 입찰 취소
    deleteBid: (bidId) =>
        apiRequest(`/bids/${bidId}`, {
            method: 'DELETE',
        }),
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
    createOrGetChatRoom: (productId) =>
        apiRequest('/chat/rooms', {
            method: 'POST',
            body: JSON.stringify({ productId }),
        }),

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
    // 내 정보 조회
    getMyProfile: () =>
        apiRequest('/users/me'),

    // 사용자 정보 조회
    getUserProfile: (userId) =>
        apiRequest(`/users/${userId}`),

    // 프로필 수정
    updateProfile: (userData) =>
        apiRequest('/users', {
            method: 'PATCH',
            body: JSON.stringify(userData),
        }),

    // 프로필 이미지 업데이트
    updateProfileImage: (imageFile) => {
        const formData = new FormData();
        formData.append('profileImage', imageFile);
        
        return apiRequest('/users', {
            method: 'PUT',
            body: formData,
            headers: {
                Authorization: `Bearer ${JwtManager.getJwt()}`,
            },
        });
    },

    // 회원 탈퇴
    withdraw: (password) =>
        apiRequest('/users', {
            method: 'DELETE',
            body: JSON.stringify({ password }),
        }),
};

// 거래 관련 API
export const transactionApi = {
    // 거래 내역 조회
    getTransactions: (page = 1, size = 10) =>
        apiRequest(`/transactions?page=${page}&size=${size}`),

    // 거래 상세 조회
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
    chargePoint: (pointData) =>
        apiRequest('/point-history/charge', {
            method: 'POST',
            body: JSON.stringify(pointData),
        }),
};
