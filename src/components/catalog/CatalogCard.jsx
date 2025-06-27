import React from 'react';
import { useNavigate } from 'react-router-dom';

const CatalogCard = ({ catalog }) => {
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('ko-KR');
        } catch {
            return '';
        }
    };

    const getTypeConfig = (type) => {
        const typeConfigs = {
            'CPU': {
                label: '프로세서',
                icon: '🔥',
                gradient: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                bgGradient: 'linear-gradient(135deg, #fff5f5, #fed7d7)'
            },
            'GPU': {
                label: '그래픽카드',
                icon: '⚡',
                gradient: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
                bgGradient: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)'
            },
            'SSD': {
                label: '저장장치',
                icon: '💾',
                gradient: 'linear-gradient(135deg, #45b7d1, #096dd9)',
                bgGradient: 'linear-gradient(135deg, #f0f9ff, #dbeafe)'
            }
        };
        return typeConfigs[type] || {
            label: type,
            icon: '📦',
            gradient: 'linear-gradient(135deg, #38d39f, #2eb888)',
            bgGradient: 'linear-gradient(135deg, #f0fff4, #dcfce7)'
        };
    };

    const handleClick = () => {
        navigate(`/catalogs/${catalog.catalogId}`);
    };

    const typeConfig = getTypeConfig(catalog.catalogType);

    // 제품 상태 판단 (예시 로직 - 실제 데이터에 따라 조정)
    const getProductStatus = () => {
        const createdDate = new Date(catalog.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        
        // 최근 30일 내 등록된 제품은 "새제품"
        if (daysDiff <= 30) {
            return { type: 'new', label: 'NEW', color: '#ef4444' };
        }
        
        // 제품명에 특정 키워드가 있으면 "인기제품" (예시)
        if (catalog.catalogName && (
            catalog.catalogName.includes('RTX') || 
            catalog.catalogName.includes('i7') ||
            catalog.catalogName.includes('i9') ||
            catalog.catalogName.includes('Ryzen')
        )) {
            return { type: 'popular', label: 'HOT', color: '#f59e0b' };
        }
        
        return null;
    };

    const productStatus = getProductStatus();

    return (
        <div
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
            className="btn-click"
            role="button"
            tabIndex={0}
            aria-label={`${catalog.catalogName} 상세보기`}
            style={{
                background: typeConfig.bgGradient,
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                border: "1px solid rgba(255,255,255,0.2)",
                position: "relative",
                overflow: "hidden",
                backdropFilter: "blur(10px)",
                outline: "none"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onFocus={(e) => {
                e.currentTarget.style.transform = "translateY(-4px) scale(1.01)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(56, 211, 159, 0.3), 0 12px 24px rgba(0,0,0,0.12)";
                e.currentTarget.style.borderColor = "rgba(56, 211, 159, 0.5)";
            }}
            onBlur={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
        >
            {/* 장식용 그라데이션 오버레이 */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: typeConfig.gradient,
                borderRadius: "16px 16px 0 0"
            }} />

            {/* 상태 배지 */}
            {productStatus && (
                <div style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: productStatus.color,
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "0.5px",
                    boxShadow: `0 2px 8px ${productStatus.color}40`,
                    animation: productStatus.type === 'popular' ? 'pulse 2s infinite' : 'none',
                    zIndex: 10
                }}>
                    {productStatus.label}
                </div>
            )}

            {/* 타입 배지 */}
            <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: typeConfig.gradient,
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}>
                <span style={{ fontSize: "16px" }}>{typeConfig.icon}</span>
                {typeConfig.label}
            </div>

            {/* 제품명 */}
            <h3 style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "12px",
                color: "#1a202c",
                lineHeight: "1.3",
                textShadow: "0 1px 2px rgba(0,0,0,0.1)"
            }}>
                {catalog.catalogName}
            </h3>

            {/* 설명 */}
            {catalog.catalogDescription && (
                <p style={{
                    fontSize: "15px",
                    color: "#4a5568",
                    marginBottom: "20px",
                    lineHeight: "1.6",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    fontWeight: "400"
                }}>
                    {catalog.catalogDescription}
                </p>
            )}

            {/* 상세 정보 */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "16px"
            }}>
                {catalog.manufacturer && (
                    <span style={{
                        fontSize: "12px",
                        color: "#374151",
                        backgroundColor: "rgba(255,255,255,0.8)",
                        padding: "6px 12px",
                        borderRadius: "12px",
                        fontWeight: "500",
                        border: "1px solid rgba(255,255,255,0.3)",
                        backdropFilter: "blur(10px)"
                    }}>
                        🏭 {catalog.manufacturer}
                    </span>
                )}
                {catalog.chipset && (
                    <span style={{
                        fontSize: "12px",
                        color: "#374151",
                        backgroundColor: "rgba(255,255,255,0.8)",
                        padding: "6px 12px",
                        borderRadius: "12px",
                        fontWeight: "500",
                        border: "1px solid rgba(255,255,255,0.3)",
                        backdropFilter: "blur(10px)"
                    }}>
                        ⚙️ {catalog.chipset}
                    </span>
                )}
            </div>

            {/* 등록일 */}
            <div style={{
                fontSize: "11px",
                color: "#6b7280",
                textAlign: "right",
                fontWeight: "500",
                opacity: "0.8"
            }}>
                📅 {formatDate(catalog.createdAt)}
            </div>
        </div>
    );
};

export default CatalogCard;