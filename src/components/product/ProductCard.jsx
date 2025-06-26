import React from "react";

export default function ProductCard({ product, onClick }) {
    const handleClick = () => {
        if (onClick) {
            onClick(product);
        }
    };

    const formatPrice = (price) => {
        if (!price) return "가격 정보 없음";

        // 경매 상품인지 확인
        const isAuction = product.isAuction || product.category === "경매" || product.priceLabel === "시작가";

        if (isAuction) {
            return `시작가: ${price.toLocaleString()}원`;
        }

        return price.toLocaleString() + "원";
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                return "오늘";
            } else if (diffDays === 1) {
                return "1일 전";
            } else if (diffDays < 7) {
                return `${diffDays}일 전`;
            } else {
                return date.toLocaleDateString('ko-KR');
            }
        } catch {
            return "";
        }
    };

    return (
        <div
            onClick={handleClick}
            style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                height: "320px",
                display: "flex",
                flexDirection: "column"
            }}
            onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-4px)";
                e.target.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
        >
            {/* 상품 이미지 */}
            <div style={{
                width: "100%",
                height: "200px",
                overflow: "hidden",
                backgroundColor: "#f7fafc",
                position: "relative"
            }}>
                {product.image && product.image !== '/placeholder-image.jpg' ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}

                {/* 플레이스홀더 */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: (!product.image || product.image === '/placeholder-image.jpg') ? 'flex' : 'none',
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f0f0f0",
                    color: "#999",
                    fontSize: "40px"
                }}>
                    📦
                </div>

                {/* 카테고리 배지 */}
                {product.category && (
                    <div style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        backgroundColor: product.category === "경매" ? "#e53e3e" : "#38d39f",
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "500"
                    }}>
                        {product.category}
                    </div>
                )}
            </div>

            {/* 상품 정보 */}
            <div style={{
                padding: "16px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
            }}>
                <div>
                    {/* 상품명 */}
                    <h3 style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#1a202c",
                        marginBottom: "8px",
                        lineHeight: "1.4",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        minHeight: "44px"
                    }}>
                        {product.name || "상품명 없음"}
                    </h3>

                    {/* 가격 */}
                    <div style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#38d39f",
                        marginBottom: "8px"
                    }}>
                        {formatPrice(product.price)}
                    </div>
                </div>

                {/* 등록일 */}
                <div style={{
                    fontSize: "12px",
                    color: "#718096",
                    textAlign: "right"
                }}>
                    {formatDate(product.createdAt)}
                </div>
            </div>
        </div>
    );
}