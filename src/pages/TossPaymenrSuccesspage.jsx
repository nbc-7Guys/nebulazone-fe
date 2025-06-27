import React, {useEffect, useState} from "react";
import {ENV} from '../utils/env';
import HeaderNav from "../components/layout/HeaderNav.jsx";

const BASE_URL = ENV.API_BASE_URL;

// 스타일 변수: 재사용/수정 쉽게
const cardStyle = {
    maxWidth: 420,
    margin: "56px auto",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 12px #0001",
    padding: "44px 0 36px 0",
};

const inputStyle = {
    width: "100%",
    fontSize: 16,
    padding: "14px 15px",
    border: "1px solid #eee",
    borderRadius: 8,
    outline: "none",
    background: "#fafbfc",
    marginBottom: 0,
    marginTop: 0,
};

const labelStyle = {color: "#555", fontWeight: 500, marginBottom: 8, display: "block"};

const buttonStyle = isActive => ({
    width: "100%",
    marginTop: 18,
    background: isActive ? "#38d39f" : "#b0b9c2",
    color: "#fff",
    fontWeight: 700,
    fontSize: 17,
    borderRadius: 8,
    border: "none",
    padding: "14px 0",
    boxShadow: "0 1px 8px #38d39f18",
    transition: "background 0.2s",
    cursor: isActive ? "pointer" : "not-allowed",
});

const infoRow = {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start", // 위에 붙임
    marginBottom: 13, fontSize: 15, gap: 8, // label/value 사이 여유
};

function TossPaymentComponent() {
    const [payment, setPayment] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState(1000);
    const [orderName, setOrderName] = useState("테스트 결제");
    const [customerInfo, setCustomerInfo] = useState({
        email: "", name: "", phone: "",
    });

    // SDK 로드
    useEffect(() => {
        const loadTossPayments = () => {
            return new Promise((resolve, reject) => {
                if (window.TossPayments) {
                    resolve(window.TossPayments);
                    return;
                }
                const script = document.createElement("script");
                script.src = "https://js.tosspayments.com/v2/standard";
                script.onload = () => resolve(window.TossPayments);
                script.onerror = reject;
                document.head.appendChild(script);
            });
        };

        loadTossPayments()
            .then(TossPayments => {
                const clientKey = "test_ck_DpexMgkW36NON52AyqKp3GbR5ozO";
                const instance = TossPayments(clientKey);
                const paymentInstance = instance.payment({
                    customerKey: generateCustomerKey(),
                });
                setPayment(paymentInstance);
            })
            .catch(() => {
                alert("결제 시스템 로드 실패. 새로고침해주세요.");
            });
    }, []);

    const generateCustomerKey = () => "customer_" + Math.random().toString(36).slice(2, 11);

    const generateOrderId = () => "ORDER_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

    const requestPayment = async () => {
        if (!payment) return alert("결제 시스템 준비 중입니다.");
        if (!customerInfo.email || !customerInfo.name || !customerInfo.phone) return alert("고객 정보를 모두 입력해주세요.");
        setIsLoading(true);
        try {
            const orderId = generateOrderId();
            await payment.requestPayment({
                method: "CARD",
                amount: {
                    currency: "KRW", value: amount,
                },
                orderId,
                orderName,
                successUrl: window.location.origin + "/success?paymentKey={paymentKey}&orderId=" + orderId + "&amount=" + amount,
                failUrl: window.location.origin + "/fail",
                customerEmail: customerInfo.email,
                customerName: customerInfo.name,
                customerMobilePhone: customerInfo.phone,
            });
        } catch (error) {
            if (error.code === "USER_CANCEL") {
                alert("결제가 취소되었습니다.");
            } else {
                alert("결제 요청 오류: " + (error.message || "알 수 없음"));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (<>
            <HeaderNav/>
            <div style={{background: "#f8fafc", minHeight: "100vh", paddingTop: 40}}>
                <div style={cardStyle}>
                    <h2
                        style={{
                            textAlign: "center", fontSize: 26, fontWeight: 700, marginBottom: 32,
                        }}
                    >
                        토스 결제 테스트
                    </h2>
                    <form
                        style={{maxWidth: 320, margin: "0 auto"}}
                        onSubmit={e => {
                            e.preventDefault();
                            requestPayment();
                        }}
                    >
                        <div style={{marginBottom: 18}}>
                            <label style={labelStyle}>결제 금액(원)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(Number(e.target.value))}
                                min="100"
                                max="10000000"
                                style={inputStyle}
                            />
                        </div>
                        <div style={{marginBottom: 18}}>
                            <label style={labelStyle}>상품명</label>
                            <input
                                type="text"
                                value={orderName}
                                onChange={e => setOrderName(e.target.value)}
                                placeholder="상품명을 입력하세요"
                                style={inputStyle}
                            />
                        </div>
                        <div style={{marginBottom: 18}}>
                            <label style={labelStyle}>이메일</label>
                            <input
                                type="email"
                                value={customerInfo.email}
                                onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})}
                                placeholder="이메일 입력"
                                style={inputStyle}
                            />
                        </div>
                        <div style={{marginBottom: 18}}>
                            <label style={labelStyle}>이름</label>
                            <input
                                type="text"
                                value={customerInfo.name}
                                onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                                placeholder="이름 입력"
                                style={inputStyle}
                            />
                        </div>
                        <div style={{marginBottom: 18}}>
                            <label style={labelStyle}>전화번호</label>
                            <input
                                type="tel"
                                value={customerInfo.phone}
                                onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                                placeholder="01012345678"
                                style={inputStyle}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!payment || isLoading}
                            style={buttonStyle(!!payment && !isLoading)}
                        >
                            {isLoading ? "결제 중..." : "결제하기"}
                        </button>
                    </form>
                    <div
                        style={{
                            marginTop: 26, textAlign: "center", fontSize: 13, color: "#888",
                        }}
                    >
                        <div>테스트 환경입니다. 실제 결제가 발생하지 않습니다.</div>
                        <div>테스트카드: 4242-4242-4242-4242</div>
                    </div>
                </div>
            </div>
        </>);
}

