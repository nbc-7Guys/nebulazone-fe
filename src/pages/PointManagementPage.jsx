import React, { useState, useEffect } from 'react';
import { pointApi } from '../services/api';
import HeaderNav from '../components/layout/HeaderNav';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { ToastManager } from '../utils/error/errorHandler';
import PointRequestForm from '../components/point/PointRequestForm';
import PointRequestList from '../components/point/PointRequestList';
import PointHistoryList from '../components/point/PointHistoryList';
import { Card } from '../components/ui';


export default function PointManagementPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pointRequests, setPointRequests] = useState([]);
  const [pointHistory, setPointHistory] = useState({ content: [], totalPages: 1 });

  useEffect(() => {
    loadPointData();
  }, []); // historyPage 제거

  const loadPointData = async () => {
    try {
      setLoading(true);
      setError('');
      const [requests, history] = await Promise.all([
        pointApi.getMyPointRequests(),
        pointApi.getPointHistory(), // historyPage 제거
      ]);
      setPointRequests(requests);
      setPointHistory(history);
    } catch (error) {
      const errorInfo = ErrorHandler.handleApiError(error);
      setError(errorInfo.message || '포인트 정보를 불러오는데 실패했습니다.');
      ToastManager.error(errorInfo.message || '포인트 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewRequest = (newRequest) => {
    setPointRequests([newRequest, ...pointRequests]);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <HeaderNav />
        <LoadingSpinner message="포인트 정보를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <HeaderNav />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        {error && (
          <ErrorMessage
            message={error}
            onRetry={loadPointData}
            style={{ marginBottom: '24px' }}
          />
        )}
        <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1a202c', marginBottom: '2rem' }}>포인트 관리</h1>

        <Card padding="large" borderRadius="xl" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2d3748', marginBottom: '1.5rem' }}>포인트 충전/환급 요청</h2>
          <PointRequestForm onNewRequest={handleNewRequest} />
        </Card>

        <Card padding="large" borderRadius="xl" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2d3748', marginBottom: '1.5rem' }}>나의 포인트 요청 내역</h2>
          <PointRequestList requests={pointRequests} />
        </Card>

        <Card padding="large" borderRadius="xl">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2d3748', marginBottom: '1.5rem' }}>포인트 사용 내역</h2>
          <PointHistoryList history={pointHistory} />
        </Card>
      </div>
    </div>
  );
}
