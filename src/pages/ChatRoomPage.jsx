import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import HeaderNav from "../components/HeaderNav";
import ChatHistory from "../components/ChatHistory";
import ChatInput from "../components/ChatInput";
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
    const [isConnected, setIsConnected] = useState(false);

    const stompClientRef = useRef(null);

    useEffect(() => {
        if (!jwt || !product) {
            navigate("/", { replace: true });
            return;
        }
        fetch(`http://localhost:8080/chat/rooms/history/${roomId}`, {
            headers: {
                "Authorization": "Bearer " + jwt,
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("채팅 기록 조회 실패");
                return res.json();
            })
            .then(data => setChatHistory(data))
            .catch(() => setErrorMsg("채팅 기록 조회에 실패했습니다."))
            .finally(() => setLoading(false));
    }, [roomId, jwt, product, navigate]);

    useEffect(() => {
        if (!jwt) return;

        const socket = new SockJS("http://localhost:8080/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: "Bearer " + jwt },
            debug: () => {},
            onConnect: () => {
                setIsConnected(true);
                client.subscribe(`/topic/chat/${roomId}`, (msg) => {
                    try {
                        const content = JSON.parse(msg.body);
                        setChatHistory(prev => [...prev, content]);
                    } catch {
                        setChatHistory(prev => [
                            ...prev,
                            { message: msg.body, system: true }
                        ]);
                    }
                });
            },
            onStompError: (frame) => {
                setIsConnected(false);
                setErrorMsg("WebSocket 연결 실패: " + (frame.headers["message"] || "알 수 없는 에러"));
            },
            onDisconnect: () => setIsConnected(false),
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            try {
                stompClientRef.current?.deactivate();
            } catch {}
        };
    }, [jwt, roomId]);

    // 메시지 전송
    const handleSendMessage = (msgText) => {
        if (!stompClientRef.current || !stompClientRef.current.connected) return;
        stompClientRef.current.publish({
            destination: `/chat/send/${roomId}`,
            body: JSON.stringify({
                message: msgText,
                type: "TEXT"
            }),
        });
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
                <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: 18, marginBottom: 22 }}>
                    <img src={product.image} alt="" style={{ width: 72, height: 72, borderRadius: 12, marginRight: 18, objectFit: "cover" }} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 20 }}>{product.name}</div>
                        <div style={{ color: "#38d39f", fontWeight: 600, marginTop: 2 }}>{product.category}</div>
                    </div>
                </div>
                <div style={{ minHeight: 300 }}>
                    {loading
                        ? <div>기록 불러오는 중...</div>
                        : errorMsg
                            ? <div style={{ color: "red" }}>{errorMsg}</div>
                            : <ChatHistory chatHistory={chatHistory} />}
                </div>
                <div style={{ marginTop: 18 }}>
                    <ChatInput onSend={handleSendMessage} disabled={!isConnected} />
                    <div style={{ color: isConnected ? "#38d39f" : "#e53e3e", fontSize: 15, marginTop: 5 }}>
                        {isConnected ? "🟢 서버와 연결됨" : "❌ 서버 연결 안됨"}
                    </div>
                </div>
                <button
                    style={{
                        marginTop: 24,
                        background: "#eee",
                        color: "#333",
                        padding: "11px 22px",
                        borderRadius: 8,
                        fontWeight: 500,
                        fontSize: 17,
                        border: "none"
                    }}
                    onClick={() => navigate(-1)}
                >
                    나가기
                </button>
            </div>
        </div>
    );
}
