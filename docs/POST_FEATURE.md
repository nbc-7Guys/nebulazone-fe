# 게시글 기능 문서

## 📝 개요
네불라존의 커뮤니티 게시판 기능으로, 사용자들이 자유롭게 정보를 공유하고 소통할 수 있는 공간입니다.

## 🎯 주요 기능

### 게시판 타입
- **자유게시판**: 일반적인 자유로운 소통
- **정보게시판**: PC 부품 관련 정보 공유
- **질문게시판**: 질문과 답변

### 핵심 기능
- ✅ 게시글 작성/수정/삭제 (CRUD)
- ✅ 게시판 타입별 분류
- ✅ 키워드 검색
- ✅ 이미지 업로드 (최대 5개, 5MB 제한)
- ✅ 페이지네이션
- ✅ 반응형 디자인
- ✅ SEO 최적화
- ✅ 에러 경계 처리
- ✅ 인증 기반 권한 관리

## 🏗️ 아키텍처

### 폴더 구조
```
src/
├── pages/
│   ├── PostListPage.jsx      # 게시글 목록
│   ├── PostDetailPage.jsx    # 게시글 상세
│   ├── PostCreatePage.jsx    # 게시글 작성
│   └── PostEditPage.jsx      # 게시글 수정
├── components/
│   ├── PostCard.jsx          # 게시글 카드
│   ├── PostForm.jsx          # 게시글 폼
│   ├── PostTypeSelector.jsx  # 타입 선택기
│   ├── ImageUploader.jsx     # 이미지 업로더
│   ├── LazyImage.jsx         # 지연 로딩 이미지
│   ├── PrivateRoute.jsx      # 인증 라우트
│   ├── ErrorBoundary.jsx     # 에러 경계
│   └── SEOHead.jsx           # SEO 메타데이터
├── hooks/
│   ├── usePosts.js           # 게시글 목록 관리
│   ├── usePost.js            # 개별 게시글 관리
│   ├── usePostForm.js        # 폼 상태 관리
│   └── useInfiniteScroll.js  # 무한 스크롤
├── types/
│   └── PostType.js           # 게시글 타입 정의
└── services/
    └── api.js                # postApi 추가
```

### API 엔드포인트
```javascript
// 게시글 목록 조회 (페이지네이션, 검색)
GET /posts?keyword=검색어&type=FREE&page=1&size=10

// 게시글 상세 조회
GET /posts/{postId}

// 게시글 작성 (multipart/form-data)
POST /posts
Content-Type: multipart/form-data
- post: JSON (title, content, type, postType)
- images: File[]

// 게시글 수정 (multipart/form-data)
PUT /posts/{postId}
Content-Type: multipart/form-data
- post: JSON (title, content, remainImageUrls)
- images: File[]

// 게시글 삭제
DELETE /posts/{postId}
```

## 🎨 컴포넌트 상세

### 1. PostCard
게시글 목록에서 사용되는 카드 컴포넌트
```jsx
<PostCard 
  post={postData} 
  onClick={handlePostClick} 
/>
```

**Features:**
- 제목, 내용 미리보기, 작성자, 작성일 표시
- 게시판 타입 뱃지
- 이미지 개수 표시
- 호버 효과

### 2. PostForm  
게시글 작성/수정에 사용되는 재사용 가능한 폼
```jsx
<PostForm
  initialData={postData}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  mode="create" // or "edit"
  loading={isLoading}
/>
```

**Features:**
- 작성/수정 모드 지원
- 실시간 유효성 검사
- 이미지 업로드 및 미리보기
- 기존 이미지 관리 (수정 모드)

### 3. PostTypeSelector
게시판 타입 선택 컴포넌트
```jsx
<PostTypeSelector
  selectedType={PostType.FREE}
  onTypeChange={handleTypeChange}
  variant="tabs" // "default", "tabs", "buttons"
  size="medium" // "small", "medium", "large"
/>
```

### 4. ImageUploader
드래그 앤 드롭 지원 이미지 업로더
```jsx
<ImageUploader
  onImagesChange={handleImagesChange}
  maxImages={5}
  maxFileSize={5 * 1024 * 1024}
  existingImages={existingUrls}
  onExistingImageRemove={handleRemove}
/>
```

## 🪝 훅 상세

### 1. usePosts
게시글 목록 관리를 위한 훅
```javascript
const {
  posts,           // 게시글 목록
  pagination,      // 페이지네이션 정보
  loading,         // 로딩 상태
  error,           // 에러 상태
  searchPosts,     // 검색 함수
  changePage,      // 페이지 변경
  changePostType,  // 타입 변경
  refreshPosts     // 새로고침
} = usePosts();
```

