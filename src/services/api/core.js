import axios from 'axios';
import { JwtManager } from '../managers/JwtManager';
import { ENV } from '../../utils/env';
import { ErrorHandler } from '../../utils/error/errorHandler';

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
        // JWT 에러인지 확인
        if (ErrorHandler.isJwtError(error)) {
            console.warn('[API] JWT Error detected:', error.response?.data?.message);
            JwtManager.removeTokens();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // 401 에러 처리 (일반적인 인증 실패)
        if (error.response && error.response.status === 401) {
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

        // 에러 로깅
        console.error('API Request Error:', ErrorHandler.handleApiError(error));
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

// 인증이 필요 없는 API 요청을 위한 헬퍼 함수
const publicApiRequest = async (endpoint, options = {}) => {
    try {
        const response = await publicAxiosInstance(endpoint, options);
        return response.data;
    } catch (error) {
        // 구체적인 에러 정보 추가
        const errorInfo = ErrorHandler.handleApiError(error);
        console.error(`Public API Request Failed [${endpoint}]:`, errorInfo);

        // 원본 에러에 추가 정보 첨부
        error.errorInfo = errorInfo;
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
        // 구체적인 에러 정보 추가
        const errorInfo = ErrorHandler.handleApiError(error);
        console.error(`API Request Failed [${endpoint}]:`, errorInfo);

        // 원본 에러에 추가 정보 첨부
        error.errorInfo = errorInfo;
        throw error;
    }
};

// 알림 포함 API 요청 헬퍼 함수
const apiRequestWithAlert = async (endpoint, options = {}, requireAuth = true, showAlert = true) => {
    try {
        const data = await apiRequest(endpoint, options, requireAuth);
        if (showAlert && data.message) {
            alert(data.message);
        }
        return data;
    } catch (error) {
        if (showAlert) {
            const errorMessage = error.errorInfo?.userMessage || '요청 처리 중 오류가 발생했습니다.';
            alert(errorMessage);
        }
        throw error;
    }
};

export {
    axiosInstance,
    publicAxiosInstance,
    apiRequest,
    publicApiRequest,
    apiRequestWithAlert,
    ErrorHandler,
    BASE_URL
};