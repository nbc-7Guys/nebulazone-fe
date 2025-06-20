import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import HeaderNav from "../components/HeaderNav";
import Pagination from "../components/Pagination";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import SEOHead from "../components/SEOHead";
import { postApi } from "../services/api";
import { PostType, getPostTypeLabel, POST_TYPE_OPTIONS } from "../types/PostType";

export default function PostListPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

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
                if (error.response.status == "401") {
                    setError('게시글 목록을 조회 할 권한이 없습니다.');
                    setPosts([]);
                } else{
                    console.error('게시글 목록 로드 실패:', error);
                    setError('게시글 목록을 불러오는데 실패했습니다.');
                    setPosts([]);
                }
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

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diff / (1000 * 60));
                return `${minutes}분 전`;
            }
            return `${hours}시간 전`;
        } else if (days < 7) {
            return `${days}일 전`;
        } else {
            return date.toLocaleDateString('ko-KR');
        }
    };

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <SEOHead
                title={`${getPostTypeLabel(activeSearchForm.type)} - 커뮤니티 - 네불라존`}
                description={`네불라존 ${getPostTypeLabel(activeSearchForm.type)}에서 다양한 정보를 공유하고 소통하세요.`}
                keywords={`${getPostTypeLabel(activeSearchForm.type)}, 커뮤니티, 게시판, 정보공유, 질문답변`}
                url={`${window.location.origin}/posts?type=${activeSearchForm.type}`}
            />
            <HeaderNav />

            <div style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "40px 20px"
            }}>
                {/* 헤더 */}
                <div style={{ marginBottom: "40px" }}>
                    <h1 style={{
                        fontSize: "48px",
                        fontWeight: "bold",
                        marginBottom: "16px",
                        color: "#1a202c"
                    }}>
                        커뮤니티 게시판
                    </h1>
                    <p style={{
                        fontSize: "18px",
                        color: "#718096"
                    }}>
                        네불라존 유저들과 소통하고 정보를 공유해보세요.
                    </p>
                </div>

                {/* 게시판 타입 선택 */}
                <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
                                    {POST_TYPE_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            onClick={() => handleTypeChange(option.value)}
                            style={{
                                padding: "10px 20px",
                                borderRadius: "8px",
                                border: `1px solid ${activeSearchForm.type === option.value ? '#38d39f' : '#e2e8f0'}`,
                                backgroundColor: activeSearchForm.type === option.value ? '#e6fffa' : '#fff',
                                color: activeSearchForm.type === option.value ? '#38d39f' : '#4a5568',
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "16px",
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* 검색 */}
                <div style={{
                    backgroundColor: "#fff",
                    padding: "24px",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    marginBottom: "32px"
                }}>
                    <div style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center"
                    }}>
                        <input
                            type="text"
                            placeholder="제목이나 내용으로 검색..."
                            value={searchForm.keyword}
                            onChange={(e) => handleFormChange('keyword', e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearch();
                                }
                            }}
                            style={{
                                flex: 1,
                                padding: "12px 16px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                                fontSize: "16px",
                                outline: "none"
                            }}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            style={{
                                padding: "12px 24px",
                                backgroundColor: "#38d39f",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "16px",
                                fontWeight: "500",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? "검색 중..." : "검색"}
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
                                style={{
                                    padding: "12px 24px",
                                    backgroundColor: "#38d39f",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                    fontWeight: "500",
                                    cursor: "pointer"
                                }}
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
                                        {formatDate(post.createdAt)}
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
