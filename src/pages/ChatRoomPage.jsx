import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import HeaderNav from "../components/layout/HeaderNav";
import ChatHistory from "../components/chat/ChatHistory";
import ChatInput from "../components/chat/ChatInput";
import { JwtManager } from "../services/managers/JwtManager";
import { productApi, chatApi } from "../services/api";
import { ErrorHandler, ToastManager } from "../utils/error/errorHandler";
import { useChat } from "../hooks/useChat";
import { useWebSocket } from "../hooks/useWebSocket";

export default function ChatRoomPage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { roomId } = useParams();

    const jwt = JwtManager.getJwt();
    const initialProduct = state?.product;

    const [product, setProduct] = useState(initialProduct);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [purchasing, setPurchasing] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(false);
    const [leaving, setLeaving] = useState(false);

    // WebSocket 훅 사용
    const { isConnected } = useWebSocket();
    const {
        messages: chatHistory,
        isLoadingHistory,
        subscribeToChatRoom,
        unsubscribeFromChatRoom,
        sendChatMessage,
        sendImageMessage,
        isChatConnected
    } = useChat(parseInt(roomId));

    useEffect(() => {
        if (!jwt) {
            navigate("/", { replace: true });
            return;
        }

        // 새로고침으로 product 정보가 없는 경우 API로 가져오기
        if (!product && roomId) {
            const fetchProductInfo = async () => {
                try {
                    setLoading(true);
                    // roomId로 상품 정보를 가져오는 API 호출
                    const productData = await chatApi.getChatRoomInfo(roomId);
                    setProduct(productData.product);
                } catch (error) {
                    console.error("Failed to fetch product info:", error);
                    setErrorMsg("상품 정보를 불러올 수 없습니다.");
                } finally {
                    setLoading(false);
                }
            };
            fetchProductInfo();
        } else {
            setLoading(false);
        }
    }, [roomId, jwt, navigate, product]);

    // 채팅방 구독 관리 - 웹소켓 연결 상태 변화에 반응
    useEffect(() => {
        if (!jwt) return;

        const initializeChatRoom = async () => {
            // WebSocket이 연결되고 채팅이 연결되지 않은 경우에만 구독
            if (isConnected() && !isChatConnected()) {
                try {
                    console.log(`[ChatRoomPage] Subscribing to chat room ${roomId}`);
                    await subscribeToChatRoom();
                    setErrorMsg("");
                } catch (error) {
                    console.error("[ChatRoomPage] Failed to subscribe to chat room:", error);
                    
                    if (error.message && (
                        error.message.toLowerCase().includes('token') || 
                        error.message.toLowerCase().includes('unauthorized')
                    )) {
                        setErrorMsg("인증이 만료되어 다시 로그인해주세요.");
                        JwtManager.removeTokens();
                        navigate('/login');
                    } else {
                        setErrorMsg(`채팅 서버 연결 실패: ${error.message || '알 수 없는 오류'}`);
                    }
                }
            }
        };

        // 웹소켓 연결 상태가 변경될 때마다 재시도
        const interval = setInterval(() => {
            if (isConnected() && !isChatConnected()) {
                console.log(`[ChatRoomPage] Retrying chat room subscription for room ${roomId}`);
                initializeChatRoom();
            }
        }, 5000); // 5초마다 확인 (간격 늘림)

        // 즉시 한 번 실행
        initializeChatRoom();

        return () => {
            clearInterval(interval);
            if (isChatConnected()) {
                console.log(`[ChatRoomPage] Unsubscribing from chat room ${roomId}`);
                unsubscribeFromChatRoom();
            }
        };
    }, [roomId, jwt, subscribeToChatRoom, unsubscribeFromChatRoom, navigate]);


    const handleSendMessage = async (msgText) => {
        if (!isChatConnected()) {
            ToastManager.warning("서버와 연결되지 않았습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        try {
            await sendChatMessage(msgText);
        } catch (error) {
            console.error("[ChatRoomPage] Failed to send message:", error);
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
            
            // 구매 완료 메시지를 채팅에 추가
            try {
                await sendChatMessage("상품을 구매했습니다.", "TEXT");
            } catch (chatError) {
                console.error("Purchase notification message failed:", chatError);
            }
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            ToastManager.error(error.message || errorInfo.message || "구매에 실패했습니다.");
        } finally {
            setPurchasing(false);
        }
    };

    // 채팅방 나가기
    const handleLeaveChatRoom = async () => {
        const confirmLeave = window.confirm("정말로 채팅방을 나가시겠습니까?\n채팅방을 나가면 더 이상 메시지를 받을 수 없습니다.");
        if (!confirmLeave) return;

        setLeaving(true);
        try {
            // WebSocket 구독 해제
            unsubscribeFromChatRoom();
            
            // 서버에 채팅방 나가기 요청
            await chatApi.leaveChatRoom(roomId);
            
            ToastManager.success("채팅방을 나갔습니다.");
            navigate("/chat/rooms", { replace: true });
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            ToastManager.error(error.message || errorInfo.message || "채팅방 나가기에 실패했습니다.");
        } finally {
            setLeaving(false);
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

    // 연결 상태 실시간 업데이트
    useEffect(() => {
        const updateConnectionStatus = () => {
            const wsConnected = isConnected();
            const chatConnected = isChatConnected();
            const newStatus = wsConnected && chatConnected;
            
            console.log('[ChatRoomPage] Connection Status Update:', {
                webSocketConnected: wsConnected,
                chatConnected: chatConnected,
                newStatus: newStatus,
                currentStatus: connectionStatus
            });
            
            if (newStatus !== connectionStatus) {
                setConnectionStatus(newStatus);
                console.log(`[ChatRoomPage] Connection status changed: ${connectionStatus} -> ${newStatus}`);
            }
        };

        // 즉시 한 번 실행
        updateConnectionStatus();

        // 주기적으로 상태 확인 (1초마다)
        const statusInterval = setInterval(updateConnectionStatus, 1000);

        return () => {
            clearInterval(statusInterval);
        };
    }, [isConnected(), isChatConnected(), connectionStatus]);

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
                    {product.image ? (
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            style={{ 
                                width: 72, 
                                height: 72, 
                                borderRadius: 12, 
                                marginRight: 18, 
                                objectFit: "cover",
                                border: "1px solid #e2e8f0"
                            }} 
                        />
                    ) : (
                        <div 
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: 12,
                                backgroundColor: "#f7fafc",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 18,
                                border: "1px solid #e2e8f0",
                                fontSize: 12,
                                color: "#a0aec0"
                            }}
                        >
                            이미지<br/>없음
                        </div>
                    )}
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
                <div style={{ overflowX: "hidden" }}>
                    {loading || isLoadingHistory
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
                    <ChatInput 
                        onSend={handleSendMessage} 
                        onSendImage={sendImageMessage}
                        disabled={!connectionStatus || !!errorMsg} 
                    />
                    <div style={{ 
                        color: connectionStatus ? "#38d39f" : "#e53e3e", 
                        fontSize: 15, 
                        marginTop: 5,
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                    }}>
                        <span style={{ 
                            width: 8, 
                            height: 8, 
                            backgroundColor: connectionStatus ? "#38d39f" : "#e53e3e", 
                            borderRadius: "50%",
                            display: "inline-block"
                        }} />
                        {connectionStatus ? "서버와 연결됨" : "서버 연결 안됨"}
                    </div>
                </div>
                <div style={{ marginTop: 24, display: "flex", gap: "12px" }}>
                    <button
                        style={{
                            background: "#e53e3e",
                            color: "#fff",
                            padding: "11px 22px",
                            borderRadius: 8,
                            fontWeight: 500,
                            fontSize: 16,
                            border: "none",
                            cursor: leaving ? "not-allowed" : "pointer",
                            opacity: leaving ? 0.6 : 1,
                            transition: "all 0.2s ease"
                        }}
                        onClick={handleLeaveChatRoom}
                        disabled={leaving}
                        onMouseEnter={(e) => {
                            if (!leaving) {
                                e.target.style.backgroundColor = "#c53030";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!leaving) {
                                e.target.style.backgroundColor = "#e53e3e";
                            }
                        }}
                    >
                        {leaving ? "나가는 중..." : "채팅방 나가기"}
                    </button>
                    <button
                        style={{
                            background: "#eee",
                            color: "#333",
                            padding: "11px 22px",
                            borderRadius: 8,
                            fontWeight: 500,
                            fontSize: 16,
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                        }}
                        onClick={() => navigate(-1)}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#e2e8f0";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#eee";
                        }}
                    >
                        뒤로가기
                    </button>
                </div>
            </div>
        </div>
    );
}