// 결제 성공
function PaymentSuccess() {
    const [paymentInfo, setPaymentInfo] = useState({
        paymentKey: "", orderId: "", amount: "",
    });
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmResult, setConfirmResult] = useState(null);
    const [jwtToken, setJwtToken] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const paymentKey = params.get("paymentKey") || "";
        const orderId = params.get("orderId") || "";
        const amount = params.get("amount") || "";
        const tokenFromStorage = localStorage?.getItem("accessToken") || sessionStorage?.getItem("accessToken");
        setJwtToken(tokenFromStorage || "");
        setPaymentInfo({paymentKey, orderId, amount});
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

    return (<>
            <HeaderNav/>
            <div style={{background: "#f8fafc", minHeight: "100vh", paddingTop: 40}}>
                <div style={{...cardStyle, maxWidth: 500}}>
                    <div style={{textAlign: "center", marginBottom: 22}}>
                        <div
                            style={{
                                width: 54,
                                height: 54,
                                margin: "0 auto 10px",
                                borderRadius: "50%",
                                background: "#eaf8ef",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <svg
                                width={34}
                                height={34}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#38d39f"
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 10 18 4 12"/>
                            </svg>
                        </div>
                        <h2 style={{fontSize: 23, fontWeight: 700, color: "#232"}}>
                            결제 성공
                        </h2>
                        <div style={{color: "#6e7a87", fontSize: 15, marginTop: 2}}>
                            결제가 정상적으로 완료되었습니다.
                        </div>
                    </div>
                    <div style={{marginBottom: 26}}>
                        {/*<div style={infoRow}>*/}
                        {/*    <span style={{color: "#888"}}>Payment Key</span>*/}
                        {/*    <span style={{*/}
                        {/*        fontFamily: "monospace", wordBreak: "break-all", maxWidth: 200,*/}
                        {/*        textAlign: "right", display: "block"*/}
                        {/*    }}>*/}
                        {/*        {paymentInfo.paymentKey}*/}
                        {/*    </span>*/}
                        {/*</div>*/}
            {/*            <div style={infoRow}>*/}
            {/*                <span style={{color: "#888"}}>주문ID</span>*/}
            {/*                <span style={{*/}
            {/*                    fontFamily: "monospace",*/}
            {/*                    wordBreak: "break-all",*/}
            {/*                    maxWidth: 200,*/}
            {/*                    textAlign: "right",*/}
            {/*                    display: "block"*/}
            {/*                }}>*/}
            {/*    {paymentInfo.orderId}*/}
            {/*</span>*/}
            {/*            </div>*/}
                        <div style={infoRow}>
                            <span style={{color: "#888", marginLeft: "30", marginRight: "30"}}>금액</span>
                            <span style={{fontWeight: 700}}>{Number(paymentInfo.amount).toLocaleString()}원</span>
                        </div>
                    </div>
                    <button
                        onClick={handleConfirmPayment}
                        disabled={isConfirming || !jwtToken}
                        style={buttonStyle(jwtToken && !isConfirming)}
                    >
                        {isConfirming ? "승인 처리 중..." : "결제 승인 처리"}
                    </button>
                    {confirmResult && (<div style={{color: "rgb(34, 51, 34)", fontSize: 23, marginTop: 30, fontWeight: 700, textAlign: "center" }}>
                            {confirmResult.success ? "승인이 완료 되었습니다." : "승인이 실패하였습니다."}
                        </div>)}
                    <div style={{marginTop: 24, textAlign: "center"}}>
                        <button
                            onClick={() => (window.location.href = "/")}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#1986F8",
                                fontWeight: 600,
                                fontSize: 15,
                                cursor: "pointer",
                            }}
                        >
                            홈으로
                        </button>
                        <span style={{color: "#bbb", margin: "0 8px"}}>|</span>
                        <button
                            onClick={() => window.history.back()}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#1986F8",
                                fontWeight: 600,
                                fontSize: 15,
                                cursor: "pointer",
                            }}
                        >
                            이전
                        </button>
                    </div>
                </div>
            </div>
        </>);
}

