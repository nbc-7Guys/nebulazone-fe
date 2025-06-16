import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { JwtManager } from "../utils/JwtManager";
import { getMyUserIdFromJwt } from "../utils/auth";

export default function HeaderNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const jwt = JwtManager.getJwt();
    const userId = getMyUserIdFromJwt();

    const handleLogout = () => {
        JwtManager.removeTokens();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

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
                        onClick={() => navigate("/")}
                        active={isActive("/")}
                        text="상품 목록"
                    />
                    
                    {jwt && (
                        <>
                            <NavLink
                                onClick={() => navigate("/chat/rooms")}
                                active={isActive("/chat/rooms")}
                                text="채팅"
                            />
                            <NavLink
                                onClick={() => navigate("/products/create")}
                                active={isActive("/products/create")}
                                text="상품 등록"
                            />
                        </>
                    )}
                </div>

                {/* 사용자 메뉴 */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {jwt ? (
                        <>
                            <span style={{ fontSize: "14px", color: "#666" }}>
                                사용자 ID: {userId}
                            </span>
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#f7fafc",
                                    color: "#4a5568",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "#edf2f7";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "#f7fafc";
                                }}
                            >
                                로그아웃
                            </button>
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
