import React from "react";
import { useNavigate } from "react-router-dom";

export default function ChatRoomListItem({ room }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/chat/${room.chatRoomId}`, {
            state: { 
                product: { 
                    id: room.productId,
                    name: room.productName,
                    image: room.productImage || null,
                    category: "상품"
                }, 
                chatRoomId: room.chatRoomId 
            }
        });
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid #f1f1f1",
                padding: "20px 0",
                cursor: "pointer",
                transition: "all 0.2s ease",
                borderRadius: "8px",
                margin: "0 -12px",
                paddingLeft: "12px",
                paddingRight: "12px"
            }}
            onClick={handleClick}
            onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f8fafc";
            }}
            onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
            }}
        >
            {/* 상품 이미지 영역 */}
            <div style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
                fontSize: "24px",
                flexShrink: 0
            }}>
                {room.productImage ? (
                    <img 
                        src={room.productImage} 
                        alt={room.productName}
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: 8,
                            objectFit: "cover"
                        }}
                    />
                ) : (
                    "📦"
                )}
            </div>

            {/* 채팅방 정보 */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                    fontWeight: 600, 
                    fontSize: 18, 
                    marginBottom: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                }}>
                    {room.productName}
                </div>
                
                <div style={{ 
                    color: "#666", 
                    fontSize: 14, 
                    marginBottom: 2
                }}>
                    {room.participantNickname ? `상대방: ${room.participantNickname}` : "채팅 상대방"}
                </div>

                {room.lastMessage && (
                    <div style={{ 
                        color: "#888", 
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                    }}>
                        {room.lastMessage}
                    </div>
                )}
            </div>

            {/* 시간 및 상태 */}
            <div style={{ 
                textAlign: "right", 
                fontSize: 12, 
                color: "#999",
                flexShrink: 0,
                marginLeft: 12
            }}>
                {room.lastMessageTime && (
                    <div style={{ marginBottom: 4 }}>
                        {new Date(room.lastMessageTime).toLocaleDateString()}
                    </div>
                )}
                <div style={{ 
                    fontSize: 11, 
                    color: "#38d39f",
                    fontWeight: 500
                }}>
                    방 #{room.chatRoomId}
                </div>
            </div>
        </div>
    );
}
