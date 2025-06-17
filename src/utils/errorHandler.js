/**
 * 백엔드 에러 코드 매핑
 */
export const ERROR_CODES = {
  // JWT 관련 에러
  JWT: {
    TOKEN_EXPIRED: '토큰이 만료되었습니다.',
    EXPIRED_JWT_TOKEN: '만료된 JWT 토큰입니다.',
    NOT_VALID_JWT_TOKEN: '올바르지 않은 JWT 토큰입니다.',
    NOT_VALID_SIGNATURE: '서명이 올바르지 않습니다.',
    NOT_VALID_CONTENT: '내용이 올바르지 않습니다.',
    MALFORMED_JWT_REQUEST: '요청 형태가 잘못 되었습니다.',
    REFRESH_TOKEN_EXPIRED: 'refresh token이 만료되었습니다.',
  },
  
  // 사용자 관련 에러
  USER: {
    NOTHING_TO_UPDATE: '수정할 내용이 없습니다.',
    WRONG_ROLES: '유저 권한을 잘못 입력하였습니다.',
    SAME_PASSWORD: '동일한 비밀번호로 변경할 수 없습니다.',
    WRONG_PASSWORD: '비밀번호가 틀렸습니다.',
    USER_NOT_FOUND: '유저를 찾을 수 없습니다.',
    ALREADY_EXISTS_EMAIL: '이미 존재하는 이메일이 있습니다.',
    ALREADY_EXISTS_NICKNAME: '이미 존재하는 닉네임이 있습니다.',
    INSUFFICIENT_BALANCE: '포인트가 부족합니다.',
  },
  
  // 상품 관련 에러
  PRODUCT: {
    INVALID_PRODUCT_TYPE: '유효하지 않은 판매상품 타입 입니다.',
    INVALID_END_TIME: '유효하지 않은 종료 시간입니다.',
    PRODUCT_NOT_FOUND: '존재하지 않는 판매 상품입니다.',
    NOT_BELONGS_TO_CATALOG: '판매 상품 지정한 카탈로그에 존재하지 않습니다.',
    NOT_PRODUCT_OWNER: '판매 상품 주인이 아닙니다.',
    CANT_PURCHASE: '판매자 본인이 구매할 수 없습니다.',
    ALREADY_AUCTION_TYPE: '이미 경매 방식 판매이므로 변경할 수 없습니다.',
    ALREADY_SOLD: '이미 판매된 상품입니다.',
    AUCTION_PRODUCT_NOT_PURCHASABLE: '옥션 상품은 구매할 수 없습니다.',
  },
  
  // 경매 관련 에러
  AUCTION: {
    INVALID_AUCTION_SORT_TYPE: '유효하지 않은 경매 정렬 타입 입니다.',
    ALREADY_DELETED_AUCTION: '이미 삭제된 경매입니다.',
    ALREADY_WON_AUCTION: '이미 낙찰된 경매 입니다.',
    ALREADY_CLOSED_AUCTION: '이미 종료된 경매 입니다.',
    AUCTION_NOT_FOUND: '존재하지 않는 경매입니다.',
    AUCTION_NOT_OWNER: '본인이 등록한 경매만 삭제할 수 있습니다.',
    AUCTION_NOT_CLOSED: '경매가 종료되어야 삭제할 수 있습니다.',
    AUCTION_END_TIME_INVALID: '경매 종료 시간이 현재 시간보다 늦어야 합니다.',
    MISMATCH_BID_PRICE: '입찰 가격이 일치하지 않습니다. 최고가만 낙찰할 수 있습니다.',
  },
  
  // 입찰 관련 에러
  BID: {
    ALREADY_BID_CANCELLED: '이미 취소된 입찰 입니다.',
    CANNOT_BID_OWN_AUCTION: '내 경매에는 입찰할 수 없습니다.',
    CANNOT_CANCEL_WON_BID: '낙찰된 입찰은 취소할 수 없습니다.',
    BID_NOT_FOUND: '입찰 내역이 존재하지 않습니다.',
    BID_PRICE_TOO_LOW_CURRENT_PRICE: '입찰 시 기존 입찰가보다 높아야 합니다.',
    BID_PRICE_TOO_LOW_START_PRICE: '입찰 시 시작가보다 높거나 같아야 합니다.',
    BID_NOT_OWNER: '내 입찰 내역이 아닙니다.',
    BID_CANCEL_TIME_LIMIT_EXCEEDED: '경매 종료 30분 전부터는 입찰을 취소할 수 없습니다.',
    BID_AUCTION_MISMATCH: '해당 경매의 입찰이 아닙니다.',
  },
  
  // 채팅 관련 에러
  CHAT: {
    CHAT_ROOM_NOT_FOUND: '채팅방을 찾을 수 없습니다.',
    CHAT_ROOM_ACCESS_DENIED: '채팅방에 접근할 권한이 없습니다.',
    PRODUCT_SOLD_OUT: '판매 완료된 상품은 채팅이 불가능합니다.',
    CANNOT_CHAT_WITH_SELF: '구매자 본인의 상품 입니다.',
    CHAT_SEND_FAILED: '메시지를 보내는데 실패하였습니다.',
    CHAT_HISTORY_NOT_FOUND: '채팅기록을 찾을 수 없습니다.',
  },
  
  // 카탈로그 관련 에러
  CATALOG: {
    CATALOG_NOT_FOUND: '카탈로그를 찾을 수 없습니다.',
  },
  
  // 거래 관련 에러
  TRANSACTION: {
    INVALID_TX_METHOD: '유효하지 않은 거래 타입 입니다.',
    NOT_FOUNT_TRANSACTION: '존재하지 않는 거래목록 입니다.',
  },
  
  // 포인트 내역 관련 에러
  POINT_HISTORY: {
    INVALID_TYPE: '지원하지 않는 타입입니다.',
    POINT_HISTORY_NOT_FOUND: '존재하지 않는 포인트 거래 내역입니다.',
    ALREADY_PROCESSED: '이미 처리된 요청입니다.',
    NOT_PENDING: '대기 중(PENDING) 상태만 처리할 수 있습니다.',
    UNAUTHORIZED: '인증되지 않은 사용자입니다.',
    NOT_OWNER: '본인만 요청할 수 있습니다.',
  },
  
  // 게시글 관련 에러
  POST: {
    INVALID_POST_TYPE: '유효하지 않은 게시글 타입 입니다.',
    POST_NOT_FOUND: '존재하지 않는 게시글입니다.',
    NOT_POST_OWNER: '게시글 작성자가 아닙니다.',
  },
  
  // 댓글 관련 에러
  COMMENT: {
    COMMENT_NOT_FOUND: '존재하지 않는 댓글입니다.',
    NOT_COMMENT_OWNER: '댓글 작성자가 아닙니다.',
    NOT_BELONG_TO_POST: '댓글이 지정한 게시글에 존재하지 않습니다.',
  },
  
  // 리뷰 관련 에러
  REVIEW: {
    REVIEW_NOT_FOUND: '리뷰를 찾을 수 없습니다.',
    REVIEW_ACCESS_DENIED: '해당 리뷰에 접근할 수 없습니다.',
  },
  
  // OAuth 관련 에러
  OAUTH: {
    UNSUPPORTED_OAUTH_PROVIDER: '지원하지 않는 소셜 로그인 제공자입니다.',
  },
  
  // 공통 에러
  COMMON: {
    BAD_REQUEST: '올바르지 않은 요청입니다.',
    UNAUTHORIZED: '인증이 필요합니다.',
    FORBIDDEN: '접근 권한이 없습니다.',
    NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
    CONFLICT: '리소스 충돌이 발생했습니다.',
    INTERNAL_SERVER_ERROR: '서버 내부 오류가 발생했습니다.',
    NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
    VALIDATION_ERROR: '입력값을 확인해주세요.',
  }
};

