import React, { useState } from "react";
import NotificationDisplay from "../common/NotificationDisplay";
import {useLocation, useNavigate} from "react-router-dom";
import {JwtManager} from "../../services/managers/JwtManager";
import {getMyEmailFromJwt, getMyUserIdFromJwt} from "../../utils/auth/auth";
import {authApi} from "../../services/api";

export default function HeaderNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const jwt = JwtManager.getJwt();
    const userEmail = getMyEmailFromJwt();
    const userId = getMyUserIdFromJwt();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await authApi.signOut();
        JwtManager.removeTokens();
        navigate("/login");
        setIsMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const handleMenuItemClick = (path) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    return (
        <nav style={{
            backgroundColor: "#fff",
            borderBottom: "1px solid #e2e8f0",
            padding: "0 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "60px"
            }}>
                {/* 로고 */}
                <div
                    onClick={() => navigate("/")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#38d39f",
                        cursor: "pointer",
                        userSelect: "none"
                    }}
                >
                    <img 
                        src="/logo.png" 
                        alt="NebulaZone"
                        style={{
                            height: "40px",
                            objectFit: "contain"
                        }}
                    />
                </div>

                {/* 네비게이션 메뉴 */}
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <NavLink
                        onClick={() => navigate("/products/direct")}
                        active={isActive("/products/direct") || isActive("/products/auction")}
                        text="상품 목록"
                    />
                    
                    <NavLink
                        onClick={() => navigate("/catalogs")}
                        active={location.pathname.startsWith("/catalogs")}
                        text="카탈로그"
                    />
                    
                    <NavLink
                        onClick={() => navigate("/posts")}
                        active={location.pathname.startsWith("/posts")}
                        text="커뮤니티"
                    />

                    {jwt && (
                        <NavLink
                            onClick={() => navigate("/products/create")}
                            active={isActive("/products/create")}
                            text="상품 등록"
                        />
                    )}

                    <NavLink
                        onClick={() => navigate("/point/charge")}
                        active={isActive("/point/charge")}
                        text="포인트 충전"
                    />
                </div>

                {/* 사용자 메뉴 */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
                    {jwt ? (
                        <>
                            {/* 알림 */}
                            <NotificationDisplay />
                            <span style={{ fontSize: "14px", color: "#666" }}>
                                {userEmail || `사용자 ID: ${userId}`}
                            </span>

                            {/* 햄버거 메뉴 버튼 */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                style={{
                                    padding: "12px",
                                    backgroundColor: isMenuOpen ? "#38d39f" : "#fff",
                                    color: isMenuOpen ? "#fff" : "#4a5568",
                                    border: `2px solid ${isMenuOpen ? "#38d39f" : "#e2e8f0"}`,
                                    borderRadius: "16px",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "48px",
                                    height: "48px",
                                    boxShadow: isMenuOpen ? "0 8px 25px rgba(56, 211, 159, 0.3)" : "0 2px 8px rgba(0,0,0,0.1)",
                                    transform: isMenuOpen ? "scale(1.05)" : "scale(1)",
                                    position: "relative"
                                }}
                                onMouseEnter={(e) => {
                                    if (!isMenuOpen) {
                                        e.target.style.backgroundColor = "#f0fff4";
                                        e.target.style.borderColor = "#38d39f";
                                        e.target.style.transform = "scale(1.05)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isMenuOpen) {
                                        e.target.style.backgroundColor = "#fff";
                                        e.target.style.borderColor = "#e2e8f0";
                                        e.target.style.transform = "scale(1)";
                                    }
                                }}
                            >
                                <div style={{
                                    position: "absolute",
                                    width: "20px",
                                    height: "2px",
                                    backgroundColor: isMenuOpen ? "#fff" : "#4a5568",
                                    transition: "all 0.3s ease",
                                    transform: isMenuOpen ? "rotate(45deg)" : "translateY(-4px)"
                                }}></div>
                                <div style={{
                                    position: "absolute",
                                    width: "20px",
                                    height: "2px",
                                    backgroundColor: isMenuOpen ? "#fff" : "#4a5568",
                                    transition: "all 0.3s ease",
                                    opacity: isMenuOpen ? "0" : "1"
                                }}></div>
                                <div style={{
                                    position: "absolute",
                                    width: "20px",
                                    height: "2px",
                                    backgroundColor: isMenuOpen ? "#fff" : "#4a5568",
                                    transition: "all 0.3s ease",
                                    transform: isMenuOpen ? "rotate(-45deg)" : "translateY(4px)"
                                }}></div>
                            </button>

                            {/* 드롭다운 메뉴 */}
                            {isMenuOpen && (
                                <div style={{
                                    position: "absolute",
                                    top: "calc(100% + 16px)",
                                    right: "0",
                                    backgroundColor: "#fff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "20px",
                                    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                                    zIndex: 1000,
                                    minWidth: "220px",
                                    padding: "16px 0",
                                    animation: "slideDown 0.3s ease-out",
                                    overflow: "hidden"
                                }}>
                                    <div style={{
                                        padding: "0 20px 16px",
                                        borderBottom: "1px solid #f1f5f9",
                                        marginBottom: "8px"
                                    }}>
                                        <div style={{
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "#1a202c",
                                            marginBottom: "4px"
                                        }}>
                                            메뉴
                                        </div>
                                        <div style={{
                                            fontSize: "12px",
                                            color: "#64748b"
                                        }}>
                                            {userEmail || `User ${userId}`}
                                        </div>
                                    </div>

                                    <MenuItem
                                        onClick={() => handleMenuItemClick("/mypage")}
                                        text="마이페이지"
                                        icon="👤"
                                        active={isActive("/mypage")}
                                    />
                                    <MenuItem
                                        onClick={() => handleMenuItemClick("/catalogs")}
                                        text="카탈로그"
                                        icon="📖"
                                        active={location.pathname.startsWith("/catalogs")}
                                    />
                                    <MenuItem
                                        onClick={() => handleMenuItemClick("/posts")}
                                        text="커뮤니티"
                                        icon="📝"
                                        active={location.pathname.startsWith("/posts")}
                                    />
                                    <MenuItem
                                        onClick={() => handleMenuItemClick("/transactions")}
                                        text="거래내역"
                                        icon="📋"
                                        active={isActive("/transactions")}
                                    />
                                    <MenuItem
                                        onClick={() => handleMenuItemClick("/chat/rooms")}
                                        text="채팅"
                                        icon="💬"
                                        active={isActive("/chat/rooms")}
                                    />

                                    <div style={{
                                        height: "1px",
                                        backgroundColor: "#f1f5f9",
                                        margin: "12px 20px"
                                    }}></div>

                                    <MenuItem
                                        onClick={handleLogout}
                                        text="로그아웃"
                                        icon="🚪"
                                        isLogout={true}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate("/login")}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "transparent",
                                    color: "#4a5568",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "#f7fafc";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "transparent";
                                }}
                            >
                                로그인
                            </button>
                            <button
                                onClick={() => navigate("/signup")}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#38d39f",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "#2eb888";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "#38d39f";
                                }}
                            >
                                회원가입
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* 메뉴가 열려있을 때 배경 클릭으로 닫기 (블러 효과 제거) */}
            {isMenuOpen && (
                <div
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                    }}
                />
            )}

            {/* CSS 애니메이션을 위한 스타일 */}
            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>

        </nav>
    );
}

