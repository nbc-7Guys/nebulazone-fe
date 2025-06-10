import React from "react";
import { useNavigate } from "react-router-dom";

export default function ChatRoomListItem({ room }) {
    const navigate = useNavigate();

    // room: { productName, sellerName, chatRoomId }

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid #f1f1f1",
                padding: "18px 0",
                cursor: "pointer"
            }}
            onClick={() => navigate(`/chat/${room.chatRoomId}`, {
                state: { product: { name: room.productName }, chatRoomId: room.chatRoomId }
            })}
        >
            <div style={{ flex: 2 }}>
                <div style={{ fontWeight: 600, fontSize: 18 }}>{room.productName}</div>
                <div style={{ color: "#999", fontSize: 14, marginTop: 4 }}>
                    판매자: {room.sellerName}
                </div>
            </div>
            <div style={{ flex: 1, textAlign: "right", fontSize: 15, color: "#666" }}>
                <span>방번호: {room.chatRoomId}</span>
            </div>
        </div>
    );
}
