import React, { useEffect, useState } from "react";
import HeaderNav from "../components/HeaderNav";
import ChatRoomListItem from "../components/ChatRoomListItem";
import { JwtManager } from "../utils/JwtManager";

export default function ChatRoomListPage() {
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const jwt = JwtManager.getJwt();
        fetch("http://localhost:8080/chat/rooms", {
            headers: { "Authorization": "Bearer " + jwt }
        })
            .then(res => {
                if (!res.ok) throw new Error("채팅방 목록 조회 실패");
                return res.json();
            })
            .then(data => {
                setChatRooms(data.chatRooms || []);
            })
            .catch(() => setErrorMsg("채팅방 목록 조회에 실패했습니다."))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <HeaderNav />
            <div style={{
                maxWidth: 900,
                margin: "36px auto",
                background: "#fff",
                borderRadius: 12,
                padding: 44,
                boxShadow: "0 4px 24px #0001"
            }}>
                <div style={{ fontWeight: 700, fontSize: 32, marginBottom: 10 }}>내 채팅방</div>
                {loading ? (
                    <div style={{ margin: "44px 0" }}>조회 중...</div>
                ) : errorMsg ? (
                    <div style={{ color: "red" }}>{errorMsg}</div>
                ) : chatRooms.length === 0 ? (
                    <div style={{ color: "#888", margin: "44px 0" }}>참여 중인 채팅방이 없습니다.</div>
                ) : (
                    chatRooms.map(room =>
                        <ChatRoomListItem key={room.chatRoomId} room={room} />
                    )
                )}
            </div>
        </div>
    );
}
