import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { products } from "../mock/products";
import HeaderNav from "../components/HeaderNav";
import { JwtManager } from "../utils/JwtManager";
import { ENV } from "../utils/env";

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const product = products.find(p => String(p.id) === String(id));
    const jwt = JwtManager.getJwt();

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    if (!product) {
        return (
            <div style={{ padding: 40 }}>
                <HeaderNav />
                <div style={{ maxWidth: 700, margin: "40px auto", textAlign: "center" }}>
                    <h2>상품을 찾을 수 없습니다.</h2>
                    <button onClick={() => navigate("/")} style={{ marginTop: 18, padding: "10px 24px", borderRadius: 8, background: "#38d39f", color: "#fff", fontWeight: 500, fontSize: 16, border: "none" }}>메인으로</button>
                </div>
            </div>
        );
    }

    // 채팅방 생성 후 이동
    const handleStartChat = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const response = await axios.post(`${ENV.API_BASE_URL}/chat/rooms`, 
                { productId: product.id },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + jwt,
                    }
                }
            );
            const data = response.data;
            
            // 서버 응답에서 받은 상품 정보로 완전한 product 객체 생성
            const completeProduct = {
                id: data.productId,
                catalogId: data.catalogId,
                name: data.productName,
                price: data.productPrice,
                image: product.image,
                category: product.category,
                description: product.description,
                seller: {
                    id: data.sellerId,
                    name: data.sellerName
                }
            };
            
            navigate(`/chat/${data.chatRoomId}`, { 
                state: { 
                    product: completeProduct,
                    chatRoomId: data.chatRoomId 
                } 
            });
        } catch (error) {
            setErrorMsg("채팅방 생성에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <HeaderNav />
            <div style={{
                maxWidth: 700,
                margin: "40px auto",
                background: "#fff",
                borderRadius: 14,
                padding: 42,
                boxShadow: "0 4px 24px #0001"
            }}>
                <img src={product.image} alt={product.name} style={{ width: "100%", borderRadius: 12, maxHeight: 340, objectFit: "cover" }} />
                <div style={{ marginTop: 26, fontSize: 27, fontWeight: 700 }}>{product.name}</div>
                <div style={{ margin: "10px 0 18px 0", color: "#888", fontSize: 16 }}>{product.category}</div>
                <div style={{ color: "#222", fontSize: 18 }}>{product.description}</div>
                <button
                    style={{
                        marginTop: 36,
                        background: "#38d39f",
                        color: "#fff",
                        padding: "13px 34px",
                        borderRadius: 8,
                        fontWeight: 500,
                        fontSize: 19,
                        border: "none"
                    }}
                    onClick={handleStartChat}
                    disabled={loading}
                >
                    {loading ? "입장 중..." : "채팅 시작"}
                </button>
                <button
                    style={{
                        marginLeft: 16,
                        marginTop: 36,
                        background: "#eee",
                        color: "#333",
                        padding: "13px 24px",
                        borderRadius: 8,
                        fontWeight: 500,
                        fontSize: 17,
                        border: "none"
                    }}
                    onClick={() => navigate(-1)}
                >
                    목록으로
                </button>
                {errorMsg && <div style={{ color: "red", marginTop: 18 }}>{errorMsg}</div>}
            </div>
        </div>
    );
}
