import React, { useState } from 'react';
import { pointApi } from '../../services/api';
import { ToastManager } from '../../utils/error/errorHandler';
import FormInput from '../ui/FormInput';
import Button from '../ui/Button';

export default function PointRequestForm({ onNewRequest }) {
  const [price, setPrice] = useState('');
  const [type, setType] = useState('CHARGE');
  const [account, setAccount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!price || !account) {
      ToastManager.error('금액과 계좌번호를 모두 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const newData = await pointApi.requestPointFund({ price: Number(price), type, account });
      ToastManager.success('요청이 성공적으로 접수되었습니다.');
      onNewRequest(newData); // 부모 컴포넌트에 새로운 요청 데이터 전달
      setPrice('');
      setAccount('');
    } catch (error) {
      ToastManager.error(error.message || '요청에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="type-select" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>요청 타입</label>
        <select
          id="type-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
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
      <FormInput
        label="금액"
        type="number"
        placeholder="금액을 입력하세요"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <FormInput
        label="계좌번호"
        type="text"
        placeholder="계좌번호를 입력하세요"
        value={account}
        onChange={(e) => setAccount(e.target.value)}
        required
      />
      <Button type="submit" disabled={submitting} loading={submitting} size="large" style={{ width: '100%', marginTop: '1rem' }}>
        {submitting ? '요청 중...' : '요청하기'}
      </Button>
    </form>
  );
}