**Features:**
- 5분간 API 응답 캐싱
- 검색 및 필터링
- 페이지네이션
- 실시간 목록 업데이트

### 2. usePost
개별 게시글 관리를 위한 훅
```javascript
const {
  post,           // 게시글 데이터
  loading,        // 로딩 상태
  createPost,     // 작성 함수
  updatePost,     // 수정 함수
  deletePost,     // 삭제 함수
  canEdit,        // 수정 권한
  canDelete       // 삭제 권한
} = usePost(postId);
```

### 3. usePostForm
게시글 폼 상태 관리를 위한 훅
```javascript
const {
  formData,        // 폼 데이터
  errors,          // 유효성 검사 에러
  updateField,     // 필드 업데이트
  addImages,       // 이미지 추가
  validateForm,    // 폼 검증
  getSubmitData,   // 제출 데이터 생성
  hasChanges       // 변경사항 확인
} = usePostForm(initialData);
```

## 🔒 보안 및 권한

### 인증 체크
- `PrivateRoute` 컴포넌트로 인증이 필요한 페이지 보호
- JWT 토큰 기반 인증
- 로그인 후 원래 페이지로 리다이렉트

### 권한 관리
- 게시글 작성: 로그인 필요
- 게시글 수정/삭제: 작성자만 가능
- 게시글 조회: 누구나 가능

### 파일 업로드 보안
- 파일 타입 검증 (JPG, PNG, GIF만 허용)
- 파일 크기 제한 (5MB)
- 파일 개수 제한 (최대 5개)

## 🚀 성능 최적화

### 캐싱 전략
- API 응답 5분간 메모리 캐싱 (usePosts)
- 이미지 지연 로딩 (LazyImage)
- 컴포넌트 언마운트 시 URL 정리

### 사용자 경험
- 로딩 스피너 및 스켈레톤 UI
- 에러 경계로 안정성 확보
- 반응형 디자인
- 접근성 고려 (키보드 네비게이션, ARIA 라벨)

## 📱 반응형 디자인

### 브레이크포인트
- 모바일: ~768px
- 태블릿: 768px~1024px  
- 데스크톱: 1024px+

### 적응형 요소
- 그리드 레이아웃 자동 조정
- 터치 친화적 버튼 크기
- 모바일에서 간소화된 UI

## 🔍 SEO 최적화

### 메타데이터
- 페이지별 동적 제목 및 설명
- Open Graph 태그
- Twitter Card 지원
- 구조화된 데이터

### URL 구조
```
/posts                    # 게시글 목록
/posts?type=FREE         # 타입별 목록
/posts/123               # 게시글 상세
/posts/create            # 게시글 작성
/posts/123/edit          # 게시글 수정
```

## 🐛 에러 처리

### 에러 경계
- `ErrorBoundary` 컴포넌트로 예상치 못한 에러 처리
- 개발 환경에서 상세 에러 정보 표시
- 사용자 친화적인 에러 메시지

### API 에러 처리
- 네트워크 에러 처리
- 권한 에러 자동 리다이렉트
- 사용자에게 명확한 피드백 제공

## 📊 향후 개선사항

### 예정 기능
- [ ] 댓글 시스템
- [ ] 좋아요/북마크
- [ ] 게시글 검색 필터 확장
- [ ] 무한 스크롤 (useInfiniteScroll 활용)
- [ ] 실시간 알림
- [ ] 게시글 신고 기능

### 기술 개선
- [ ] React Query 도입으로 캐싱 개선
- [ ] 이미지 CDN 연동
- [ ] PWA 지원
- [ ] 다크 모드
- [ ] 국제화 (i18n)

## 🧪 테스트

### 테스트 전략
```javascript
// 컴포넌트 테스트 예시
import { render, screen } from '@testing-library/react';
import PostCard from '../components/PostCard';

test('renders post card with title', () => {
  const mockPost = {
    title: 'Test Post',
    content: 'Test content'
  };
  
  render(<PostCard post={mockPost} />);
  expect(screen.getByText('Test Post')).toBeInTheDocument();
});
```

### 필요한 테스트
- [ ] 컴포넌트 단위 테스트
- [ ] 훅 테스트
- [ ] API 통합 테스트
- [ ] E2E 테스트

## 🚀 배포 가이드

### 환경 변수
```env
VITE_API_BASE_URL=https://api.nebulazone.store
```

### 빌드 최적화
- 코드 스플리팅
- 번들 크기 최적화
- 이미지 최적화

---

**작성일**: 2025-06-20  
**버전**: 1.0.0  
**담당자**: 개발팀
