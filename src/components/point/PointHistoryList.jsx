import React from 'react';

export default function PointHistoryList({ history }) {
  if (!history || !history.content || history.content.length === 0) {
    return <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px 0' }}>포인트 변동 내역이 없습니다.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568' }}>날짜</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568' }}>타입</th>
            <th style={{ padding: '12px 16px', textAlign: 'right', color: '#4a5568' }}>금액</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568' }}>상태</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568' }}>설명</th>
          </tr>
        </thead>
        <tbody>
          {history.content.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #edf2f7' }}>
              <td style={{ padding: '12px 16px' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td style={{ padding: '12px 16px' }}>{item.type}</td>
              <td style={{ padding: '12px 16px', textAlign: 'right' }}>{item.price.toLocaleString()}원</td>
              <td style={{ padding: '12px 16px', textAlign: 'left' }}>{item.status}</td>
              <td style={{ padding: '12px 16px', textAlign: 'left' }}>{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
