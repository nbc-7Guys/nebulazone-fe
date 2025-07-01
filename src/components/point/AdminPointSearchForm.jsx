import React from 'react';
import FormInput from '../ui/FormInput';
import Button from '../ui/Button';

export default function AdminPointSearchForm({ params, setParams, onSearch }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={onSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
      <FormInput
        type="text"
        name="email"
        label="이메일"
        placeholder="이메일"
        value={params.email}
        onChange={handleChange}
      />
      <FormInput
        type="text"
        name="nickname"
        label="닉네임"
        placeholder="닉네임"
        value={params.nickname}
        onChange={handleChange}
      />
      <div>
        <label htmlFor="type-select" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>타입</label>
        <select
          id="type-select"
          name="type"
          value={params.type}
          onChange={handleChange}
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
          <option value="">전체</option>
          <option value="CHARGE">충전</option>
          <option value="EXCHANGE">환전</option>
        </select>
      </div>
      <div>
        <label htmlFor="status-select" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>상태</label>
        <select
          id="status-select"
          name="status"
          value={params.status}
          onChange={handleChange}
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
          <option value="">전체</option>
          <option value="PENDING">대기중</option>
          <option value="ACCEPT">승인</option>
          <option value="REJECT">거절</option>
        </select>
      </div>
      <Button type="submit" size="large" style={{ gridColumn: '1 / span all', marginTop: '1.5rem' }}>검색</Button>
    </form>
  );
}
