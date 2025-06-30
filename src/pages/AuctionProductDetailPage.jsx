import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auctionApi } from "../services/api";
import HeaderNav from "../components/layout/HeaderNav";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function AuctionProductDetailPage() {
    const { id } = useParams(); // auctionId
    const navigate = useNavigate();

    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchAuction = async () => {
            setLoading(true);
            setErrorMsg("");
            try {
                const data = await auctionApi.getAuction(id);
                setAuction(data);
            } catch (error) {
                console.error(error);
                setErrorMsg("경매 상품 정보를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchAuction();
    }, [id]);

    if (loading) {
        return (
            <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
                <HeaderNav />
                <div style={{
                    maxWidth: 700,
                    margin: "40px auto",
                    background: "#fff",
                    borderRadius: 14,
                    padding: 42,
                    boxShadow: "0 4px 24px #0001",
                    textAlign: "center"
                }}>
                    <LoadingSpinner size="large" message="경매 정보를 불러오는 중..." />
                </div>
            </div>
        );
    }

    if (!auction) {
        return (
            <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
                <HeaderNav />
                <div style={{
                    maxWidth: 700,
                    margin: "40px auto",
                    background: "#fff",
                    borderRadius: 14,
                    padding: 42,
                    boxShadow: "0 4px 24px #0001",
                    textAlign: "center"
                }}>
                    <h2>경매 상품을 찾을 수 없습니다.</h2>
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            marginTop: 18,
                            padding: "10px 24px",
                            borderRadius: 8,
                            background: "#7f56fd",
                            color: "#fff",
                            fontWeight: 500,
                            fontSize: 16,
                            border: "none"
                        }}
                    >
                        메인으로
                    </button>
                </div>
            </div>
        );
    }

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
                {/* 경매 라벨 */}
                <div style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    backgroundColor: "#7f56fd",
                    color: "white",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    marginBottom: "12px"
                }}>
                    경매
                </div>

                {/* 이미지 렌더링 */}
                {auction.productImageUrl ? (
                    <img
                        src={auction.productImageUrl}
                        alt={auction.productName}
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
                    {auction.productName}
                </div>
                <div style={{ margin: "10px 0 18px 0", color: "#888", fontSize: 16 }}>
                    판매자: {auction.sellerNickname}
                </div>
                <div style={{ color: "#222", fontSize: 18 }}>
                    시작가: {auction.startPrice.toLocaleString()}원
                </div>
                <div style={{ color: "#111", fontSize: 20, fontWeight: 600, marginTop: 6 }}>
                    현재가: {auction.currentPrice ? `${auction.currentPrice.toLocaleString()}원` : "아직 입찰 없음"}
                </div>
                <div style={{ fontSize: 16, marginTop: 10, color: "#555" }}>
                    마감 시간: {auction.endTime}
                </div>
                <div style={{ fontSize: 16, color: "#999", marginTop: 8 }}>
                    입찰 수: {auction.bidCount}회
                </div>

                {/* 버튼 */}
                <div style={{ marginTop: 36 }}>
                    <button
                        style={{
                            background: "#7f56fd",
                            color: "#fff",
                            padding: "13px 34px",
                            borderRadius: 8,
                            fontWeight: 500,
                            fontSize: 18,
                            border: "none"
                        }}
                        disabled
                    >
                        입찰 기능 준비 중
                    </button>
                    <button
                        style={{
                            marginLeft: 16,
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
                </div>

                {/* 에러 메시지 */}
                {errorMsg && <div style={{ color: "red", marginTop: 18 }}>{errorMsg}</div>}
            </div>
        </div>
    );
}
