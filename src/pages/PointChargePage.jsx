import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import React, { useEffect, useRef, useState } from "react";
import HeaderNav from "../components/layout/HeaderNav";
import { getMyEmailFromJwt } from "../utils/auth/auth";

const TOSS_CLIENT_KEY = "test_ck_DpexMgkW36NON52AyqKp3GbR5ozO";

function generateRandomOrderId() {
    return "ORDER_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

export default function PointChargePage() {
    const [isLoading, setIsLoading] = useState(false);
    const paymentRef = useRef(null);
    const [amount, setAmount] = useState(30000);
    const [selectedAmount, setSelectedAmount] = useState(30000);
    
    const userEmail = getMyEmailFromJwt();
    const orderName = "네불라존 포인트 충전";
    const customerName = userEmail || "사용자";
    const customerEmail = userEmail || "customer@email.com";
    const customerMobilePhone = "01012345678";

    // 미리 정의된 충전 금액 옵션
    const presetAmounts = [
        { value: 10000, label: "1만원" },
        { value: 30000, label: "3만원", popular: true },
        { value: 50000, label: "5만원" },
        { value: 100000, label: "10만원" },
        { value: 200000, label: "20만원" },
        { value: 500000, label: "50만원" }
    ];

    // 토스 결제 초기화
    useEffect(() => {
        async function init() {
            try {
                const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
                paymentRef.current = tossPayments.payment({ customerKey: customerEmail || "ANONYMOUS" });
            } catch {
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
        if (Number(amount) <= 0) {
            alert("충전 금액을 입력해주세요.");
            return;
        }
        if (Number(amount) < 1000) {
            alert("최소 충전 금액은 1,000원입니다.");
            return;
        }
        setIsLoading(true);

        const newOrderId = generateRandomOrderId();

        try {
            await paymentRef.current.requestPayment({
                method: "CARD",
                amount: { currency: "KRW", value: amount },
                orderId: newOrderId,
                orderName,
                successUrl: window.location.origin + "/toss/success",
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
            } else {
                alert("결제 요청 오류: " + (error.message || "알 수 없음"));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setAmount(Number(value));
        setSelectedAmount(null);
    };

    const selectPresetAmount = (presetAmount) => {
        setAmount(presetAmount.value);
        setSelectedAmount(presetAmount.value);
    };

    return (
        <div className="min-h-screen bg-secondary">
            <HeaderNav />
            
            <div className="max-w-2xl mx-auto py-8 px-4">
                {/* 페이지 헤더 */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-4">
                        💰 포인트 충전
                    </h1>
                    <p className="text-lg text-muted">
                        안전하고 빠른 토스페이먼츠로 포인트를 충전하세요
                    </p>
                </div>

                <div className="bg-primary rounded-xl shadow-lg border overflow-hidden">
                    {/* 충전 금액 선택 */}
                    <div className="p-6 border-b border-light">
                        <h2 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
                            💳 충전 금액 선택
                        </h2>
                        
                        {/* 미리 정의된 금액 버튼들 */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            {presetAmounts.map((preset) => (
                                <button
                                    key={preset.value}
                                    onClick={() => selectPresetAmount(preset)}
                                    disabled={isLoading}
                                    className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-md disabled:opacity-50 ${
                                        selectedAmount === preset.value
                                            ? 'border-primary bg-primary-light'
                                            : 'border-light bg-primary hover:border-primary-light'
                                    }`}
                                >
                                    {preset.popular && (
                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                            인기
                                        </div>
                                    )}
                                    <div className="text-xl font-bold text-primary mb-2">
                                        {preset.label}
                                    </div>
                                    <div className="text-sm text-secondary">
                                        {preset.value.toLocaleString()}P 충전
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* 직접 입력 */}
                        <div className="bg-secondary p-4 rounded-lg border">
                            <label className="block text-sm font-medium text-secondary mb-3">
                                💡 직접 입력 (최소 1,000원)
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={amount.toLocaleString()}
                                    onChange={handleAmountChange}
                                    disabled={isLoading}
                                    placeholder="충전할 금액을 입력하세요"
                                    className="w-full px-4 py-3 pr-12 border border-light rounded-lg text-lg font-semibold text-right focus:ring transition-fast disabled:opacity-50"
                                />
                                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted font-medium">
                                    원
                                </span>
                            </div>
                        </div>

                        {/* 충전 요약 */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-primary-light to-blue-50 rounded-lg border border-primary-light">
                            <div className="flex justify-between items-center">
                                <span className="text-base font-medium text-primary">충전 후 획득 포인트</span>
                                <span className="text-xl font-bold text-primary">
                                    {amount.toLocaleString()}P
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 결제 정보 */}
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                            📝 결제 정보
                        </h3>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between py-2">
                                <span className="text-muted">상품명</span>
                                <span className="font-medium text-secondary">{orderName}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-muted">충전 금액</span>
                                <span className="font-bold text-primary text-lg">
                                    {amount.toLocaleString()}원
                                </span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-muted">결제 수단</span>
                                <span className="font-medium text-secondary">신용/체크카드</span>
                            </div>
                        </div>

                        {/* 결제 버튼 */}
                        <button
                            onClick={handlePayment}
                            disabled={isLoading || amount < 1000}
                            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                                isLoading || amount < 1000
                                    ? 'bg-muted text-secondary cursor-not-allowed'
                                    : 'btn-primary hover:shadow-lg'
                            }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                    결제창 준비 중...
                                </span>
                            ) : amount < 1000 ? (
                                "최소 충전 금액은 1,000원입니다"
                            ) : (
                                `💳 ${amount.toLocaleString()}원 결제하기`
                            )}
                        </button>

                        {/* 안내 문구 */}
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2 text-yellow-700">
                                <span className="text-lg">⚠️</span>
                                <div className="text-xs">
                                    <div className="font-medium mb-1">안전한 결제 환경</div>
                                    <div className="text-yellow-600">
                                        현재 테스트 환경으로 실제 결제는 발생하지 않습니다.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}