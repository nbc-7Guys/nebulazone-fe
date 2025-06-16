import React, { useState } from "react";

export default function ChatInput({ onSend, disabled = false }) {
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={disabled ? "연결 중..." : "메시지를 입력하세요..."}
                disabled={disabled}
                style={{
                    flex: 1,
                    minHeight: "44px",
                    maxHeight: "120px",
                    padding: "12px 16px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    resize: "none",
                    fontSize: "15px",
                    fontFamily: "inherit",
                    outline: "none",
                    backgroundColor: disabled ? "#f7fafc" : "#fff",
                    color: disabled ? "#a0aec0" : "#2d3748",
                    transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                    if (!disabled) {
                        e.target.style.borderColor = "#38d39f";
                        e.target.style.boxShadow = "0 0 0 3px rgba(56, 211, 159, 0.1)";
                    }
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                }}
            />
            <button
                type="submit"
                disabled={!message.trim() || disabled}
                style={{
                    padding: "12px 20px",
                    backgroundColor: (!message.trim() || disabled) ? "#e2e8f0" : "#38d39f",
                    color: (!message.trim() || disabled) ? "#a0aec0" : "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: (!message.trim() || disabled) ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    minWidth: "80px",
                    height: "44px",
                }}
                onMouseEnter={(e) => {
                    if (!disabled && message.trim()) {
                        e.target.style.backgroundColor = "#2eb888";
                    }
                }}
                onMouseLeave={(e) => {
                    if (!disabled && message.trim()) {
                        e.target.style.backgroundColor = "#38d39f";
                    }
                }}
            >
                전송
            </button>
        </form>
    );
}