/**
 * HTTP 상태 코드별 기본 메시지
 */
export const DEFAULT_ERROR_MESSAGES = {
  400: '잘못된 요청입니다.',
  401: '인증이 필요합니다.',
  403: '접근 권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  409: '리소스 충돌이 발생했습니다.',
  422: '입력값을 확인해주세요.',
  500: '서버 내부 오류가 발생했습니다.',
  502: '서버 연결에 문제가 있습니다.',
  503: '서비스를 사용할 수 없습니다.',
};

/**
 * 에러 처리 유틸리티 클래스
 */
export class ErrorHandler {
  /**
   * Axios 에러를 처리하고 사용자 친화적인 메시지를 반환
   * @param {Error} error - Axios 에러 객체
   * @returns {Object} 처리된 에러 정보
   */
  static handleApiError(error) {
    console.error('API Error:', error);

    // 네트워크 에러 처리
    if (!error.response) {
      return {
        message: ERROR_CODES.COMMON.NETWORK_ERROR,
        status: 0,
        isNetworkError: true,
      };
    }

    const { status, data } = error.response;
    
    // 백엔드에서 전달된 에러 메시지가 있으면 우선 사용
    if (data && data.message) {
      return {
        message: data.message,
        status,
        data,
      };
    }

    // 상태 코드별 기본 메시지
    const defaultMessage = DEFAULT_ERROR_MESSAGES[status] || '알 수 없는 오류가 발생했습니다.';
    
    return {
      message: defaultMessage,
      status,
      data,
    };
  }

