# WebSocket 구현 가이드

## 개요
이 프로젝트는 JWT 토큰 기반 WebSocket 인증을 사용하여 실시간 알림과 채팅 기능을 제공합니다.

## 주요 구성 요소

### 1. WebSocketManager (`src/utils/WebSocketManager.js`)
- 싱글톤 패턴으로 WebSocket 연결 관리
- JWT 토큰을 헤더에 포함하여 인증
- 자동 재연결 기능
- 구독 관리

### 2. React 훅들

#### useWebSocket (`src/hooks/useWebSocket.js`)
- WebSocket 연결/해제 관리
- 메시지 전송 기능
- 연결 상태 확인

#### useNotification (`src/hooks/useNotification.js`)
- 사용자별 알림 구독 관리
- 알림 상태 관리 (읽음/안읽음)
- 브라우저 알림 권한 처리

#### useChat (`src/hooks/useChat.js`)
- 채팅방별 구독 관리
- 메시지 전송/수신
- 타이핑 상태 관리

### 3. UI 컴포넌트

#### NotificationDisplay (`src/components/NotificationDisplay.jsx`)
- 알림 드롭다운 UI
- 읽음 처리 기능
- 알림 삭제 기능

## 사용 방법

### 1. 기본 설정
App.jsx에서 WebSocketProvider가 자동으로 처리합니다:
- 로그인 시 WebSocket 연결
- 알림 구독 자동 시작
- 로그아웃 시 연결 해제

### 2. 채팅방에서 사용
```javascript
const {
    messages,
    subscribeToChatRoom,
    unsubscribeFromChatRoom,
    sendChatMessage,
    isChatConnected
} = useChat(roomId);

// 채팅방 구독
useEffect(() => {
    subscribeToChatRoom();
    return () => unsubscribeFromChatRoom();
}, [roomId]);

// 메시지 전송
const handleSendMessage = async (text) => {
    await sendChatMessage(text);
};
```

### 3. 알림 사용
```javascript
const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
} = useNotification();

// HeaderNav에서 NotificationDisplay 컴포넌트 사용
<NotificationDisplay />
```

## 백엔드 연동

### 인증 헤더
```javascript
connectHeaders: {
    'Authorization': `Bearer ${token}`
}
```

### 구독 경로
- 알림: `/topic/notification/{userId}`
- 채팅: `/topic/chat/{roomId}`

### 메시지 전송 경로
- 채팅 메시지: `/app/chat/message`

## 환경 설정

### 개발 환경 (.env.development)
```
VITE_API_BASE_URL=http://localhost:8080
```

### 프로덕션 환경 (.env.production)
```
VITE_API_BASE_URL=/api
```

## 주요 기능

### 1. 자동 재연결
- 네트워크 끊김 시 자동으로 재연결 시도
- 최대 5회 재시도
- 지수 백오프 지연

### 2. 세션 관리
- 브라우저 새로고침 시 정리
- 페이지 이동 시 구독 관리
- 메모리 누수 방지

### 3. 에러 처리
- JWT 만료 시 자동 로그인 페이지 이동
- 네트워크 오류 시 사용자 알림
- 권한 오류 처리

### 4. 알림 기능
- 브라우저 알림 권한 요청
- 읽음/안읽음 상태 관리
- 알림 개수 표시
- 클릭 시 해당 페이지 이동

## 트러블슈팅

### 1. 연결 실패
- JWT 토큰 확인
- 서버 URL 확인
- 네트워크 상태 확인

### 2. 메시지 수신 안됨
- 구독 상태 확인
- 권한 확인 (채팅방 참여자, 본인 알림)
- 백엔드 로그 확인

### 3. 재연결 실패
- 토큰 만료 확인
- 서버 상태 확인
- 브라우저 콘솔 로그 확인

## 보안 고려사항

1. **JWT 토큰 관리**
   - 토큰 만료 시 자동 처리
   - localStorage에 저장 (XSS 방지 필요)

2. **구독 권한 검증**
   - 백엔드에서 권한 확인
   - 본인 알림만 구독 가능
   - 채팅방 참여자만 구독 가능

3. **메시지 검증**
   - 입력값 검증
   - XSS 방지
   - 메시지 크기 제한
