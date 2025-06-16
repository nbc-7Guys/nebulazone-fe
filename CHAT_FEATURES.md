# NebulaZone 채팅 기능 가이드

## 📋 개요

NebulaZone 프론트엔드에 실시간 채팅 기능이 구현되었습니다. 이 문서는 채팅 기능의 구성 요소와 사용법을 설명합니다.

## 🏗️ 아키텍처

### 주요 컴포넌트

1. **ChatRoomPage** - 채팅방 메인 페이지
2. **ChatRoomListPage** - 채팅방 목록 페이지  
3. **ChatHistory** - 채팅 기록 표시 컴포넌트
4. **ChatInput** - 메시지 입력 컴포넌트
5. **ChatRoomListItem** - 채팅방 목록 아이템 컴포넌트

### 커스텀 Hooks

1. **useWebSocket** - WebSocket 연결 관리
2. **useChat** - 채팅 관련 상태 및 로직 관리

### API 서비스

1. **chatApi** - 채팅 관련 REST API 호출
2. **WebSocket 관리** - 실시간 메시지 처리

## 🚀 주요 기능

### 1. 채팅방 생성 및 입장
- 상품 상세 페이지에서 "판매자와 채팅" 버튼 클릭
- 기존 채팅방이 있으면 입장, 없으면 새로 생성
- WebSocket을 통한 실시간 연결

### 2. 실시간 메시지
- STOMP 프로토콜 기반 WebSocket 통신
- 메시지 즉시 전송 및 수신
- 연결 상태 실시간 표시

### 3. 채팅방 목록
- 참여 중인 모든 채팅방 조회
- 최근 메시지 및 시간 표시
- 채팅방별 상품 정보 표시

## 📁 파일 구조

```
src/
├── components/
│   ├── ChatHistory.jsx          # 채팅 기록 표시
│   ├── ChatInput.jsx            # 메시지 입력
│   ├── ChatRoomListItem.jsx     # 채팅방 리스트 아이템
│   ├── ConnectionStatus.jsx     # 연결 상태 표시
│   ├── ErrorMessage.jsx         # 에러 메시지 표시
│   ├── EmptyState.jsx           # 빈 상태 표시
│   ├── LoadingSpinner.jsx       # 로딩 스피너
│   └── HeaderNav.jsx            # 네비게이션 헤더
├── pages/
│   ├── ChatRoomPage.jsx         # 채팅방 페이지
│   ├── ChatRoomListPage.jsx     # 채팅방 목록 페이지
│   ├── ProductDetailPage.jsx    # 상품 상세 (채팅 시작)
│   ├── LoginPage.jsx            # 로그인 페이지
│   └── SignUpPage.jsx           # 회원가입 페이지
├── hooks/
│   ├── useWebSocket.js          # WebSocket 연결 관리
│   ├── useChat.js               # 채팅 상태 관리
│   └── index.js                 # Hooks export
├── services/
│   ├── api.js                   # REST API 서비스
│   └── chatApi.js               # 채팅 전용 API 서비스
├── utils/
│   ├── auth.js                  # 인증 관련 유틸리티
│   ├── JwtManager.js            # JWT 토큰 관리
│   ├── errorHandler.js          # 에러 처리 유틸리티
│   └── dateFormat.js            # 날짜 포맷팅 유틸리티
└── constants/
    └── chat.js                  # 채팅 관련 상수
```

## 🔧 설정 및 실행

### 1. 환경 설정
백엔드 서버가 `http://localhost:8080`에서 실행되고 있어야 합니다.

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

## 💡 사용법

### 1. 로그인
채팅 기능을 사용하려면 먼저 로그인해야 합니다.
```
http://localhost:5173/login
```

### 2. 상품에서 채팅 시작
1. 상품 목록에서 상품을 선택합니다
2. 상품 상세 페이지에서 "판매자와 채팅" 버튼을 클릭합니다
3. 채팅방이 자동으로 생성되고 입장됩니다

### 3. 채팅방 목록 확인
```
http://localhost:5173/chat/rooms
```

### 4. 메시지 전송
- 채팅방에서 하단의 입력창에 메시지를 입력합니다
- Enter 키 또는 "전송" 버튼으로 메시지를 보냅니다
- Shift + Enter로 줄바꿈이 가능합니다

## 🎨 UI/UX 특징

### 1. 실시간 연결 상태 표시
- 🟢 연결됨: WebSocket 정상 연결
- 🔴 연결 안됨: WebSocket 연결 실패
- 🔄 연결 중: WebSocket 연결 시도 중

### 2. 메시지 디자인
- **내 메시지**: 오른쪽 정렬, 녹색 배경 (#38d39f)
- **상대방 메시지**: 왼쪽 정렬, 흰색 배경
- **시스템 메시지**: 중앙 정렬, 회색 텍스트

### 3. 날짜 구분
- 메시지가 다른 날짜인 경우 날짜 구분선 표시
- 오늘 메시지는 시간만, 다른 날은 날짜 표시

## 🔐 보안 및 인증

### JWT 토큰 관리
- WebSocket 연결 시 JWT 토큰 포함
- 토큰 만료 시 자동 로그인 페이지 리다이렉트
- 토큰 자동 갱신 기능

## 🛠️ 트러블슈팅

### 1. WebSocket 연결 실패
**해결책**:
1. 백엔드 서버가 실행 중인지 확인
2. JWT 토큰이 유효한지 확인
3. CORS 설정 확인

### 2. 메시지 전송 안됨
**해결책**:
1. WebSocket 연결 상태 확인
2. 네트워크 연결 확인
3. 브라우저 콘솔에서 에러 메시지 확인

## 📝 API 엔드포인트

### REST API
```
POST /chat/rooms                # 채팅방 생성
GET  /chat/rooms                # 채팅방 목록
GET  /chat/rooms/history/{id}   # 채팅 기록
DELETE /chat/rooms/{id}         # 채팅방 나가기
```

### WebSocket
```
연결: ws://localhost:8080/ws
구독: /topic/chat/{roomId}
발송: /chat/send/{roomId}
```

이제 NebulaZone의 채팅 기능을 완전히 사용할 수 있습니다! 🎉
