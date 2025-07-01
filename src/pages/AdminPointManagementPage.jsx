import React, { useState, useEffect } from 'react';
import { pointApi } from '../services/api';
import HeaderNav from '../components/layout/HeaderNav';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { ToastManager } from '../utils/error/errorHandler';
import AdminPointSearchForm from '../components/point/AdminPointSearchForm';
import AdminPointHistoryTable from '../components/point/AdminPointHistoryTable';
import Card from '../components/ui/Card';

export default function AdminPointManagementPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pointHistories, setPointHistories] = useState({ content: [], totalPages: 1 });
  const [searchParams, setSearchParams] = useState({
    email: '',
    nickname: '',
    type: '',
    status: '',
    startDate: '',
    endDate: '',
    // page: 1, // 페이징 제거
    size: 20,
  });

  useEffect(() => {
    loadPointHistories();
  }, [searchParams]); // searchParams 전체를 의존성으로 추가하여 검색 조건 변경 시 재로드

  const loadPointHistories = async () => {
    try {
      setLoading(true);
      setError('');
      const histories = await pointApi.adminGetPointHistories(searchParams);
      setPointHistories(histories);
    } catch (error) {
      const errorInfo = ErrorHandler.handleApiError(error);
      setError(errorInfo.message || '포인트 내역을 불러오는데 실패했습니다.');
      ToastManager.error(errorInfo.message || '포인트 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ ...searchParams, page: 1 });
    loadPointHistories();
  };

  const handleApprove = async (id) => {
    try {
      await pointApi.adminApprovePointRequest(id);
      ToastManager.success('요청이 승인되었습니다.');
      loadPointHistories();
    } catch (error) {
      ToastManager.error(error.message || '승인에 실패했습니다.');
    }
  };

  const handleReject = async (id) => {
    try {
      await pointApi.adminRejectPointRequest(id);
      ToastManager.success('요청이 거절되었습니다.');
      loadPointHistories();
    } catch (error) {
      ToastManager.error(error.message || '거절에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <HeaderNav />
        <LoadingSpinner message="포인트 내역을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <HeaderNav />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {error && (
          <ErrorMessage
            message={error}
            onRetry={loadPointHistories}
            style={{ marginBottom: '24px' }}
          />
        )}
        <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1a202c', marginBottom: '2rem' }}>어드민 - 포인트 관리</h1>

        <Card padding="large" borderRadius="xl" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2d3748', marginBottom: '1.5rem' }}>포인트 내역 검색</h2>
          <AdminPointSearchForm
            params={searchParams}
            setParams={setSearchParams}
            onSearch={handleSearch}
          />
        </Card>

        <Card padding="large" borderRadius="xl">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2d3748', marginBottom: '1.5rem' }}>포인트 요청 목록</h2>
          <AdminPointHistoryTable
            histories={pointHistories}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </Card>
      </div>
    </div>
  );
}
