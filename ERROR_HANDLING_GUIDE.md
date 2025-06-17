# 에러 처리 시스템 구현 가이드

## 개요
이 프로젝트는 백엔드 API의 구체적인 에러 코드를 바탕으로 사용자 친화적인 에러 처리 시스템을 구현합니다.

## 주요 특징

### 1. 백엔드 에러 코드 매핑
백엔드의 도메인별 에러 코드를 프론트엔드에서 체계적으로 관리합니다:

#### JWT 관련 에러
- `TOKEN_EXPIRED`: 토큰이 만료되었습니다
- `EXPIRED_JWT_TOKEN`: 만료된 JWT 토큰입니다
- `NOT_VALID_JWT_TOKEN`: 올바르지 않은 JWT 토큰입니다
- `MALFORMED_JWT_REQUEST`: 요청 형태가 잘못 되었습니다

#### 사용자 관련 에러
- `USER_NOT_FOUND`: 유저를 찾을 수 없습니다
- `WRONG_PASSWORD`: 비밀번호가 틀렸습니다
- `ALREADY_EXISTS_EMAIL`: 이미 존재하는 이메일이 있습니다
- `ALREADY_EXISTS_NICKNAME`: 이미 존재하는 닉네임이 있습니다
- `INSUFFICIENT_BALANCE`: 포인트가 부족합니다

#### 상품 관련 에러
- `PRODUCT_NOT_FOUND`: 존재하지 않는 판매 상품입니다
- `ALREADY_SOLD`: 이미 판매된 상품입니다
- `CANT_PURCHASE`: 판매자 본인이 구매할 수 없습니다
- `AUCTION_PRODUCT_NOT_PURCHASABLE`: 옥션 상품은 구매할 수 없습니다

#### 채팅 관련 에러
- `CHAT_ROOM_NOT_FOUND`: 채팅방을 찾을 수 없습니다
- `CHAT_ROOM_ACCESS_DENIED`: 채팅방에 접근할 권한이 없습니다
- `PRODUCT_SOLD_OUT`: 판매 완료된 상품은 채팅이 불가능합니다
- `CANNOT_CHAT_WITH_SELF`: 구매자 본인의 상품 입니다

### 2. ErrorHandler 클래스

#### 주요 메서드
```javascript
// API 에러 처리
ErrorHandler.handleApiError(error)

// JWT 에러 검증
ErrorHandler.isJwtError(error)

// 에러 알림 표시
ErrorHandler.showErrorAlert(error, showAlert)

// 폼 유효성 검사 에러 처리
ErrorHandler.handleValidationError(validationErrors)
```

#### 사용 예시
```javascript
try {
    await productApi.purchaseProduct(catalogId, productId);
    ToastManager.success("구매가 완료되었습니다!");
} catch (error) {
    const errorInfo = ErrorHandler.handleApiError(error);
    
    if (errorInfo.status === 400) {
        ToastManager.error(errorInfo.message);
    } else if (errorInfo.status === 403) {
        ToastManager.error("포인트가 부족합니다.");
    } else {
        ToastManager.error("구매에 실패했습니다.");
    }
}
```

### 3. ToastManager 클래스

#### 사용법
```javascript
ToastManager.success("성공 메시지");
ToastManager.error("에러 메시지");
ToastManager.warning("경고 메시지");
ToastManager.info("정보 메시지");
```

### 4. Axios 인터셉터 활용

#### 요청 인터셉터
- JWT 토큰 자동 추가
- 요청별 헤더 설정

#### 응답 인터셉터
- JWT 에러 자동 감지 및 로그아웃 처리
- 401/403 에러 시 자동 리다이렉트
- 구체적인 에러 정보 로깅

```javascript
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (ErrorHandler.isJwtError(error)) {
            JwtManager.removeTokens();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

## 적용된 페이지

### 1. ChatRoomPage.jsx
- 채팅 기록 조회 에러 처리
- WebSocket 연결 에러 처리
- 상품 구매 에러 처리
- 메시지 전송 에러 처리

### 2. MyPage.jsx
- 프로필 로드 에러 처리
- 닉네임 수정 에러 처리
- 비밀번호 변경 에러 처리
- 회원탈퇴 에러 처리

### 3. API Services (api.js)
- 모든 API 호출에 통일된 에러 처리 적용
- 에러 정보를 원본 에러 객체에 첨부
- 구체적인 에러 메시지 제공

## 에러 처리 흐름

1. **API 호출** → 백엔드에서 에러 발생
2. **Axios 인터셉터** → 에러 감지 및 기본 처리
3. **ErrorHandler** → 에러 정보 분석 및 변환
4. **ToastManager** → 사용자 친화적 메시지 표시
5. **UI 업데이트** → 에러 상태 반영

## 장점

### 1. 일관성
- 모든 API 에러가 동일한 방식으로 처리됨
- 통일된 사용자 경험 제공

### 2. 유지보수성
- 에러 처리 로직이 중앙화됨
- 백엔드 에러 코드 변경 시 한 곳에서 수정

### 3. 사용자 친화성
- 구체적이고 이해하기 쉬운 에러 메시지
- 적절한 액션 가이드 제공

### 4. 개발자 경험
- 디버깅을 위한 상세한 로깅
- 에러 정보의 구조화된 관리

## 확장 가능성

### 1. 토스트 라이브러리 연동
현재는 기본 alert을 사용하지만, 향후 react-toastify 등의 라이브러리로 확장 가능

### 2. 에러 트래킹
Sentry, LogRocket 등의 에러 트래킹 서비스 연동 가능

### 3. 다국어 지원
에러 메시지의 다국어 처리 추가 가능

### 4. 재시도 로직
네트워크 에러 시 자동 재시도 기능 추가 가능

## 사용 권장사항

1. **구체적인 에러 처리**: 각 도메인별로 적절한 에러 메시지 사용
2. **사용자 액션 제공**: 에러 발생 시 사용자가 취할 수 있는 행동 안내
3. **로깅 활용**: 개발/디버깅을 위한 충분한 에러 정보 기록
4. **일관된 패턴**: 모든 API 호출에서 동일한 에러 처리 패턴 사용