function NavLink({ onClick, active, text }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "8px 12px",
                backgroundColor: "transparent",
                color: active ? "#38d39f" : "#4a5568",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: active ? "600" : "400",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textDecoration: "none"
            }}
            onMouseEnter={(e) => {
                if (!active) {
                    e.target.style.backgroundColor = "#f7fafc";
                    e.target.style.color = "#38d39f";
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#4a5568";
                }
            }}
        >
            {text}
        </button>
    );
}

function MenuItem({ onClick, text, icon, active, isLogout }) {
    return (
        <button
            onClick={onClick}
            style={{
                width: "100%",
                padding: "14px 20px",
                backgroundColor: active ? "#f0fff4" : "transparent",
                color: isLogout ? "#ef4444" : (active ? "#38d39f" : "#4a5568"),
                border: "none",
                fontSize: "15px",
                fontWeight: active ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "12px"
            }}
            onMouseEnter={(e) => {
                if (!active) {
                    e.target.style.backgroundColor = isLogout ? "#fef2f2" : "#f8fafc";
                    e.target.style.paddingLeft = "24px";
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.paddingLeft = "20px";
                }
            }}
        >
            <span style={{
                fontSize: "16px",
                width: "20px",
                textAlign: "center"
            }}>
                {icon}
            </span>
            {text}
        </button>
    );
}