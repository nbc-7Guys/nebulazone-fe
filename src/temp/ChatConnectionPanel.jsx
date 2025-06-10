import React from "react";

function ChatConnectionPanel({
                                 jwt, setJwt, roomId, setRoomId, userId, setUserId,
                                 connect, disconnect, status
                             }) {
    return (
        <>
            <label>JWT 토큰</label>
            <input value={jwt} onChange={e => setJwt(e.target.value)} placeholder="여기에 JWT 토큰을 붙여넣으세요"/>
            <label>채팅방 ID</label>
            <input value={roomId} onChange={e => setRoomId(e.target.value)} placeholder="예: 1"/>
            <label>유저 ID</label>
            <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="예: 1(판매자), 2(구매자)"/>
            <div>
                <button onClick={connect}>WebSocket 연결</button>
                <button onClick={disconnect}>연결 해제</button>
            </div>
            <div style={{marginTop: 6, fontSize: 13}}>{status}</div>
        </>
    );
}

export default ChatConnectionPanel;