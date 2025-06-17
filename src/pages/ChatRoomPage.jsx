import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import HeaderNav from "../components/HeaderNav";
import ChatHistory from "../components/ChatHistory";
import ChatInput from "../components/ChatInput";
import { JwtManager } from "../utils/JwtManager";
import { ENV } from "../utils/env";
import { productApi, chatApi } from "../services/api";
import { ErrorHandler, ToastManager } from "../utils/errorHandler";

export default function ChatRoomPage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { roomId } = useParams();

    const jwt = JwtManager.getJwt();
    const initialProduct = state?.product;

    const [product, setProduct] = useState(initialProduct);
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [purchasing, setPurchasing] = useState(false);

    const stompClientRef = useRef(null);

    useEffect(() => {
        if (!jwt) {
            navigate("/", { replace: true });
            return;
        }

        const fetchChatHistory = async () => {
            try {
                const historyData = await chatApi.getChatHistory(roomId);
                setChatHistory(historyData);
                setErrorMsg("");
            } catch (error) {
                console.error("채팅 기록 조회 실패:", error);
                const errorInfo = ErrorHandler.handleApiError(error);
                
                if (errorInfo.status === 403) {
                    setErrorMsg("채팅방에 접근할 권한이 없습니다.");
                } else if (errorInfo.status === 404) {
                    setErrorMsg("채팅방을 찾을 수 없습니다.");
                } else {
                    setErrorMsg(errorInfo.message || "채팅 기록을 불러오는데 실패했습니다.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchChatHistory();
    }, [roomId, jwt, navigate]);

    useEffect(() => {
        if (!jwt) return;

        const socket = new SockJS(`${ENV.API_BASE_URL}/ws`);
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: "Bearer " + jwt },
            debug: () => {},
            onConnect: () => {
                setIsConnected(true);
                setErrorMsg("");
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
                const errorMessage = frame.headers["message"] || "알 수 없는 WebSocket 에러";
                
                if (errorMessage.toLowerCase().includes('token') || 
                    errorMessage.toLowerCase().includes('unauthorized')) {
                    setErrorMsg("인증이 만료되어 다시 로그인해주세요.");
                    JwtManager.removeTokens();
                    navigate('/login');
                } else {
                    setErrorMsg(`채팅 서버 연결 실패: ${errorMessage}`);
                }
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
    }, [jwt, roomId, navigate]);

    const handleSendMessage = (msgText) => {
        if (!stompClientRef.current || !stompClientRef.current.connected) {
            ToastManager.warning("서버와 연결되지 않았습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        try {
            stompClientRef.current.publish({
                destination: `/chat/send/${roomId}`,
                body: JSON.stringify({
                    message: msgText,
                    type: "TEXT"
                }),
            });
        } catch (error) {
            ToastManager.error("메시지 전송에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const handlePurchase = async () => {
        if (!product || purchasing || product.isSold) return;
        
        if (product.isSold) {
            ToastManager.warning("이미 판매완료된 상품입니다.");
            return;
        }
        
        const confirmPurchase = window.confirm(`정말로 ${product.name}을(를) 구매하시겠습니까?`);
        if (!confirmPurchase) return;

        setPurchasing(true);
        try {
            const catalogId = product.catalogId;
            const productId = product.id;
            
            if (!catalogId || !productId) {
                throw new Error("상품 정보가 올바르지 않습니다.");
            }
            
            await productApi.purchaseProduct(catalogId, productId);
            
            ToastManager.success("구매가 완료되었습니다!");
            setProduct(prev => ({ ...prev, isSold: true }));
            
            setChatHistory(prev => [...prev, {
                message: "상품을 구매했습니다.",
                system: true,
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            ToastManager.error(error.message || errorInfo.message || "구매에 실패했습니다.");
        } finally {
            setPurchasing(false);
        }
    };

    if (!product) {
        return (
            <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
                <HeaderNav />
                <div style={{
                    maxWidth: 700,
                    margin: "40px auto",
                    background: "#fff",
                    borderRadius: 14,
                    padding: 42,
                    boxShadow: "0 4px 24px #0001",
                    textAlign: "center"
                }}>
                    <h2>상품 정보를 불러올 수 없습니다.</h2>
                    <p>채팅방 정보가 올바르지 않거나 상품이 삭제되었을 수 있습니다.</p>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            marginTop: 20,
                            background: "#38d39f",
                            color: "white",
                            padding: "12px 24px",
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: 16,
                            border: "none"
                        }}
                    >
                        이전 페이지로
                    </button>
                </div>
            </div>
        );
    }

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
                    <div style={{ flex: 1 }}>
                        <div style={{ 
                            fontWeight: 600, 
                            fontSize: 20,
                            color: product.isSold ? "#999" : "#000",
                            textDecoration: product.isSold ? "line-through" : "none"
                        }}>
                            {product.name}
                            {product.isSold && (
                                <span style={{ 
                                    marginLeft: 8, 
                                    fontSize: 12, 
                                    backgroundColor: "#e53e3e", 
                                    color: "white", 
                                    padding: "4px 8px", 
                                    borderRadius: 4 
                                }}>
                                    판매완료
                                </span>
                            )}
                        </div>
                        <div style={{ color: "#38d39f", fontWeight: 600, marginTop: 2 }}>{product.category}</div>
                        {product.price && (
                            <div style={{ 
                                fontSize: 18, 
                                fontWeight: 600, 
                                color: product.isSold ? "#999" : "#333", 
                                marginTop: 4 
                            }}>
                                ₩{Number(product.price).toLocaleString()}
                            </div>
                        )}
                        {product.seller && (
                            <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
                                판매자: {product.seller.name}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handlePurchase}
                        disabled={purchasing || product.isSold}
                        style={{
                            background: purchasing || product.isSold ? "#ccc" : "#38d39f",
                            color: "white",
                            padding: "12px 24px",
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: 16,
                            border: "none",
                            cursor: purchasing || product.isSold ? "not-allowed" : "pointer",
                            transition: "all 0.2s ease"
                        }}
                    >
                        {purchasing ? "구매중..." : product.isSold ? "판매완료" : "구매하기"}
                    </button>
                </div>
                <div style={{ minHeight: 300 }}>
                    {loading
                        ? <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                            <div>채팅 기록을 불러오는 중...</div>
                          </div>
                        : errorMsg
                            ? <div style={{ 
                                color: "#e53e3e", 
                                textAlign: "center", 
                                padding: "40px",
                                backgroundColor: "#fef2f2",
                                borderRadius: 8,
                                border: "1px solid #fecaca"
                            }}>
                                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                                    채팅을 불러올 수 없습니다
                                </div>
                                <div>{errorMsg}</div>
                                <button
                                    onClick={() => window.location.reload()}
                                    style={{
                                        marginTop: 12,
                                        background: "#38d39f",
                                        color: "white",
                                        padding: "8px 16px",
                                        borderRadius: 6,
                                        fontSize: 14,
                                        border: "none"
                                    }}
                                >
                                    새로고침
                                </button>
                              </div>
                            : <ChatHistory chatHistory={chatHistory} />}
                </div>
                <div style={{ marginTop: 18 }}>
                    <ChatInput onSend={handleSendMessage} disabled={!isConnected || !!errorMsg} />
                    <div style={{ 
                        color: isConnected ? "#38d39f" : "#e53e3e", 
                        fontSize: 15, 
                        marginTop: 5,
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                    }}>
                        <span style={{ 
                            width: 8, 
                            height: 8, 
                            backgroundColor: isConnected ? "#38d39f" : "#e53e3e", 
                            borderRadius: "50%",
                            display: "inline-block"
                        }} />
                        {isConnected ? "서버와 연결됨" : "서버 연결 안됨"}
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
                        border: "none",
                        cursor: "pointer"
                    }}
                    onClick={() => navigate(-1)}
                >
                    나가기
                </button>
            </div>
        </div>
    );
}
