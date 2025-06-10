import React from "react";

function ChatMessagePanel({message, setMessage, sendMessage}) {
    return (
        <>
            <label>메시지</label>
            <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') sendMessage();
                }}
                placeholder="메시지를 입력하세요"
            />
            <button onClick={sendMessage}>전송</button>
        </>
    );
}

export default ChatMessagePanel;
