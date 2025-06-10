import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function HeaderNav() {
    const location = useLocation();
    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <nav style={{
            width: "100%",
            background: "#222",
            padding: "13px 0",
            marginBottom: 0,
            color: "#fff"
        }}>
            <div style={{
                maxWidth: 1100,
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                gap: 22
            }}>
                <Link to="/" style={{
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 23,
                    textDecoration: "none",
                    marginRight: 30
                }}>PC마켓</Link>
                <Link to="/" style={{
                    color: isActive("/") ? "#38d39f" : "#fff",
                    textDecoration: "none",
                    fontWeight: 500,
                    fontSize: 16,
                }}>상품목록</Link>
                <Link to="/chat/rooms" style={{
                    color: isActive("/chat/rooms") ? "#38d39f" : "#fff",
                    textDecoration: "none",
                    fontWeight: 500,
                    fontSize: 16,
                }}>채팅방</Link>
                <Link to="/signup" style={{
                    color: "#1986F8",
                    fontWeight: 500,
                    marginLeft: 22,
                    textDecoration: "none"
                }}>회원가입</Link>
            </div>
        </nav>
    );
}
