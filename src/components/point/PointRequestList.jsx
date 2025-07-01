import React from 'react';

export default function PointRequestList({ requests }) {
  if (!requests || requests.length === 0) {
    return <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px 0' }}>포인트 요청 내역이 없습니다.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568' }}>요청일</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568' }}>타입</th>
            <th style={{ padding: '12px 16px', textAlign: 'right', color: '#4a5568' }}>금액</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568' }}>상태</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id} style={{ borderBottom: '1px solid #edf2f7' }}>
              <td style={{ padding: '12px 16px' }}>{new Date(req.createdAt).toLocaleDateString()}</td>
              <td style={{ padding: '12px 16px' }}>{req.type === 'CHARGE' ? '충전' : '환급'}</td>
              <td style={{ padding: '12px 16px', textAlign: 'right' }}>{req.price.toLocaleString()}원</td>
              <td style={{ padding: '12px 16px' }}>{req.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
