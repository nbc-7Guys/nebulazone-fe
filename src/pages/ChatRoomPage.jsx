import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import HeaderNav from "../components/HeaderNav";
import ChatHistory from "../components/ChatHistory";
import { JwtManager } from "../utils/JwtManager";

export default function ChatRoomPage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { roomId } = useParams();

    const jwt = JwtManager.getJwt();
    const product = state?.product;

    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [leaveLoading, setLeaveLoading] = useState(false);

    useEffect(() => {
        if (!jwt || !product) {
            navigate("/", { replace: true });
            return;
        }
        fetch(`http://localhost:8080/chat/rooms/history/${roomId}`, {
            headers: { "Authorization": "Bearer " + jwt }
        })
            .then(res => {
                if (!res.ok) throw new Error("채팅 기록 조회 실패");
                return res.json();
            })
            .then(data => setChatHistory(data))
            .catch(() => setErrorMsg("채팅 기록 조회에 실패했습니다."))
            .finally(() => setLoading(false));
    }, [roomId, jwt, product, navigate]);

    // ===== 채팅방 나가기 =====
    const handleLeave = async () => {
        if (!window.confirm("정말로 채팅방을 나가시겠습니까?")) return;
        setLeaveLoading(true);
        setErrorMsg("");
        try {
            const res = await fetch(`http://localhost:8080/chat/rooms/${roomId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + jwt
                }
            });
            if (!res.ok) throw new Error("채팅방 나가기 실패");
            // 성공 시 목록으로 이동
            navigate("/chat/rooms");
        } catch {
            setErrorMsg("채팅방 나가기에 실패했습니다.");
        } finally {
            setLeaveLoading(false);
        }
    };

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <HeaderNav />
            <div style={{
                maxWidth: 700,
                margin: "40px auto",
                background: "#fff",
                borderRadius: 14,
                padding: 42,
                boxShadow: "0 4px 24px #0001"
            }}>
                {/* 상품/채팅방 정보 */}
                <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: 18, marginBottom: 22 }}>
                    <img src={product.image} alt="" style={{ width: 72, height: 72, borderRadius: 12, marginRight: 18, objectFit: "cover" }} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 20 }}>{product.name}</div>
                        <div style={{ color: "#38d39f", fontWeight: 600, marginTop: 2 }}>{product.category}</div>
                    </div>
                </div>
                {/* 채팅 기록 표시 */}
                <div style={{ minHeight: 300 }}>
                    {loading
                        ? <div>기록 불러오는 중...</div>
                        : errorMsg
                            ? <div style={{ color: "red" }}>{errorMsg}</div>
                            : <ChatHistory chatHistory={chatHistory} />}
                </div>
                {/* 채팅방 나가기 버튼 */}
                <button
                    style={{
                        marginTop: 28,
                        background: "#eee",
                        color: "#333",
                        padding: "11px 22px",
                        borderRadius: 8,
                        fontWeight: 500,
                        fontSize: 17,
                        border: "none"
                    }}
                    onClick={handleLeave}
                    disabled={leaveLoading}
                >
                    {leaveLoading ? "나가는 중..." : "채팅방 나가기"}
                </button>
            </div>
        </div>
    );
}