  /**
   * 특정 에러 코드에 대한 메시지를 가져옴
   * @param {string} category - 에러 카테고리 (예: 'USER', 'PRODUCT')
   * @param {string} code - 에러 코드
   * @returns {string} 에러 메시지
   */
  static getErrorMessage(category, code) {
    const categoryErrors = ERROR_CODES[category];
    if (categoryErrors && categoryErrors[code]) {
      return categoryErrors[code];
    }
    return '알 수 없는 오류가 발생했습니다.';
  }

  /**
   * 폼 유효성 검사 에러를 처리
   * @param {Object} validationErrors - 유효성 검사 에러 객체
   * @returns {string} 사용자 친화적인 에러 메시지
   */
  static handleValidationError(validationErrors) {
    if (!validationErrors || typeof validationErrors !== 'object') {
      return ERROR_CODES.COMMON.VALIDATION_ERROR;
    }

    // 첫 번째 에러 메시지를 반환
    const firstField = Object.keys(validationErrors)[0];
    const firstError = validationErrors[firstField];
    
    if (Array.isArray(firstError)) {
      return firstError[0];
    }
    
    return firstError || ERROR_CODES.COMMON.VALIDATION_ERROR;
  }

  /**
   * JWT 에러인지 확인
   * @param {Error} error - 에러 객체
   * @returns {boolean} JWT 에러 여부
   */
  static isJwtError(error) {
    if (!error.response) return false;
    
    const { status, data } = error.response;
    
    // 401 또는 403 상태 코드이면서 JWT 관련 메시지를 포함하는 경우
    if ((status === 401 || status === 403) && data && data.message) {
      const message = data.message.toLowerCase();
      return message.includes('token') || message.includes('jwt') || message.includes('인증');
    }
    
    return false;
  }

  /**
   * 에러 알림을 표시
   * @param {Error} error - 에러 객체
   * @param {Function} showAlert - 알림 표시 함수 (선택사항)
   */
  static showErrorAlert(error, showAlert = null) {
    const errorInfo = this.handleApiError(error);
    
    if (showAlert && typeof showAlert === 'function') {
      showAlert(errorInfo.message);
    } else {
      // 기본 alert 사용
      alert(errorInfo.message);
    }
    
    return errorInfo;
  }
}

/**
 * 토스트 메시지 유틸리티 (향후 확장 가능)
 */
export class ToastManager {
  static success(message) {
    // 향후 토스트 라이브러리 연동
    console.log('Success:', message);
    alert(`✅ ${message}`);
  }

  static error(message) {
    console.error('Error:', message);
    alert(`❌ ${message}`);
  }

  static warning(message) {
    console.warn('Warning:', message);
    alert(`⚠️ ${message}`);
  }

  static info(message) {
    console.info('Info:', message);
    alert(`ℹ️ ${message}`);
  }
}

export default ErrorHandler;
