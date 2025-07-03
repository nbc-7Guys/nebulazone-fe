import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import HeaderNav from "../components/layout/HeaderNav";
import Pagination from "../components/ui/Pagination";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import EmptyState from "../components/common/EmptyState";
import SEOHead from "../components/common/SEOHead";
import { postApi } from "../services/api";
import { PostType, getPostTypeLabel, POST_TYPE_OPTIONS } from "../types/PostType";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { formatRelativeTime } from "../utils/formatting/dateUtils";

export default function PostListPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { handleError } = useErrorHandler();

    // 상태 관리
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 검색/필터 상태
    const [searchForm, setSearchForm] = useState({
        keyword: searchParams.get('keyword') || '',
        type: searchParams.get('type') || PostType.FREE,
        page: parseInt(searchParams.get('page')) || 1,
        size: 10
    });

    // 실제 검색에 사용되는 상태 (검색 버튼 클릭이나 Enter 시에만 업데이트)
    const [activeSearchForm, setActiveSearchForm] = useState({
        keyword: searchParams.get('keyword') || '',
        type: searchParams.get('type') || PostType.FREE,
        page: parseInt(searchParams.get('page')) || 1,
        size: 10
    });

    // 페이지네이션 상태
    const [pagination, setPagination] = useState({
        totalPages: 0,
        totalElements: 0,
        currentPage: 1
    });

    // 게시글 목록 로드
    useEffect(() => {
        const loadPosts = async () => {
            try {
                setLoading(true);
                setError("");

                const params = {
                    keyword: activeSearchForm.keyword || undefined,
                    type: activeSearchForm.type,
                    page: activeSearchForm.page,
                    size: activeSearchForm.size
                };

                const response = await postApi.searchPosts(params);

                setPosts(response.content || []);
                setPagination({
                    totalPages: response.totalPages || 0,
                    totalElements: response.totalElements || 0,
                    currentPage: response.page + 1 || 1
                });

            } catch (error) {
                const errorResult = handleError(error, {
                    context: { action: 'loadPosts', params: activeSearchForm },
                    showToastOnError: false
                });
                
                if (errorResult.type === 'auth_error') {
                    setError('게시글 목록을 조회할 권한이 없습니다.');
                } else {
                    setError(errorResult.message || '게시글 목록을 불러오는데 실패했습니다.');
                }
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        loadPosts();
    }, [activeSearchForm]); // activeSearchForm이 변경될 때만 실행

    // URL 파라미터 업데이트
    useEffect(() => {
        const params = new URLSearchParams();

        if (activeSearchForm.keyword) params.set('keyword', activeSearchForm.keyword);
        params.set('type', activeSearchForm.type);
        if (activeSearchForm.page > 1) params.set('page', activeSearchForm.page.toString());

        const newSearch = params.toString();
        const currentSearch = location.search.replace('?', '');

        if (newSearch !== currentSearch) {
            navigate({ pathname: location.pathname, search: newSearch }, { replace: true });
        }
    }, [activeSearchForm.keyword, activeSearchForm.type, activeSearchForm.page, navigate, location.pathname, location.search]);

    // 폼 변경 핸들러 (입력 필드용 - 서버 요청 안함)
    const handleFormChange = (field, value) => {
        setSearchForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 게시판 타입 변경 (즉시 검색 실행)
    const handleTypeChange = (type) => {
        const newSearchForm = {
            ...searchForm,
            type: type,
            page: 1
        };
        setSearchForm(newSearchForm);
        setActiveSearchForm(newSearchForm);
    };

    // 검색 실행
    const handleSearch = () => {
        const newSearchForm = {
            ...searchForm,
            page: 1
        };
        setActiveSearchForm(newSearchForm);
    };

    // 페이지 변경
    const handlePageChange = (newPage) => {
        const newSearchForm = {
            ...activeSearchForm,
            page: newPage
        };
        setActiveSearchForm(newSearchForm);
    };

    // 게시글 클릭
    const handlePostClick = (postId) => {
        navigate(`/posts/${postId}`);
    };


    return (
        <div className="page-enter min-h-screen bg-secondary">
            <SEOHead
                title={`${getPostTypeLabel(activeSearchForm.type)} - 커뮤니티 - 네불라존`}
                description={`네불라존 ${getPostTypeLabel(activeSearchForm.type)}에서 다양한 정보를 공유하고 소통하세요.`}
                keywords={`${getPostTypeLabel(activeSearchForm.type)}, 커뮤니티, 게시판, 정보공유, 질문답변`}
                url={`${window.location.origin}/posts?type=${activeSearchForm.type}`}
            />
            <HeaderNav />

            <div 
                role="main"
                className="max-w-screen-xl mx-auto p-8"
            >
                {/* 헤더 */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-4 text-primary">
                        💬 커뮤니티 게시판
                    </h1>
                    <p className="text-lg text-muted">
                        네불라존 유저들과 소통하고 정보를 공유해보세요
                    </p>
                    
                    {/* 키보드 단축키 도움말 */}
                    <div className="text-xs text-light text-center mt-2">
                        💡 <strong>Ctrl+K</strong>: 검색 포커스 | <strong>Esc</strong>: 검색 초기화 | <strong>Alt+S</strong>: 메인 컨텐츠로 이동
                    </div>
                </div>

                {/* 게시판 타입 선택 */}
                <div className="flex justify-center gap-3 mb-6 flex-wrap">
                    {POST_TYPE_OPTIONS.map((option, index) => (
                        <button
                            key={option.value}
                            onClick={() => handleTypeChange(option.value)}
                            className={`px-6 py-3 rounded-full font-semibold text-sm transition-all smooth-transition ${
                                activeSearchForm.type === option.value 
                                    ? 'bg-primary text-white shadow-lg hover:shadow-xl hover:-translate-y-1' 
                                    : 'bg-primary border border-primary-light text-secondary hover:bg-muted hover:-translate-y-1'
                            }`}
                            aria-pressed={activeSearchForm.type === option.value}
                            tabIndex={10 + index}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* 검색 */}
                <div className="bg-primary p-6 rounded-lg shadow border mb-8">
                    <div className="flex gap-4 items-center">
                        <input
                            type="text"
                            placeholder="🔍 제목이나 내용으로 검색..."
                            value={searchForm.keyword}
                            onChange={(e) => handleFormChange('keyword', e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearch();
                                }
                            }}
                            className="flex-1 px-4 py-3 border border-light rounded-lg text-base focus:ring transition-fast"
                            aria-label="게시글 검색"
                            tabIndex={1}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className={`px-6 py-3 rounded-lg text-base font-semibold transition-all ${
                                loading 
                                    ? 'bg-muted text-secondary cursor-not-allowed' 
                                    : 'btn-primary hover:shadow-lg hover:-translate-y-1'
                            }`}
                            aria-label="검색 실행"
                            tabIndex={2}
                        >
                            {loading ? "🔄 검색 중..." : "🔍 검색"}
                        </button>
                    </div>
                </div>

                {/* 결과 개수 표시 */}
                {!loading && !error && (
                    <div style={{
                        marginBottom: "20px",
                        fontSize: "14px",
                        color: "#718096",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <span>
                            총 {pagination.totalElements}개의 게시글이 있습니다.
                        </span>
                        <span style={{ color: "#38d39f", fontWeight: "500" }}>
                            {getPostTypeLabel(activeSearchForm.type)}
                        </span>
                    </div>
                )}

                {/* 게시글 목록 */}
                {loading ? (
                    <LoadingSpinner size="large" message="게시글을 불러오는 중..." />
                ) : error ? (
                    <ErrorMessage
                        message={error}
                        onRetry={() => setSearchForm(prev => ({ ...prev }))}
                        retryText="다시 불러오기"
                    />
                ) : posts.length === 0 ? (
                    <EmptyState
                        icon="📝"
                        title="등록된 게시글이 없습니다"
                        description="첫 번째 게시글을 작성해보시거나 다른 게시판을 확인해보세요."
                        actionButton={
                            <button
                                onClick={() => navigate('/posts/create')}
                                className="btn-primary px-6 py-3 rounded-lg text-base font-medium hover:shadow-lg hover:-translate-y-1 transition-all"
                            >
                                게시글 작성하기
                            </button>
                        }
                    />
                ) : (
                    <>
                        {/* 게시글 리스트 - 테이블 형태 */}
                        <div style={{
                            backgroundColor: "#fff",
                            borderRadius: "12px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            overflow: "hidden",
                            marginBottom: "40px"
                        }}>
                            {/* 테이블 헤더 */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "80px 1fr 120px 100px",
                                padding: "16px 24px",
                                backgroundColor: "#f7fafc",
                                borderBottom: "1px solid #e2e8f0",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#4a5568"
                            }}>
                                <div>분류</div>
                                <div>제목</div>
                                <div>닉네임</div>
                                <div>날짜</div>
                            </div>

                            {/* 게시글 목록 */}
                            {posts.map((post, index) => (
                                <div
                                    key={post.postId}
                                    onClick={() => handlePostClick(post.postId)}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "80px 1fr 120px 100px",
                                        padding: "12px 24px",
                                        borderBottom: index < posts.length - 1 ? "1px solid #e2e8f0" : "none",
                                        cursor: "pointer",
                                        transition: "background-color 0.2s ease",
                                        alignItems: "center",
                                        minHeight: "60px"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "#f7fafc";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "#fff";
                                    }}
                                >
                                    {/* 분류 */}
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "center"
                                    }}>
                                        <span style={{
                                            padding: "4px 8px",
                                            backgroundColor: "#e6fffa",
                                            color: "#38d39f",
                                            borderRadius: "12px",
                                            fontSize: "11px",
                                            fontWeight: "500",
                                            textAlign: "center",
                                            whiteSpace: "nowrap"
                                        }}>
                                            {getPostTypeLabel(post.type)}
                                        </span>
                                    </div>

                                    {/* 제목 */}
                                    <div style={{
                                        paddingLeft: "16px",
                                        paddingRight: "8px"
                                    }}>
                                        <div style={{
                                            fontSize: "15px",
                                            fontWeight: "500",
                                            color: "#1a202c",
                                            marginBottom: "2px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px"
                                        }}>
                                            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {post.title}
                                            </span>
                                            {post.imageUrls && post.imageUrls.length > 0 && (
                                                <span style={{
                                                    fontSize: "12px",
                                                    color: "#718096",
                                                    flexShrink: 0
                                                }}>
                                                    📷{post.imageUrls.length}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{
                                            fontSize: "12px",
                                            color: "#718096",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}>
                                            {post.content}
                                        </div>
                                    </div>

                                    {/* 닉네임 */}
                                    <div style={{
                                        fontSize: "13px",
                                        color: "#4a5568",
                                        textAlign: "center",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        paddingX: "4px"
                                    }}>
                                        {post.author}
                                    </div>

                                    {/* 날짜 */}
                                    <div style={{
                                        fontSize: "12px",
                                        color: "#718096",
                                        textAlign: "center",
                                        whiteSpace: "nowrap"
                                    }}>
                                        {formatRelativeTime(post.createdAt)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 페이지네이션 */}
                        {pagination.totalPages > 1 && (
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}

                {/* 글쓰기 버튼 */}
                <div style={{
                    position: "fixed",
                    bottom: "30px",
                    right: "30px",
                    zIndex: 1000
                }}>
                    <button
                        onClick={() => navigate('/posts/create')}
                        style={{
                            padding: "16px 24px",
                            backgroundColor: "#38d39f",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50px",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(56, 211, 159, 0.4)",
                            transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#2eb888";
                            e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#38d39f";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        ✏️ 글쓰기
                    </button>
                </div>
            </div>
        </div>
    );
}
