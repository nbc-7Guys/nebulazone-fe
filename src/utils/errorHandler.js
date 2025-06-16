// API 에러 처리 유틸리티

export const getErrorMessage = (error) => {
    if (error.response) {
        // 서버에서 응답한 에러
        switch (error.response.status) {
            case 400:
                return error.response.data?.message || '잘못된 요청입니다.';
            case 401:
                return '인증이 필요하거나 만료되었습니다.';
            case 403:
                return '접근 권한이 없습니다.';
            case 404:
                return '요청한 리소스를 찾을 수 없습니다.';
            case 409:
                return '이미 존재하는 데이터입니다.';
            case 500:
                return '서버 내부 오류가 발생했습니다.';
            default:
                return error.response.data?.message || '알 수 없는 오류가 발생했습니다.';
        }
    } else if (error.request) {
        // 네트워크 에러
        return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
    } else {
        // 기타 에러
        return error.message || '예상치 못한 오류가 발생했습니다.';
    }
};

export const handleApiError = (error, defaultMessage = '오류가 발생했습니다.') => {
    console.error('API Error:', error);
    const message = getErrorMessage(error);
    
    // 401 에러의 경우 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
        import('../utils/JwtManager').then(({ JwtManager }) => {
            JwtManager.removeTokens();
            window.location.href = '/login';
        });
    }
    
    return message;
};

// 채팅 에러 메시지
export const getChatErrorMessage = (error) => {
    if (error.message?.includes('WebSocket')) {
        return '채팅 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.';
    }
    if (error.message?.includes('JWT')) {
        return '인증이 만료되었습니다. 다시 로그인해주세요.';
    }
    return error.message || '채팅 중 오류가 발생했습니다.';
};

// 성공 메시지 처리
export const getSuccessMessage = (action) => {
    const messages = {
        login: '로그인되었습니다.',
        logout: '로그아웃되었습니다.',
        signup: '회원가입이 완료되었습니다.',
        chatRoomCreated: '채팅방이 생성되었습니다.',
        messageSent: '메시지가 전송되었습니다.',
        productPurchased: '상품 구매가 완료되었습니다.',
        chatRoomLeft: '채팅방에서 나갔습니다.'
    };
    
    return messages[action] || '작업이 완료되었습니다.';
};
