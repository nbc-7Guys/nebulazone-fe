import axios from 'axios';
import {JwtManager} from './managers/JwtManager';
import {ENV} from '../utils/env';
import {getMyUserIdFromJwt} from '../utils/auth/auth';
import {ErrorHandler, parseApiError, logError, isNetworkError} from '../utils/error/errorHandler';

const BASE_URL = ENV.API_BASE_URL;

// Axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: BASE_URL
});

// 요청 인터셉터 - JWT 토큰 자동 추가
axiosInstance.interceptors.request.use(
    (config) => {
        const jwt = JwtManager.getJwt();

        if (jwt) {
            config.headers.Authorization = `Bearer ${jwt}`;
        } else {
            console.warn('[API] No JWT token found for authenticated request');
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
        // 에러 로깅
        logError(error, { 
            interceptor: 'response', 
            url: error.config?.url,
            method: error.config?.method 
        });

        // 네트워크 에러 처리
        if (isNetworkError(error)) {
            return Promise.reject(error);
        }

        const apiError = parseApiError(error);
        
        // JWT 에러인지 확인 (개선된 로직)
        const isJwtError = apiError.status === 401 && (
            apiError.code?.includes('JWT') || 
            apiError.code?.includes('TOKEN') ||
            apiError.message?.toLowerCase().includes('token') ||
            apiError.message?.toLowerCase().includes('jwt')
        );

        if (isJwtError) {
            console.warn('[API] JWT Error detected:', apiError.message);
            JwtManager.removeTokens();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // 401 에러 처리 (일반적인 인증 실패)
        if (apiError.status === 401) {
            console.warn('[API] 401 Unauthorized error detected');
            // 게시글 관련 요청의 경우 자동 리다이렉트 하지 않고 에러를 던져서 재시도 로직이 동작하도록 함
            if (error.config?.url?.includes('/posts')) {
                console.log('[API] Posts API 401 error - not redirecting, letting retry logic handle it');
                return Promise.reject(error);
            }
            JwtManager.removeTokens();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

// 인증이 필요 없는 요청을 위한 Axios 인스턴스
const publicAxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 인증이 필요 없는 API 요청을 위한 헬퍼 함수 (현재 사용하지 않음)
// eslint-disable-next-line no-unused-vars
const publicApiRequest = async (endpoint, options = {}) => {
    try {
        const response = await publicAxiosInstance(endpoint, options);
        return response.data;
    } catch (error) {
        // 새로운 에러 핸들링 시스템 사용
        logError(error, { 
            type: 'publicApiRequest', 
            endpoint,
            options 
        });
        
        const apiError = parseApiError(error);
        error.apiError = apiError;
        throw error;
    }
};

// API 요청 헬퍼 함수
const apiRequest = async (endpoint, options = {}, requireAuth = true) => {
    try {
        // 인증이 필요한 경우 인증 인스턴스 사용, 그렇지 않으면 공개 인스턴스 사용
        const instance = requireAuth ? axiosInstance : publicAxiosInstance;
        const response = await instance(endpoint, options);
        console.log(response.data);
        return response.data;
    } catch (error) {
        // 새로운 에러 핸들링 시스템 사용
        logError(error, { 
            type: 'apiRequest', 
            endpoint,
            options,
            requireAuth 
        });
        
        const apiError = parseApiError(error);
        error.apiError = apiError;
        throw error;
    }
};

// 에러를 포함한 API 요청 헬퍼 함수 (에러 알림 자동 표시)
const apiRequestWithAlert = async (endpoint, options = {}, requireAuth = true, showAlert = true) => {
    try {
        return await apiRequest(endpoint, options, requireAuth);
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
                data: {email, password},
            }, false); // 로그인은 인증이 필요 없음
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
    // 상품 목록 조회 (인증 필요 없음)
    getProducts: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.productname) queryParams.append('productname', params.productname);
        if (params.sellernickname) queryParams.append('sellernickname', params.sellernickname);
        if (params.type) queryParams.append('type', params.type);
        if (params.from) queryParams.append('from', params.from);
        if (params.to) queryParams.append('to', params.to);
        if (params.page) queryParams.append('page', params.page);
        if (params.size) queryParams.append('size', params.size);

        const query = queryParams.toString();
        return apiRequest(`/products${query ? `?${query}` : ''}`, {}, false); // 인증 필요 없음
    },

    // 상품 상세 조회 (인증 필요 없음)
    getProduct: (catalogId, productId) =>
        apiRequest(`/catalogs/${catalogId}/products/${productId}`, {}, false), // 인증 필요 없음

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
        apiRequest(`/auctions/${auctionId}/manual-end`, {
            method: 'PATCH',
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
    // 카테고리 목록 조회 (인증 필요 없음)
    getCatalogs: (keyword = '', page = 1, size = 10, type = 'CPU') => {
        const queryParams = new URLSearchParams();
        queryParams.append('type', type); // 파라미터로 받은 type 사용
        if (keyword) queryParams.append('keyword', keyword);
        queryParams.append('page', page.toString());
        queryParams.append('size', size.toString());

        return apiRequest(`/catalogs?${queryParams.toString()}`, {}, false); // 인증 필요 없음
    },

    // 카테고리 상세 조회 (인증 필요 없음)
    getCatalog: (catalogId) =>
        apiRequest(`/catalogs/${catalogId}`, {}, false), // 인증 필요 없음
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
            const response = await apiRequest('/users', {
                method: 'PUT',
                data: formData
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
                data: {password},
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
    // 읽지 않은 알림 목록 조회
    getUnreadNotifications: () =>
        apiRequest('/notifications'),

    // 알림 읽음 처리
    markAsRead: (notificationId) =>
        apiRequest(`/notification/${notificationId}/read`, {
            method: 'PATCH'
        }),

    // 모든 알림 읽음 처리
    markAllAsRead: () =>
        apiRequest('/notification/read-all', {
            method: 'PATCH'
        }),
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

// 게시글 관련 API
export const postApi = {
    // 게시글 작성 (인증 필요)
    createPost: async (postData, images) => {
        const formData = new FormData();

        // JSON 파트에 Content-Type 명시적으로 설정
        const postBlob = new Blob([JSON.stringify(postData)], {
            type: 'application/json'
        });
        formData.append('post', postBlob);

        // 이미지 파일들 추가
        if (images && images.length > 0) {
            images.forEach(image => {
                formData.append('images', image);
            });
        }

        try {
            const response = await axiosInstance.post('/posts', formData, {
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

    // 게시글 수정 (인증 필요)
    updatePost: async (postId, postData, images) => {
        const formData = new FormData();

        // JSON 파트에 Content-Type 명시적으로 설정
        const postBlob = new Blob([JSON.stringify(postData)], {
            type: 'application/json'
        });
        formData.append('post', postBlob);

        // 이미지 파일들 추가
        if (images && images.length > 0) {
            images.forEach(image => {
                formData.append('images', image);
            });
        }

        try {
            const response = await axiosInstance.put(`/posts/${postId}`, formData, {
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

    // 게시글 삭제 (인증 필요)
    deletePost: async (postId) => {
        try {
            return await apiRequest(`/posts/${postId}`, {
                method: 'DELETE',
            }, true); // 인증 필요
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 게시글 목록 검색 (인증 여부를 매개변수로 받음)
    searchPosts: (params = {}, requireAuth = true) => {
        const queryParams = new URLSearchParams();

        // 검색 키워드
        if (params.keyword) queryParams.append('keyword', params.keyword);

        // 게시글 타입 (필수)
        if (params.type) queryParams.append('type', params.type);

        // 페이지네이션
        if (params.page) queryParams.append('page', params.page);
        if (params.size) queryParams.append('size', params.size);

        const query = queryParams.toString();
        return apiRequest(`/posts${query ? `?${query}` : ''}`, {}, requireAuth);
    },

    // 게시글 상세 조회 (인증 여부를 매개변수로 받음)
    getPost: (postId, requireAuth = true) =>
        apiRequest(`/posts/${postId}`, {}, requireAuth),
};

// 댓글 관련 API
export const commentApi = {
    // 댓글 작성
    createComment: async (postId, commentData) => {
        try {
            return await apiRequest(`/posts/${postId}/comments`, {
                method: 'POST',
                data: commentData,
            }, true); // 인증 필요
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 댓글 목록 조회
    getComments: (postId, page = 1, size = 20) => {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('size', size.toString());

        return apiRequest(`/posts/${postId}/comments?${queryParams.toString()}`, {}, true);
    },

    // 댓글 수정
    updateComment: async (postId, commentId, commentData) => {
        try {
            return await apiRequest(`/posts/${postId}/comments/${commentId}`, {
                method: 'PUT',
                data: commentData,
            }, true); // 인증 필요
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 댓글 삭제
    deleteComment: async (postId, commentId) => {
        try {
            return await apiRequest(`/posts/${postId}/comments/${commentId}`, {
                method: 'DELETE',
            }, true); // 인증 필요
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },
};

// 추가로 개발된 에러 처리 유틸리티 함수들을 export
export {ErrorHandler, apiRequestWithAlert};