// 결제 실패
function PaymentFail() {
    const [errorInfo, setErrorInfo] = useState({
        code: "", message: "", orderId: "",
    });
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setErrorInfo({
            code: params.get("code") || "",
            message: params.get("message") || "알 수 없는 오류가 발생했습니다.",
            orderId: params.get("orderId") || "",
        });
    }, []);
    return (<>
            <HeaderNav/>
            <div style={{background: "#f8fafc", minHeight: "100vh", paddingTop: 40}}>
                <div style={cardStyle}>
                    <div style={{textAlign: "center", marginBottom: 22}}>
                        <div
                            style={{
                                width: 54,
                                height: 54,
                                margin: "0 auto 10px",
                                borderRadius: "50%",
                                background: "#faeaea",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <svg
                                width={30}
                                height={30}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#e24444"
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </div>
                        <h2 style={{fontSize: 23, fontWeight: 700, color: "#232"}}>
                            결제 실패
                        </h2>
                        <div style={{color: "#7b868f", fontSize: 15, marginTop: 2}}>
                            결제 처리 중 문제가 발생했습니다.
                        </div>
                    </div>
                    <div style={{marginBottom: 20}}>
                        {errorInfo.code && (<div style={infoRow}>
                                <span>오류 코드</span>
                                <span>{errorInfo.code}</span>
                            </div>)}
                        <div style={infoRow}>
                            <span>오류 메시지</span>
                            <span>{errorInfo.message}</span>
                        </div>
                        {errorInfo.orderId && (<div style={infoRow}>
                                <span>주문ID</span>
                                <span>{errorInfo.orderId}</span>
                            </div>)}
                    </div>
                    <button
                        onClick={() => (window.location.href = "/")}
                        style={{
                            ...buttonStyle(true), background: "#1986F8", marginTop: 4, marginBottom: 6,
                        }}
                    >
                        다시 결제하기
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            ...buttonStyle(true), background: "#ececec", color: "#1986F8", fontWeight: 600,
                        }}
                    >
                        이전으로
                    </button>
                </div>
            </div>
        </>

    );
}

// SPA 라우터 없이 동작
const App = () => {
    const [page, setPage] = useState("payment");
    useEffect(() => {
        if (window.location.pathname.includes("success")) setPage("success"); else if (window.location.pathname.includes("fail")) setPage("fail"); else setPage("payment");
    }, []);

    if (page === "success") return <PaymentSuccess/>;
    if (page === "fail") return <PaymentFail/>;
    return <TossPaymentComponent/>;
};

export default App;
