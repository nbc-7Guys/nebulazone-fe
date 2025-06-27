import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderNav from "../components/layout/HeaderNav";
import ChatRoomListItem from "../components/chat/ChatRoomListItem";
import { JwtManager } from "../services/managers/JwtManager";
import { chatApi } from "../services/api";

export default function ChatRoomListPage() {
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();

    const jwt = JwtManager.getJwt();

    useEffect(() => {
        if (!jwt) {
            navigate("/login");
            return;
        }

        const loadChatRooms = async () => {
            try {
                setLoading(true);
                const data = await chatApi.getChatRooms();
                setChatRooms(data.chatRooms || []);
                setErrorMsg("");
            } catch (error) {
                console.error('채팅방 목록 조회 실패:', error);
                setErrorMsg("채팅방 목록을 불러올 수 없습니다.");
            } finally {
                setLoading(false);
            }
        };

        loadChatRooms();
    }, [jwt, navigate]);

    const handleRefresh = async () => {
        try {
            setLoading(true);
            const data = await chatApi.getChatRooms();
            setChatRooms(data.chatRooms || []);
            setErrorMsg("");
        } catch (error) {
            console.error('채팅방 목록 새로고침 실패:', error);
            setErrorMsg("채팅방 목록을 새로고침할 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (!jwt) {
        return null; // 리다이렉트 중
    }

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <HeaderNav />
            <div style={{
                maxWidth: 900,
                margin: "36px auto",
                background: "#fff",
                borderRadius: 12,
                padding: 44,
                boxShadow: "0 4px 24px #0001"
            }}>
                {/* 헤더 */}
                <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    marginBottom: 24 
                }}>
                    <div style={{ fontWeight: 700, fontSize: 32 }}>내 채팅방</div>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#38d39f",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1,
                            transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.backgroundColor = "#2eb888";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.target.style.backgroundColor = "#38d39f";
                            }
                        }}
                    >
                        {loading ? "새로고침 중..." : "새로고침"}
                    </button>
                </div>

                {/* 내용 */}
                {loading ? (
                    <div style={{ 
                        margin: "44px 0", 
                        textAlign: "center",
                        color: "#666"
                    }}>
                        채팅방 목록을 불러오는 중...
                    </div>
                ) : errorMsg ? (
                    <div style={{ 
                        color: "#e53e3e", 
                        margin: "44px 0",
                        textAlign: "center",
                        padding: "20px",
                        backgroundColor: "#fed7d7",
                        borderRadius: "8px"
                    }}>
                        {errorMsg}
                        <div style={{ marginTop: 12 }}>
                            <button
                                onClick={handleRefresh}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#e53e3e",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    cursor: "pointer"
                                }}
                            >
                                다시 시도
                            </button>
                        </div>
                    </div>
                ) : chatRooms.length === 0 ? (
                    <div style={{ 
                        color: "#888", 
                        margin: "44px 0", 
                        textAlign: "center",
                        padding: "40px",
                        backgroundColor: "#f8fafc",
                        borderRadius: "8px"
                    }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
                        <div style={{ fontSize: "18px", marginBottom: "8px" }}>
                            참여 중인 채팅방이 없습니다.
                        </div>
                        <div style={{ fontSize: "14px", color: "#999" }}>
                            상품 페이지에서 판매자와 채팅을 시작해보세요!
                        </div>
                        <button
                            onClick={() => navigate("/")}
                            style={{
                                marginTop: "20px",
                                padding: "12px 24px",
                                backgroundColor: "#38d39f",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "500",
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
                            상품 둘러보기
                        </button>
                    </div>
                ) : (
                    <div>
                        {chatRooms.map(room => (
                            <ChatRoomListItem key={room.chatRoomId} room={room} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
