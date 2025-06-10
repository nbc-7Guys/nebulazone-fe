import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { JwtManager } from "../utils/JwtManager";

export default function HeaderNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const isLogin = !!JwtManager.getJwt();

    const handleLogout = () => {
        JwtManager.removeTokens();
        navigate("/login", { replace: true });
    };

    const isActive = path => location.pathname.startsWith(path);

    return (
        <nav style={{
            width: "100%", background: "#222", padding: "13px 0", color: "#fff"
        }}>
            <div style={{
                maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 22
            }}>
                <Link to="/" style={{
                    color: "#fff", fontWeight: 800, fontSize: 23, textDecoration: "none", marginRight: 30
                }}>TechExchange</Link>
                <Link to="/" style={{
                    color: isActive("/") ? "#38d39f" : "#fff", textDecoration: "none", fontWeight: 500, fontSize: 16
                }}>홈</Link>
                <Link to="/chat/rooms" style={{
                    color: isActive("/chat/rooms") ? "#38d39f" : "#fff", textDecoration: "none", fontWeight: 500, fontSize: 16
                }}>채팅방</Link>
                <div style={{ marginLeft: "auto" }}>
                    {!isLogin ? (
                        <>
                            <Link to="/login" style={{
                                color: isActive("/login") ? "#38d39f" : "#fff", fontWeight: 500, fontSize: 16, marginRight: 18, textDecoration: "none"
                            }}>로그인</Link>
                            <Link to="/signup" style={{
                                color: isActive("/signup") ? "#38d39f" : "#fff", fontWeight: 500, fontSize: 16, textDecoration: "none"
                            }}>회원가입</Link>
                        </>
                    ) : (
                        <button onClick={handleLogout}
                                style={{
                                    background: "#fff", color: "#222", border: "none", borderRadius: 6,
                                    padding: "5px 18px", marginLeft: 12, fontWeight: 600, fontSize: 15, cursor: "pointer"
                                }}>로그아웃</button>
                    )}
                </div>
            </div>
        </nav>
    );
}
