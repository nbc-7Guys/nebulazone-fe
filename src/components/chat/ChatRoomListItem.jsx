import React from "react";
import { useNavigate } from "react-router-dom";

export default function ChatRoomListItem({ room }) {
    const navigate = useNavigate();

    // room 객체 구조 확인용 로그
    console.log("ChatRoomListItem room 객체:", room);

    const handleClick = () => {
        // 서버 응답에 따라 product 객체 구성
        const product = {
            id: room.productId,
            catalogId: room.catalogId,
            name: room.productName,
            price: room.productPrice,
            image: room.imageUrl,
            isSold: room.isSold,
            seller: {
                id: room.sellerId,
                name: room.sellerName
            }
        };

        console.log("ChatRoomListItem에서 전달하는 product:", product);

        navigate(`/chat/${room.chatRoomId}`, {
            state: { 
                product: product, 
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
                padding: "18px 0",
                cursor: "pointer"
            }}
            onClick={handleClick}
        >
            {/* 상품 이미지 */}
            {room.imageUrl ? (
                <img 
                    src={room.imageUrl} 
                    alt={room.productName}
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        objectFit: "cover",
                        marginRight: 16,
                        border: "1px solid #e2e8f0"
                    }}
                />
            ) : (
                <div 
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        backgroundColor: "#f7fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 16,
                        border: "1px solid #e2e8f0",
                        fontSize: 12,
                        color: "#a0aec0"
                    }}
                >
                    이미지<br/>없음
                </div>
            )}
            
            <div style={{ flex: 2 }}>
                <div style={{ 
                    fontWeight: 600, 
                    fontSize: 18,
                    color: room.isSold ? "#999" : "#000",
                    textDecoration: room.isSold ? "line-through" : "none"
                }}>
                    {room.productName}
                    {room.isSold && (
                        <span style={{ 
                            marginLeft: 8, 
                            fontSize: 12, 
                            backgroundColor: "#e53e3e", 
                            color: "white", 
                            padding: "2px 6px", 
                            borderRadius: 4 
                        }}>
                            판매완료
                        </span>
                    )}
                </div>
                <div style={{ color: "#999", fontSize: 14, marginTop: 4 }}>
                    판매자: {room.sellerName}
                </div>
                {room.productPrice && (
                    <div style={{ 
                        color: room.isSold ? "#999" : "#38d39f", 
                        fontSize: 16, 
                        fontWeight: 600, 
                        marginTop: 4 
                    }}>
                        ₩{Number(room.productPrice).toLocaleString()}
                    </div>
                )}
            </div>
            <div style={{ flex: 1, textAlign: "right", fontSize: 15, color: "#666" }}>
                <span>방번호: {room.chatRoomId}</span>
            </div>
        </div>
    );
}
