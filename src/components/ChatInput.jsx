import React, { useState } from "react";

export default function ChatInput({ onSend, disabled }) {
    const [msg, setMsg] = useState("");

    const handleSend = () => {
        if (!msg.trim() || disabled) return;
        onSend(msg);
        setMsg("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSend();
    };

    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            <input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={disabled ? "서버 연결 중..." : "메시지를 입력하세요"}
                disabled={disabled}
                style={{
                    flex: 1, padding: 10, border: "1px solid #ddd", borderRadius: 16, marginRight: 8
                }}
            />
            <button onClick={handleSend} disabled={disabled || !msg.trim()} style={{
                background: "#38d39f",
                color: "#fff",
                borderRadius: 12,
                padding: "7px 20px",
                fontWeight: 500,
                border: "none"
            }}>전송</button>
        </div>
    );
}
