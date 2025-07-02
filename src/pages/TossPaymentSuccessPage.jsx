import React, {useEffect, useState} from "react";
import {ENV} from '../utils/env';
import HeaderNav from "../components/layout/HeaderNav.jsx";

const BASE_URL = ENV.API_BASE_URL;

// 결제 성공 페이지 전용 컴포넌트
function PaymentSuccess() {
    const [paymentInfo, setPaymentInfo] = useState({
        paymentKey: "", orderId: "", amount: "",
    });
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmResult, setConfirmResult] = useState(null);
    const [jwtToken, setJwtToken] = useState("");
    const [showAnimation, setShowAnimation] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const paymentKey = params.get("paymentKey") || "";
        const orderId = params.get("orderId") || "";
        const amount = params.get("amount") || "";
        const tokenFromStorage = localStorage?.getItem("accessToken") || sessionStorage?.getItem("accessToken");
        setJwtToken(tokenFromStorage || "");
        setPaymentInfo({paymentKey, orderId, amount});
        
        // 애니메이션 효과
        setTimeout(() => setShowAnimation(true), 300);
    }, []);

    const handleConfirmPayment = async () => {
        if (!paymentInfo.paymentKey || !paymentInfo.orderId || !paymentInfo.amount) return alert("결제 정보가 없습니다.");
        if (!jwtToken) return alert("로그인이 필요합니다.");
        setIsConfirming(true);
        setConfirmResult(null);
        try {
            const response = await fetch(`${BASE_URL}/payments/confirm/toss`, {
                method: "POST", headers: {
                    "Content-Type": "application/json", Authorization: `Bearer ${jwtToken}`,
                }, body: JSON.stringify({
                    paymentKey: paymentInfo.paymentKey, orderId: paymentInfo.orderId, point: Number(paymentInfo.amount),
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setConfirmResult({success: true, data});
                // 결제 완료 후 3초 뒤 메인페이지로 이동
                setTimeout(() => {
                    window.location.href = "/";
                }, 3000);
            } else {
                throw new Error(data.message || "결제 승인 실패");
            }
        } catch (error) {
            setConfirmResult({success: false, error: error.message});
            if (error.message.includes("인증")) {
                localStorage?.removeItem("accessToken");
                sessionStorage?.removeItem("accessToken");
                setJwtToken("");
            }
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <>
            <HeaderNav/>
            <div style={{
                background: "linear-gradient(135deg, #38d39f 0%, #2eb888 100%)",
                minHeight: "100vh",
                padding: "60px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <div style={{
                    background: "#fff",
                    borderRadius: "24px",
                    padding: "48px 40px",
                    maxWidth: "520px",
                    width: "100%",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                    transform: showAnimation ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
                    opacity: showAnimation ? 1 : 0,
                    transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
                }}>
                    {/* 성공 아이콘과 타이틀 */}
                    <div style={{textAlign: "center", marginBottom: 40}}>
                        <div style={{
                            width: 80,
                            height: 80,
                            margin: "0 auto 20px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #38d39f 0%, #2eb888 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            animation: showAnimation ? "pulse 2s infinite" : "none"
                        }}>
                            <svg
                                width={44}
                                height={44}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#fff"
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </div>
                        <h1 style={{
                            fontSize: "28px",
                            fontWeight: "700",
                            color: "#1a202c",
                            margin: "0 0 12px 0",
                            letterSpacing: "-0.5px"
                        }}>
                            🎉 결제 완료!
                        </h1>
                        <p style={{
                            color: "#64748b",
                            fontSize: "16px",
                            margin: 0,
                            lineHeight: "1.5"
                        }}>
                            포인트 충전이 성공적으로 완료되었습니다
                        </p>
                    </div>

                    {/* 결제 정보 카드 */}
                    <div style={{
                        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                        borderRadius: "16px",
                        padding: "24px",
                        marginBottom: 32,
                        border: "1px solid #e2e8f0"
                    }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 12
                        }}>
                            <span style={{
                                color: "#64748b",
                                fontSize: "14px",
                                fontWeight: "500"
                            }}>충전 금액</span>
                            <div style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: "4px"
                            }}>
                                <span style={{
                                    fontSize: "24px",
                                    fontWeight: "700",
                                    color: "#1a202c"
                                }}>
                                    {Number(paymentInfo.amount).toLocaleString()}
                                </span>
                                <span style={{
                                    fontSize: "16px",
                                    color: "#64748b",
                                    fontWeight: "500"
                                }}>원</span>
                            </div>
                        </div>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}>
                            <span style={{
                                color: "#64748b",
                                fontSize: "14px",
                                fontWeight: "500"
                            }}>획득 포인트</span>
                            <div style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: "4px"
                            }}>
                                <span style={{
                                    fontSize: "24px",
                                    fontWeight: "700",
                                    color: "#38d39f"
                                }}>
                                    +{Number(paymentInfo.amount).toLocaleString()}
                                </span>
                                <span style={{
                                    fontSize: "16px",
                                    color: "#64748b",
                                    fontWeight: "500"
                                }}>P</span>
                            </div>
                        </div>
                    </div>

                    {/* 결제 마무리 버튼 또는 메인페이지 이동 버튼 */}
                    {confirmResult && confirmResult.success ? (
                        <button
                            onClick={() => (window.location.href = "/")}
                            style={{
                                width: "100%",
                                padding: "16px 24px",
                                background: "linear-gradient(135deg, #38d39f 0%, #2eb888 100%)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 20px rgba(56, 211, 159, 0.4)"
                            }}
                        >
                            🏠 메인페이지로 가기
                        </button>
                    ) : (
                        <button
                            onClick={handleConfirmPayment}
                            disabled={isConfirming || !jwtToken}
                            style={{
                                width: "100%",
                                padding: "16px 24px",
                                background: (jwtToken && !isConfirming) ? "linear-gradient(135deg, #38d39f 0%, #2eb888 100%)" : "#cbd5e0",
                                color: "#fff",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: (jwtToken && !isConfirming) ? "pointer" : "not-allowed",
                                transition: "all 0.3s ease",
                                boxShadow: (jwtToken && !isConfirming) ? "0 4px 20px rgba(56, 211, 159, 0.4)" : "none",
                                transform: isConfirming ? "scale(0.98)" : "scale(1)"
                            }}
                        >
                            {isConfirming ? (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <div style={{
                                        width: "16px",
                                        height: "16px",
                                        border: "2px solid #fff",
                                        borderTop: "2px solid transparent",
                                        borderRadius: "50%",
                                        animation: "spin 1s linear infinite"
                                    }}></div>
                                    처리 중...
                                </div>
                            ) : "💫 결제 마무리하기"}
                        </button>
                    )}

                    {/* 결과 메시지 */}
                    {confirmResult && (
                        <div style={{
                            marginTop: 24,
                            padding: "20px",
                            borderRadius: "12px",
                            textAlign: "center",
                            background: confirmResult.success ? "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)" : "linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)",
                            border: `1px solid ${confirmResult.success ? "#c3e6cb" : "#f5c6cb"}`
                        }}>
                            <div style={{
                                fontSize: "18px",
                                fontWeight: "600",
                                color: confirmResult.success ? "#155724" : "#721c24",
                                marginBottom: "8px"
                            }}>
                                {confirmResult.success ? "🎉 포인트 충전 완료!" : "❌ 처리 실패"}
                            </div>
                            <div style={{
                                fontSize: "14px",
                                color: confirmResult.success ? "#155724" : "#721c24",
                                opacity: 0.8
                            }}>
                                {confirmResult.success ? "포인트가 성공적으로 충전되었습니다. 3초 후 메인페이지로 이동합니다." : "다시 시도해주세요."}
                            </div>
                        </div>
                    )}

                    {/* 하단 버튼들 */}
                    <div style={{
                        marginTop: 32,
                        display: "flex",
                        gap: "12px",
                        justifyContent: "center"
                    }}>
                        <button
                            onClick={() => (window.location.href = "/points")}
                            style={{
                                padding: "12px 24px",
                                background: "#fff",
                                border: "2px solid #38d39f",
                                color: "#38d39f",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "#38d39f";
                                e.target.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "#fff";
                                e.target.style.color = "#38d39f";
                            }}
                        >
                            💰 포인트 관리
                        </button>
                        <button
                            onClick={() => (window.location.href = "/")}
                            style={{
                                padding: "12px 24px",
                                background: "#f8fafc",
                                border: "2px solid #e2e8f0",
                                color: "#64748b",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "#e2e8f0";
                                e.target.style.color = "#475569";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "#f8fafc";
                                e.target.style.color = "#64748b";
                            }}
                        >
                            🏠 홈으로
                        </button>
                    </div>
                </div>
                
                {/* CSS 애니메이션 */}
                <style>{`
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </>
    );
}

export default PaymentSuccess;