import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useEffect, useRef, useState } from "react";

const TOSS_CLIENT_KEY = "test_ck_DpexMgkW36NON52AyqKp3GbR5ozO";

function generateRandomOrderId() {
    return "ORDER_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

export default function TossPaymentComponent({
                                                 amount = 50000,
                                                 orderName = "테스트 결제 상품",
                                                 customerName = "홍길동",
                                                 customerEmail = "customer@email.com",
                                                 customerMobilePhone = "01012345678",
                                                 onStart,
                                                 onSuccess,
                                                 onFail,
                                             }) {
    const [isLoading, setIsLoading] = useState(false);
    const paymentRef = useRef(null);
    const [orderId, setOrderId] = useState("");

    useEffect(() => {
        async function init() {
            try {
                const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
                paymentRef.current = tossPayments.payment({ customerKey: customerEmail || "ANONYMOUS" });
            } catch (e) {
                alert("토스 결제 시스템 로드에 실패했습니다. 새로고침 해주세요.");
            }
        }
        init();
    }, [customerEmail]);

    const handlePayment = async () => {
        if (!paymentRef.current) {
            alert("결제 시스템 준비 중입니다.");
            return;
        }
        setIsLoading(true);

        const newOrderId = generateRandomOrderId();
        setOrderId(newOrderId);

        if (onStart) {
            await onStart({ orderId: newOrderId, amount });
        }

        try {
            await paymentRef.current.requestPayment({
                method: "CARD",
                amount: { currency: "KRW", value: amount },
                orderId: newOrderId,
                orderName,
                successUrl: window.location.origin + "/success",
                failUrl: window.location.origin + "/fail",
                customerEmail,
                customerName,
                customerMobilePhone,
                card: {
                    useEscrow: false,
                    flowMode: "DEFAULT",
                    useCardPoint: false,
                    useAppCardOnly: false,
                },
            });
        } catch (error) {
            if (error?.code === "USER_CANCEL") {
                alert("결제가 취소되었습니다.");
                onFail && onFail(error);
            } else {
                alert("결제 요청 오류: " + (error.message || "알 수 없음"));
                onFail && onFail(error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            background: "#f8fafc",
            minHeight: "100vh",
            paddingTop: 40,
        }}>
            <div style={{
                maxWidth: 420,
                margin: "56px auto",
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 12px #0001",
                padding: "42px 0 36px 0"
            }}>
                <h2 style={{
                    textAlign: "center",
                    fontSize: 24,
                    fontWeight: 700,
                    marginBottom: 32,
                    letterSpacing: "-0.5px"
                }}>토스 결제 테스트</h2>
                <div style={{ maxWidth: 310, margin: "0 auto", fontSize: 16 }}>
                    <Row label="결제금액" value={Number(amount).toLocaleString() + " 원"} />
                    <Row label="상품명" value={orderName} />
                    <Row label="고객명" value={customerName} />
                    <Row label="이메일" value={customerEmail} />
                    <Row label="휴대폰" value={customerMobilePhone} />
                </div>
                <button
                    onClick={handlePayment}
                    disabled={isLoading}
                    style={{
                        width: "85%", margin: "30px auto 0", display: "block",
                        padding: "15px 0", borderRadius: 10, fontWeight: 700, fontSize: 18,
                        background: isLoading ? "#B0C4DE" : "#38d39f",
                        color: "#fff", border: "none", boxShadow: "0 1px 6px #38d39f33",
                        transition: "background 0.2s"
                    }}
                >
                    {isLoading ? "결제창 준비 중..." : "결제하기"}
                </button>
                <div style={{
                    marginTop: 30,
                    fontSize: 13,
                    color: "#888",
                    textAlign: "center",
                    letterSpacing: "-0.1px"
                }}>
                    테스트 환경입니다.<br />
                    실제 결제는 발생하지 않습니다.
                </div>
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div style={{
            display: "flex", justifyContent: "space-between", marginBottom: 17,
        }}>
            <span style={{ color: "#777", fontWeight: 500 }}>{label}</span>
            <span style={{ color: "#222", fontWeight: 600 }}>{value}</span>
        </div>
    );
}
