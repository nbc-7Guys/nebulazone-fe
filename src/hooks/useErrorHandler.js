import { useNavigate } from 'react-router-dom';
import { useToast } from './useToast';
import { 
    parseApiError, 
    getUserFriendlyMessage, 
    getErrorAction, 
    mapValidationErrors,
    isNetworkError,
    logError 
} from '../utils/error/errorHandler';

/**
 * 전역 에러 핸들링 훅
 * API 에러를 자동으로 처리하고 사용자에게 적절한 피드백 제공
 */
export function useErrorHandler() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    /**
     * API 에러를 처리하는 메인 함수
     * @param {Error} error - 에러 객체
     * @param {Object} options - 처리 옵션
     * @returns {Object} 에러 정보와 액션
     */
    const handleError = (error, options = {}) => {
        const {
            context = {},
            showToastOnError = true,
            redirectOnAuth = true,
            returnValidationErrors = false
        } = options;

        // 에러 로깅
        logError(error, context);

        // 네트워크 에러 처리
        if (isNetworkError(error)) {
            if (showToastOnError) {
                showToast({
                    type: 'error',
                    message: '네트워크 연결을 확인해주세요.',
                    duration: 5000
                });
            }
            return { 
                type: 'network_error', 
                message: '네트워크 연결을 확인해주세요.' 
            };
        }

        // API 에러 파싱
        const apiError = parseApiError(error);
        const friendlyMessage = getUserFriendlyMessage(apiError);
        const errorAction = getErrorAction(apiError);

        // 액션에 따른 처리
        switch (errorAction.action) {
            case 'redirect':
                if (redirectOnAuth) {
                    if (showToastOnError) {
                        showToast({
                            type: 'warning',
                            message: friendlyMessage,
                            duration: 3000
                        });
                    }
                    navigate(errorAction.redirect);
                }
                return { 
                    type: 'auth_error', 
                    message: friendlyMessage,
                    redirect: errorAction.redirect 
                };

            case 'navigate_back':
                if (showToastOnError) {
                    showToast({
                        type: 'error',
                        message: friendlyMessage,
                        duration: 4000
                    });
                }
                // 이전 페이지로 이동 또는 홈으로
                if (window.history.length > 1) {
                    navigate(-1);
                } else {
                    navigate('/');
                }
                return { 
                    type: 'not_found', 
                    message: friendlyMessage 
                };

            case 'form_validation': {
                const validationErrors = mapValidationErrors(apiError.errors);
                
                if (showToastOnError && Object.keys(validationErrors).length === 0) {
                    // 유효성 검사 에러가 있지만 필드 매핑이 안된 경우
                    showToast({
                        type: 'warning',
                        message: friendlyMessage,
                        duration: 4000
                    });
                }

                return { 
                    type: 'validation_error', 
                    message: friendlyMessage,
                    validationErrors: returnValidationErrors ? validationErrors : undefined
                };
            }

            case 'toast':
            default:
                if (showToastOnError) {
                    showToast({
                        type: getToastType(apiError.status),
                        message: friendlyMessage,
                        duration: getToastDuration(apiError.status)
                    });
                }
                return { 
                    type: 'api_error', 
                    message: friendlyMessage,
                    status: apiError.status 
                };
        }
    };

    /**
     * 에러 상태에 따른 토스트 타입 결정
     */
    const getToastType = (status) => {
        if (status >= 400 && status < 500) {
            return 'warning';
        } else if (status >= 500) {
            return 'error';
        }
        return 'info';
    };

    /**
     * 에러 상태에 따른 토스트 지속 시간 결정
     */
    const getToastDuration = (status) => {
        if (status === 401 || status === 403) {
            return 5000; // 권한 관련 에러는 길게
        } else if (status >= 500) {
            return 6000; // 서버 에러는 더 길게
        }
        return 4000; // 기본값
    };

    /**
     * 폼 유효성 검사 에러 전용 핸들러
     * @param {Error} error 
     * @returns {Object} 필드별 에러 메시지
     */
    const handleFormError = (error) => {
        const result = handleError(error, {
            showToastOnError: false,
            returnValidationErrors: true
        });

        if (result.type === 'validation_error') {
            return result.validationErrors || {};
        }

        // 유효성 검사 에러가 아닌 경우 토스트로 표시
        showToast({
            type: 'error',
            message: result.message,
            duration: 4000
        });

        return {};
    };

    /**
     * API 호출을 래핑하여 에러 처리 자동화
     * @param {Function} apiCall - API 호출 함수
     * @param {Object} options - 에러 처리 옵션
     * @returns {Promise}
     */
    const withErrorHandling = async (apiCall, options = {}) => {
        try {
            return await apiCall();
        } catch (error) {
            const result = handleError(error, options);
            throw { ...error, handled: true, result };
        }
    };

    return {
        handleError,
        handleFormError,
        withErrorHandling
    };
}