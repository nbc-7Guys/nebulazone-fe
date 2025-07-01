import React from 'react';
import Button from '../ui/Button';

export default function AdminPointHistoryTable({ histories, onApprove, onReject }) {
  if (!histories || !histories.content || histories.content.length === 0) {
    return <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px 0' }}>포인트 내역이 없습니다.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568' }}>요청일</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568' }}>이메일</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568' }}>닉네임</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568' }}>타입</th>
            <th style={{ padding: '12px 16px', textAlign: 'right', color: '#4a5568' }}>금액</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568' }}>상태</th>
            <th style={{ padding: '12px 16px', textAlign: 'center', color: '#4a5568' }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {histories.content.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #edf2f7' }}>
              <td style={{ padding: '12px 16px' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td style={{ padding: '12px 16px' }}>{item.email}</td>
              <td style={{ padding: '12px 16px' }}>{item.nickname}</td>
              <td style={{ padding: '12px 16px' }}>{item.type}</td>
              <td style={{ padding: '12px 16px', textAlign: 'right' }}>{item.price.toLocaleString()}</td>
              <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.status}</td>
              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                {item.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <Button size="small" onClick={() => onApprove(Number(item.pointId))}>승인</Button>
                    <Button size="small" variant="danger" onClick={() => onReject(item.pointId )}>거절</Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
