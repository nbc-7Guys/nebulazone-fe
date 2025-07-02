import React, { useState, useRef, useEffect } from 'react';
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { pointApi } from '../../services/api';
import { ToastManager } from '../../utils/error/errorHandler';
import { getMyEmailFromJwt } from '../../utils/auth/auth';
import FormInput from '../ui/FormInput';
import Button from '../ui/Button';

const TOSS_CLIENT_KEY = "test_ck_DpexMgkW36NON52AyqKp3GbR5ozO";

function generateRandomOrderId() {
  return "ORDER_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

export default function PointRequestForm({ onNewRequest }) {
  const [price, setPrice] = useState('');
  const [type, setType] = useState('CHARGE');
  const [chargeMethod, setChargeMethod] = useState('BANK_TRANSFER'); // 충전 방식: TOSS, BANK_TRANSFER
  const [account, setAccount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const paymentRef = useRef(null);

  const userEmail = getMyEmailFromJwt();

  // 토스 결제 초기화
  useEffect(() => {
    if (type === 'CHARGE' && chargeMethod === 'TOSS') {
      async function init() {
        try {
          const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
          paymentRef.current = tossPayments.payment({ 
            customerKey: userEmail || "ANONYMOUS" 
          });
        } catch {
          ToastManager.error("토스 결제 시스템 로드에 실패했습니다.");
        }
      }
      init();
    }
  }, [type, chargeMethod, userEmail]);

  const handleTossPayment = async () => {
    if (!paymentRef.current) {
      ToastManager.error("결제 시스템 준비 중입니다.");
      return;
    }
    if (!price || Number(price) < 1000) {
      ToastManager.error("최소 충전 금액은 1,000원입니다.");
      return;
    }

    setSubmitting(true);
    const newOrderId = generateRandomOrderId();

    try {
      await paymentRef.current.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: Number(price) },
        orderId: newOrderId,
        orderName: "네불라존 포인트 충전",
        successUrl: window.location.origin + "/toss/success",
        failUrl: window.location.origin + "/fail",
        customerEmail: userEmail || "customer@email.com",
        customerName: userEmail || "사용자",
        customerMobilePhone: "01012345678",
        card: {
          useEscrow: false,
          flowMode: "DEFAULT",
          useCardPoint: false,
          useAppCardOnly: false,
        },
      });
    } catch (error) {
      if (error?.code === "USER_CANCEL") {
        ToastManager.error("결제가 취소되었습니다.");
      } else {
        ToastManager.error("결제 요청 오류: " + (error.message || "알 수 없음"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBankTransferSubmit = async (e) => {
    e.preventDefault();
    if (!price || !account) {
      ToastManager.error('금액과 계좌번호를 모두 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const newData = await pointApi.requestPointFund({ 
        price: Number(price), 
        type, 
        account 
      });
      ToastManager.success('요청이 성공적으로 접수되었습니다.');
      onNewRequest(newData);
      setPrice('');
      setAccount('');
    } catch (error) {
      ToastManager.error(error.message || '요청에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 충전이고 토스 결제인 경우
    if (type === 'CHARGE' && chargeMethod === 'TOSS') {
      await handleTossPayment();
      return;
    }
    
    // 환전이거나 계좌이체 충전인 경우
    await handleBankTransferSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="type-select" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>요청 타입</label>
        <select
          id="type-select"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            // 타입이 변경되면 충전 방식을 기본값으로 리셋
            if (e.target.value === 'CHARGE') {
              setChargeMethod('BANK_TRANSFER');
            }
          }}
          style={{
            width: '100%',
            fontSize: '16px',
            padding: '12px 16px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            outline: 'none',
            backgroundColor: '#fff',
            color: '#1a202c',
            transition: 'border-color 0.2s ease',
            boxSizing: 'border-box',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fillRule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clipRule='evenodd' /%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem'
          }}
        >
          <option value="CHARGE">충전</option>
          <option value="EXCHANGE">환전</option>
        </select>
      </div>

      {/* 충전 방식 선택 (충전일 때만 표시) */}
      {type === 'CHARGE' && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>충전 방식</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px 16px', 
              border: `2px solid ${chargeMethod === 'BANK_TRANSFER' ? '#3b82f6' : '#e5e7eb'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: chargeMethod === 'BANK_TRANSFER' ? '#eff6ff' : '#fff',
              flex: 1,
              transition: 'all 0.2s ease'
            }}>
              <input
                type="radio"
                name="chargeMethod"
                value="BANK_TRANSFER"
                checked={chargeMethod === 'BANK_TRANSFER'}
                onChange={(e) => setChargeMethod(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              <div>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>🏦 계좌이체</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>관리자 승인 필요</div>
              </div>
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px 16px', 
              border: `2px solid ${chargeMethod === 'TOSS' ? '#3b82f6' : '#e5e7eb'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: chargeMethod === 'TOSS' ? '#eff6ff' : '#fff',
              flex: 1,
              transition: 'all 0.2s ease'
            }}>
              <input
                type="radio"
                name="chargeMethod"
                value="TOSS"
                checked={chargeMethod === 'TOSS'}
                onChange={(e) => setChargeMethod(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              <div>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>💳 토스결제</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>즉시 충전</div>
              </div>
            </label>
          </div>
        </div>
      )}
      <FormInput
        label="금액"
        type="number"
        placeholder={type === 'CHARGE' && chargeMethod === 'TOSS' ? "최소 1,000원" : "금액을 입력하세요"}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      
      {/* 계좌번호는 환전이거나 계좌이체 충전일 때만 표시 */}
      {(type === 'EXCHANGE' || (type === 'CHARGE' && chargeMethod === 'BANK_TRANSFER')) && (
        <FormInput
          label="계좌번호"
          type="text"
          placeholder="계좌번호를 입력하세요"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          required
        />
      )}
      
      <Button 
        type="submit" 
        disabled={submitting} 
        loading={submitting} 
        size="large" 
        style={{ width: '100%', marginTop: '1rem' }}
      >
        {submitting ? '처리 중...' : (
          type === 'CHARGE' && chargeMethod === 'TOSS' 
            ? `💳 ${price ? Number(price).toLocaleString() : '0'}원 결제하기`
            : type === 'CHARGE' 
              ? '충전 요청하기'
              : '환전 요청하기'
        )}
      </Button>
    </form>
  );
}
