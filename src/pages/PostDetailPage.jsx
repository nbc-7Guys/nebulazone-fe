import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderNav from "../components/layout/HeaderNav";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import SEOHead from "../components/common/SEOHead";
import CommentList from "../components/forms/CommentList";
import { postApi, userApi } from "../services/api";
import { getPostTypeLabel } from "../types/PostType";
import { getMyUserIdFromJwt } from "../utils/auth/auth";

export default function PostDetailPage() {
    const navigate = useNavigate();
    const { postId } = useParams();
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [currentUserNickname, setCurrentUserNickname] = useState(null);

    const currentUserId = getMyUserIdFromJwt();

    // 현재 사용자 정보 로드
    useEffect(() => {
        const loadUserInfo = async () => {
            if (currentUserId) {
                try {
                    const userInfo = await userApi.getMyProfile();
                    setCurrentUserNickname(userInfo.nickname);
                } catch (error) {
                    console.error('사용자 정보 로드 실패:', error);
                }
            }
        };

        loadUserInfo();
    }, [currentUserId]);

    // 게시글 상세 로드
    useEffect(() => {
        const loadPost = async () => {
            try {
                setLoading(true);
                setError("");
                
                const response = await postApi.getPost(postId);
                setPost(response);
                
            } catch (error) {
                console.error('게시글 로드 실패:', error);
                setError('게시글을 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            loadPost();
        }
    }, [postId]);

    // 게시글 삭제
    const handleDelete = async () => {
        if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            return;
        }

        try {
            setDeleting(true);
            await postApi.deletePost(postId);
            alert('게시글이 삭제되었습니다.');
            navigate('/posts');
        } catch (error) {
            console.error('게시글 삭제 실패:', error);
            alert('게시글 삭제에 실패했습니다.');
        } finally {
            setDeleting(false);
        }
    };

    // 게시글 수정
    const handleEdit = () => {
        navigate(`/posts/${postId}/edit`);
    };

    // 목록으로 돌아가기
    const handleBackToList = () => {
        navigate('/posts');
    };

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 내용 내 줄바꿈 처리
    const formatContent = (content) => {
        return content.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                {index < content.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    if (loading) {
        return (
            <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
                <SEOHead 
                    title="게시글 로딩 중 - 네불라존"
                    description="게시글을 불러오는 중입니다."
                />
                <HeaderNav />
                <div style={{
                    maxWidth: "800px",
                    margin: "0 auto",
                    padding: "40px 20px"
                }}>
                    <LoadingSpinner size="large" message="게시글을 불러오는 중..." />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
                <SEOHead 
                    title="게시글 오류 - 네불라존"
                    description="게시글을 불러오는데 문제가 발생했습니다."
                />
                <HeaderNav />
                <div style={{
                    maxWidth: "800px",
                    margin: "0 auto",
                    padding: "40px 20px"
                }}>
                    <ErrorMessage
                        message={error}
                        onRetry={() => window.location.reload()}
                        retryText="다시 불러오기"
                    />
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
                <SEOHead 
                    title="게시글을 찾을 수 없음 - 네불라존"
                    description="요청하신 게시글을 찾을 수 없습니다."
                />
                <HeaderNav />
                <div style={{
                    maxWidth: "800px",
                    margin: "0 auto",
                    padding: "40px 20px"
                }}>
                    <div style={{
                        textAlign: "center",
                        padding: "60px 20px"
                    }}>
                        <h2 style={{ color: "#4a5568", marginBottom: "16px" }}>
                            게시글을 찾을 수 없습니다
                        </h2>
                        <button
                            onClick={handleBackToList}
                            style={{
                                padding: "12px 24px",
                                backgroundColor: "#38d39f",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                cursor: "pointer"
                            }}
                        >
                            목록으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 작성자 확인 - userId가 있으면 userId로, 없으면 닉네임으로 비교
    const isAuthor = currentUserId && (
        (post.userId && currentUserId === post.userId) ||
        (currentUserNickname && currentUserNickname === post.author)
    );
    
    // 디버깅용 콘솔 로그
    console.log('[PostDetailPage] 작성자 확인:', {
        currentUserId,
        currentUserNickname,
        postUserId: post.userId,
        postAuthor: post.author,
        isAuthor,
        post
    });

    // SEO 메타데이터 준비
    const truncatedContent = post.content ? post.content.substring(0, 150) + '...' : '';
    const postUrl = `${window.location.origin}/posts/${postId}`;

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <SEOHead
                title={`${post.title} - ${getPostTypeLabel(post.type)} - 네불라존`}
                description={truncatedContent || `${getPostTypeLabel(post.type)}에 등록된 게시글입니다.`}
                keywords={`${getPostTypeLabel(post.type)}, 커뮤니티, 게시글, ${post.title}`}
                url={postUrl}
                type="article"
                image={post.imageUrls && post.imageUrls.length > 0 ? post.imageUrls[0] : '/og-image.jpg'}
            />
            <HeaderNav />

            <div style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "40px 20px"
            }}>
                {/* 뒤로가기 버튼 */}
                <button
                    onClick={handleBackToList}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 16px",
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#4a5568",
                        cursor: "pointer",
                        marginBottom: "24px",
                        transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#f7fafc";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#fff";
                    }}
                >
                    ← 목록으로
                </button>

                {/* 게시글 본문 */}
                <div style={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    overflow: "hidden"
                }}>
                    {/* 헤더 */}
                    <div style={{
                        padding: "32px 32px 0 32px",
                        borderBottom: "1px solid #e2e8f0"
                    }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "16px"
                        }}>
                            <div style={{
                                padding: "4px 12px",
                                backgroundColor: "#e6fffa",
                                color: "#38d39f",
                                borderRadius: "16px",
                                fontSize: "12px",
                                fontWeight: "500"
                            }}>
                                {getPostTypeLabel(post.type)}
                            </div>
                            
                            {isAuthor && (
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        onClick={handleEdit}
                                        style={{
                                            padding: "6px 12px",
                                            backgroundColor: "#f7fafc",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            color: "#4a5568",
                                            cursor: "pointer"
                                        }}
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        style={{
                                            padding: "6px 12px",
                                            backgroundColor: "#fed7d7",
                                            border: "1px solid #feb2b2",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            color: "#c53030",
                                            cursor: deleting ? "not-allowed" : "pointer",
                                            opacity: deleting ? 0.7 : 1
                                        }}
                                    >
                                        {deleting ? "삭제 중..." : "삭제"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <h1 style={{
                            fontSize: "32px",
                            fontWeight: "bold",
                            color: "#1a202c",
                            margin: "0 0 16px 0",
                            lineHeight: "1.4"
                        }}>
                            {post.title}
                        </h1>

                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "16px 0",
                            fontSize: "14px",
                            color: "#718096"
                        }}>
                            <div style={{ display: "flex", gap: "16px" }}>
                                <span style={{ fontWeight: "500" }}>작성자: {post.author}</span>
                                <span>작성일: {formatDate(post.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 본문 내용 */}
                    <div style={{ padding: "32px" }}>
                        <div style={{
                            fontSize: "16px",
                            lineHeight: "1.7",
                            color: "#2d3748",
                            marginBottom: post.imageUrls && post.imageUrls.length > 0 ? "32px" : "0"
                        }}>
                            {formatContent(post.content)}
                        </div>

                        {/* 이미지들 */}
                        {post.imageUrls && post.imageUrls.length > 0 && (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: "16px"
                            }}>
                                {post.imageUrls.map((imageUrl, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            borderRadius: "8px",
                                            overflow: "hidden",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                                        }}
                                    >
                                        <img
                                            src={imageUrl}
                                            alt={`게시글 이미지 ${index + 1}`}
                                            style={{
                                                width: "100%",
                                                height: "auto",
                                                maxHeight: "300px",
                                                objectFit: "cover",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => {
                                                // 이미지 모달 또는 새 창에서 보기
                                                window.open(imageUrl, '_blank');
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 하단 액션 버튼들 */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "32px"
                }}>
                    <button
                        onClick={handleBackToList}
                        style={{
                            padding: "12px 24px",
                            backgroundColor: "#f7fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontSize: "16px",
                            color: "#4a5568",
                            cursor: "pointer"
                        }}
                    >
                        목록으로
                    </button>

                    {isAuthor && (
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                onClick={handleEdit}
                                style={{
                                    padding: "12px 24px",
                                    backgroundColor: "#38d39f",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                    color: "#fff",
                                    cursor: "pointer"
                                }}
                            >
                                수정하기
                            </button>
                        </div>
                    )}
                </div>

                {/* 댓글 섹션 */}
                <div style={{
                    marginTop: "48px",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    overflow: "hidden"
                }}>
                    <CommentList postId={postId} />
                </div>
            </div>
        </div>
    );
}
