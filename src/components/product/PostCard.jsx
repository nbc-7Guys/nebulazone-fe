import React from "react";
import { getPostTypeLabel } from "../../types/PostType";
import LazyImage from "../common/LazyImage";
import { formatRelativeTime } from "../../utils/formatting/dateUtils";

export default function PostCard({ post, onClick }) {
    const handleClick = () => {
        if (onClick) {
            onClick(post);
        }
    };


    const truncateContent = (content, maxLength = 100) => {
        if (!content) return "";
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + "...";
    };

    return (
        <div
            onClick={handleClick}
            style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: "1px solid #e2e8f0",
                marginBottom: "12px"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
                e.currentTarget.style.borderColor = "#38d39f";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                e.currentTarget.style.borderColor = "#e2e8f0";
            }}
        >
            {/* 헤더 */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "12px"
            }}>
                <div style={{ flex: 1 }}>
                    {/* 제목 */}
                    <h3 style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#1a202c",
                        margin: "0 0 8px 0",
                        lineHeight: "1.4",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}>
                        {post.title || "제목 없음"}
                    </h3>
                    
                    {/* 작성자 & 작성일 */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        color: "#718096"
                    }}>
                        <span style={{ fontWeight: "500" }}>
                            {post.author || "작성자 미상"}
                        </span>
                        <span>•</span>
                        <span>{formatRelativeTime(post.modifiedAt || post.createdAt)}</span>
                    </div>
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginLeft: "16px"
                }}>
                    {/* 이미지 아이콘 */}
                    {post.imageUrls && post.imageUrls.length > 0 && (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 8px",
                            backgroundColor: "#f7fafc",
                            borderRadius: "12px",
                            fontSize: "12px",
                            color: "#4a5568"
                        }}>
                            <span>📷</span>
                            <span>{post.imageUrls.length}</span>
                        </div>
                    )}
                    
                    {/* 게시판 타입 */}
                    <div style={{
                        padding: "4px 12px",
                        backgroundColor: "#e6fffa",
                        color: "#38d39f",
                        borderRadius: "16px",
                        fontSize: "12px",
                        fontWeight: "500",
                        whiteSpace: "nowrap"
                    }}>
                        {getPostTypeLabel(post.type)}
                    </div>
                </div>
            </div>

            {/* 내용 미리보기 */}
            {post.content && (
                <p style={{
                    fontSize: "14px",
                    color: "#4a5568",
                    lineHeight: "1.5",
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }}>
                    {truncateContent(post.content, 120)}
                </p>
            )}

            {/* 하단 정보 */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "16px",
                paddingTop: "12px",
                borderTop: "1px solid #f1f5f9"
            }}>
                <div style={{
                    fontSize: "12px",
                    color: "#a0aec0"
                }}>
                    게시글 ID: {post.postId}
                </div>
                
                <div style={{
                    fontSize: "12px",
                    color: "#718096",
                    fontWeight: "500"
                }}>
                    자세히 보기 →
                </div>
            </div>
        </div>
    );
}
