import { useToastContext } from '../contexts/ToastContext';

/**
 * Toast 알림을 쉽게 사용할 수 있는 훅
 * 
 * @returns {Object} Toast 메서드들
 */
export const useToastNotification = () => {
    const { toast } = useToastContext();

    return {
        // 성공 메시지
        showSuccess: (message, options = {}) => {
            return toast.success(message, options);
        },

        // 오류 메시지
        showError: (message, options = {}) => {
            return toast.error(message, options);
        },

        // 경고 메시지
        showWarning: (message, options = {}) => {
            return toast.warning(message, options);
        },

        // 정보 메시지
        showInfo: (message, options = {}) => {
            return toast.info(message, options);
        },

        // 커스텀 메시지
        showCustom: (message, type = 'info', options = {}) => {
            return toast[type](message, options);
        },

        // 미리 정의된 메시지들
        messages: {
            // 로그인 관련
            loginSuccess: () => toast.success('로그인되었습니다.', { title: '로그인 성공' }),
            loginError: (error = '로그인에 실패했습니다.') => toast.error(error, { title: '로그인 실패' }),
            logoutSuccess: () => toast.info('로그아웃되었습니다.', { title: '로그아웃' }),

            // 채팅 관련
            chatConnected: () => toast.info('채팅에 연결되었습니다.', { title: '채팅 연결' }),
            chatDisconnected: () => toast.warning('채팅 연결이 끊어졌습니다.', { title: '채팅 연결 끊김' }),
            messageReceived: (sender, message) => toast.info(`${sender}: ${message}`, { 
                title: '새 메시지',
                duration: 3000
            }),

            // 거래 관련
            orderSuccess: () => toast.success('주문이 완료되었습니다.', { title: '주문 완료' }),
            orderError: (error = '주문 처리 중 오류가 발생했습니다.') => toast.error(error, { title: '주문 실패' }),
            paymentSuccess: () => toast.success('결제가 완료되었습니다.', { title: '결제 완료' }),
            paymentError: (error = '결제 처리 중 오류가 발생했습니다.') => toast.error(error, { title: '결제 실패' }),

            // 일반적인 메시지
            saveSuccess: () => toast.success('저장되었습니다.', { title: '저장 완료' }),
            saveError: (error = '저장 중 오류가 발생했습니다.') => toast.error(error, { title: '저장 실패' }),
            deleteSuccess: () => toast.success('삭제되었습니다.', { title: '삭제 완료' }),
            deleteError: (error = '삭제 중 오류가 발생했습니다.') => toast.error(error, { title: '삭제 실패' }),
            
            // 네트워크 관련
            networkError: () => toast.error('네트워크 연결을 확인해주세요.', { 
                title: '네트워크 오류',
                duration: 7000
            }),
            serverError: () => toast.error('서버에 일시적인 문제가 발생했습니다.', { 
                title: '서버 오류',
                duration: 7000
            }),

            // 권한 관련
            unauthorizedError: () => toast.error('로그인이 필요합니다.', { title: '권한 없음' }),
            forbiddenError: () => toast.error('접근 권한이 없습니다.', { title: '접근 거부' })
        }
    };
};