import React from "react";

function ChatArea({ chat }) {
    return (
        <div
            id="chatArea"
            style={{
                border: "1px solid #ddd", padding: 10, height: 160,
                overflowY: "auto", background: "#fff", marginBottom: 10
            }}
        >
            {chat.map((msg, i) => (
                <div key={i} style={{ whiteSpace: "pre-wrap" }}>{msg}</div>
            ))}
        </div>
    );
}

export default ChatArea;
