import React from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import Pagination from '../ui/Pagination';
import EmptyState from '../common/EmptyState';

const ReviewList = ({ 
    reviews, 
    loading, 
    error, 
    currentPage, 
    totalPages, 
    totalElements,
    onPageChange 
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffTime / (1000 * 60));

            if (diffMinutes < 1) {
                return '방금 전';
            } else if (diffMinutes < 60) {
                return `${diffMinutes}분 전`;
            } else if (diffHours < 24) {
                return `${diffHours}시간 전`;
            } else if (diffDays === 1) {
                return '1일 전';
            } else if (diffDays < 7) {
                return `${diffDays}일 전`;
            } else {
                return date.toLocaleDateString('ko-KR');
            }
        } catch {
            return '';
        }
    };

    const renderStars = (rating, size = "18px", showGradient = true) => {
        return Array.from({ length: 5 }, (_, index) => {
            const isFilled = index < rating;
            const isPartial = index === Math.floor(rating) && rating % 1 !== 0;
            
            return (
                <span 
                    key={index}
                    style={{
                        fontSize: size,
                        background: isFilled 
                            ? showGradient 
                                ? "linear-gradient(45deg, #fbbf24, #f59e0b)" 
                                : "#fbbf24"
                            : "transparent",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: isFilled ? "transparent" : "#e5e7eb",
                        textShadow: isFilled ? "0 1px 3px rgba(251, 191, 36, 0.3)" : "none",
                        transition: "all 0.2s ease",
                        display: "inline-block",
                        transform: "scale(1)",
                        filter: isFilled ? "drop-shadow(0 1px 2px rgba(251, 191, 36, 0.4))" : "none"
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                    }}
                >
                    ★
                </span>
            );
        });
    };

    const getAverageRating = () => {
        if (!reviews || reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.star, 0);
        return (sum / reviews.length).toFixed(1);
    };

    if (loading) {
        return (
            <div style={{
                backgroundColor: "#fff",
                padding: "32px",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
                <LoadingSpinner message="리뷰를 불러오는 중..." />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                backgroundColor: "#fff",
                padding: "32px",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
                <div style={{
                    textAlign: "center",
                    color: "#ef4444",
                    fontSize: "16px"
                }}>
                    리뷰를 불러오는데 실패했습니다.
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* 리뷰 헤더 */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                paddingBottom: "16px",
                borderBottom: "1px solid #e5e7eb"
            }}>
                <h2 style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#1a202c",
                    margin: 0
                }}>
                    사용자 리뷰
                </h2>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                }}>
                    {reviews && reviews.length > 0 && (
                        <>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}>
                                {renderStars(getAverageRating(), "24px", true)}
                            </div>
                            <div style={{
                                fontSize: "20px",
                                fontWeight: "700",
                                background: "linear-gradient(45deg, #fbbf24, #f59e0b)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                color: "transparent"
                            }}>
                                {getAverageRating()}
                            </div>
                            <div style={{
                                fontSize: "14px",
                                color: "#6b7280"
                            }}>
                                ({totalElements}개 리뷰)
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 리뷰 목록 */}
            {!reviews || reviews.length === 0 ? (
                <EmptyState
                    title="아직 리뷰가 없습니다"
                    description="이 제품에 대한 첫 번째 리뷰를 기다리고 있습니다."
                    icon="📝"
                />
            ) : (
                <>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px"
                    }}>
                        {reviews.map((review, index) => (
                            <div
                                key={review.id}
                                style={{
                                    padding: "24px",
                                    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                                    borderRadius: "16px",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    position: "relative",
                                    transition: "all 0.3s ease",
                                    backdropFilter: "blur(10px)"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
                                }}
                            >
                                {/* 리뷰 번호 배지 */}
                                <div style={{
                                    position: "absolute",
                                    top: "-8px",
                                    right: "20px",
                                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                                    color: "#fff",
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
                                }}>
                                    #{index + 1}
                                </div>
                                {/* 리뷰 헤더 */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "12px"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px"
                                    }}>
                                        {renderStars(review.star, "20px", true)}
                                        <span style={{
                                            fontSize: "16px",
                                            fontWeight: "700",
                                            background: "linear-gradient(45deg, #fbbf24, #f59e0b)",
                                            backgroundClip: "text",
                                            WebkitBackgroundClip: "text",
                                            color: "transparent"
                                        }}>
                                            {review.star}/5
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: "12px",
                                        color: "#6b7280"
                                    }}>
                                        {formatDate(review.createdAt)}
                                    </div>
                                </div>

                                {/* 리뷰 내용 */}
                                <div style={{
                                    fontSize: "16px",
                                    color: "#374151",
                                    lineHeight: "1.7",
                                    padding: "16px",
                                    backgroundColor: "rgba(255,255,255,0.5)",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(255,255,255,0.3)",
                                    marginTop: "4px",
                                    fontWeight: "400",
                                    textAlign: "justify"
                                }}>
                                    💬 {review.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div style={{ marginTop: "32px" }}>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={onPageChange}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ReviewList;