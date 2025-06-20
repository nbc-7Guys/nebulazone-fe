import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {productApi} from "../services/api.js";
import HeaderNav from "../components/HeaderNav";
import { JwtManager } from "../utils/JwtManager";
import { ENV } from "../utils/env";

export default function DirectProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const productType = location.pathname.includes('/auction/') ? 'AUCTION' : 'DIRECT';

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

// URL에서 catalogId 파라미터 추출
    const queryParams = new URLSearchParams(location.search);
    const catalogId = queryParams.get('catalogId');

    useEffect(() => {
        if (!catalogId || !id) return;

        const fetchProduct = async () => {
            setLoading(true);
            setErrorMsg("");
            try {
                const data = await productApi.getProduct(catalogId, id);
                setProduct(data);
            } catch (error) {
                setErrorMsg("상품 정보를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [catalogId, id]);


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
        console.log(product)
        setLoading(true);
        setErrorMsg("");
        try {
            const response = await axios.post(`${ENV.API_BASE_URL}/chat/rooms`, 
                { productId: product.productId },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + JwtManager.getJwt(),
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
                {/* 상품 유형 표시 */}
                <div style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    backgroundColor: product.productTxMethod === 'AUCTION' ? "#7f56fd" : "#38d39f",
                    color: "white",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    marginBottom: "12px"
                }}>
                    {product.productTxMethod === 'AUCTION' ? '경매' : '직거래'}
                </div>

                {/* 이미지 렌더링 */}
                {product.productImageUrls.length > 0 ? (
                    <img
                        src={product.productImageUrls[0]}
                        alt={product.productName}
                        style={{ width: "100%", borderRadius: 12, maxHeight: 340, objectFit: "cover" }}
                    />
                ) : (
                    <div style={{
                        width: "100%", height: 280, background: "#ddd",
                        borderRadius: 12, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 16, color: "#666"
                    }}>
                        이미지 없음
                    </div>
                )}

                {/* 상품 정보 */}
                <div style={{ marginTop: 26, fontSize: 27, fontWeight: 700 }}>
                    {product.productName}
                </div>
                <div style={{ margin: "10px 0 18px 0", color: "#888", fontSize: 16 }}>
                    거래 방식: {product.productTxMethod === 'AUCTION' ? '경매' : '직거래'}
                </div>
                <div style={{ color: "#222", fontSize: 18 }}>
                    {product.productDescription}
                </div>
                <div style={{ color: "#111", fontSize: 22, fontWeight: 600, marginTop: 14 }}>
                    가격: {product.productPrice.toLocaleString()}원
                </div>

                {/* 버튼들 */}
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

                {/* 에러 메시지 */}
                {errorMsg && <div style={{ color: "red", marginTop: 18 }}>{errorMsg}</div>}
            </div>
        </div>
    );

}
