import React, {useEffect, useRef} from "react";
import { getMyUserIdFromJwt } from "../../utils/auth/auth";

export default function ChatHistory({ chatHistory }) {
    const myUserId = getMyUserIdFromJwt();
    const chatEndRef = useRef(null);

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
            maxHeight: 340, 
            overflowY: "auto", 
            overflowX: "hidden",
            padding: "8px 0",
            wordWrap: "break-word"
        }}>
            {chatHistory.map((msg, i) => {
                // msg.userId(혹은 senderId, 실제 백엔드 응답에 맞게)
                const isMe = String(msg.senderId) === String(myUserId);
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
                                padding: "9px 14px",
                                minWidth: 44,
                                maxWidth: 260,
                                boxShadow: "0 1px 4px #0001",
                                fontSize: 15,
                                textAlign: "left",
                                wordWrap: "break-word",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                hyphens: "auto"
                            }}
                        >
                            {msg.message}
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
