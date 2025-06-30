import React, {useEffect, useRef, useState} from "react";
import { getMyUserIdFromJwt } from "../../utils/auth/auth";

export default function ChatHistory({ chatHistory }) {
    const myUserId = getMyUserIdFromJwt();
    const chatEndRef = useRef(null);
    const [chatHeight, setChatHeight] = useState(400);

    // 창 크기에 따른 채팅창 높이 계산
    useEffect(() => {
        const calculateChatHeight = () => {
            const windowHeight = window.innerHeight;
            // 헤더, 상품 정보, 입력창, 기타 여백을 제외한 높이 계산
            const availableHeight = windowHeight - 400; // 대략적인 고정 요소들의 높이
            const minHeight = 300;
            const maxHeight = 600;
            
            setChatHeight(Math.max(minHeight, Math.min(maxHeight, availableHeight)));
        };

        calculateChatHeight();
        window.addEventListener('resize', calculateChatHeight);
        
        return () => window.removeEventListener('resize', calculateChatHeight);
    }, []);

    // 채팅 기록이 바뀔 때마다 아래로 스크롤
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatHistory]);

    if (!chatHistory || chatHistory.length === 0)
        return <div style={{ color: "#888" }}>채팅 기록이 없습니다.</div>;

    return (
        <div style={{ 
            height: chatHeight,
            maxHeight: chatHeight, 
            overflowY: "auto", 
            overflowX: "hidden",
            padding: "8px 0",
            wordWrap: "break-word"
        }}>
            {chatHistory.map((msg, i) => {
                // msg.userId(혹은 senderId, 실제 백엔드 응답에 맞게)
                const isMe = String(msg.senderId) === String(myUserId);
                
                // 메시지 타입 확인 (여러 필드명 지원)
                const messageType = msg.messageType || msg.type;
                const isImageMessage = messageType === 'IMAGE';
                
                return (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            flexDirection: isMe ? "row-reverse" : "row",
                            alignItems: "flex-end",
                            marginBottom: 10,
                            gap: 8,
                        }}>
                        <div
                            style={{
                                background: isMe ? "#38d39f" : "#fff",
                                color: isMe ? "#fff" : "#222",
                                borderRadius: 13,
                                padding: isImageMessage ? "4px" : "9px 14px",
                                minWidth: 44,
                                maxWidth: isImageMessage ? 280 : 260,
                                boxShadow: "0 1px 4px #0001",
                                fontSize: 15,
                                textAlign: "left",
                                wordWrap: "break-word",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                hyphens: "auto"
                            }}
                        >
                            {isImageMessage ? (
                                <img 
                                    src={msg.message} 
                                    alt="채팅 이미지" 
                                    style={{
                                        width: "100%",
                                        maxWidth: "250px",
                                        height: "auto",
                                        borderRadius: "8px",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => {
                                        const newWindow = window.open();
                                        newWindow.document.write(`<img src="${msg.message}" style="max-width:100%;height:auto;" />`);
                                    }}
                                />
                            ) : (
                                msg.message
                            )}
                        </div>
                        <div style={{
                            fontSize: 12, color: "#aaa", marginBottom: 2, minWidth: 65,
                            textAlign: isMe ? "right" : "left"
                        }}>
                            {msg.sendTime ? new Date(msg.sendTime).toLocaleTimeString() : ""}
                        </div>
                    </div>
                );
            })}
            <div ref={chatEndRef} />
        </div>
    );
}
