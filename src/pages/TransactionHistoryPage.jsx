import React, { useState, useEffect } from 'react';
import { transactionApi } from '../services/api';
import TransactionList from '../components/transaction/TransactionList';
import TransactionDetail from '../components/transaction/TransactionDetail';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import HeaderNav from '../components/layout/HeaderNav';
import './TransactionHistoryPage.css';

const TransactionHistoryPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [pageInfo, setPageInfo] = useState({
        page: 1,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
        isFirst: true,
        isLast: true
    });
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState(null);

    // 거래내역 목록 조회
    const fetchTransactions = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await transactionApi.getMyTransactions(page, pageInfo.size);
            
            setTransactions(response.content);
            setPageInfo({
                page: response.page,
                size: response.size,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
                hasNext: response.hasNext,
                hasPrevious: response.hasPrevious,
                isFirst: response.isFirst,
                isLast: response.isLast
            });
        } catch (err) {
            console.error('거래내역 조회 실패:', err);
            setError(err.message || '거래내역을 불러오는데 실패했습니다.');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    // 거래 상세 정보 조회
    const fetchTransactionDetail = async (transactionId) => {
        try {
            setDetailLoading(true);
            const response = await transactionApi.getMyTransaction(transactionId);
            setSelectedTransaction(response);
        } catch (err) {
            console.error('거래 상세 조회 실패:', err);
            setError(err.message || '거래 상세정보를 불러오는데 실패했습니다.');
        } finally {
            setDetailLoading(false);
        }
    };

    // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        fetchTransactions(newPage);
    };

    // 거래 클릭 핸들러
    const handleTransactionClick = (transactionId) => {
        fetchTransactionDetail(transactionId);
    };

    // 상세 모달 닫기
    const handleCloseDetail = () => {
        setSelectedTransaction(null);
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchTransactions();
    }, []);

    return (
        <div className="transaction-history-page">
            <HeaderNav />
            <div className="transaction-history-container">
                <div className="page-header">
                    <div className="header-content">
                        <div className="header-text">
                            <h1>💳 거래내역</h1>
                            <p>나의 모든 구매 및 판매 내역을 확인할 수 있습니다</p>
                        </div>
                        <div className="header-stats">
                            <div className="stat-card">
                                <div className="stat-icon">📊</div>
                                <div className="stat-info">
                                    <span className="stat-value">{pageInfo.totalElements}</span>
                                    <span className="stat-label">총 거래</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="error-container">
                        <ErrorMessage 
                            message={error} 
                            onRetry={() => fetchTransactions(pageInfo.page)}
                        />
                    </div>
                )}

                <div className="content-wrapper">
                    <TransactionList
                        transactions={transactions}
                        loading={loading}
                        onTransactionClick={handleTransactionClick}
                    />

                    {!loading && transactions.length > 0 && (
                        <div className="pagination-wrapper">
                            <Pagination
                                currentPage={pageInfo.page}
                                totalPages={pageInfo.totalPages}
                                hasNext={pageInfo.hasNext}
                                hasPrevious={pageInfo.hasPrevious}
                                isFirst={pageInfo.isFirst}
                                isLast={pageInfo.isLast}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>

                {selectedTransaction && (
                    <TransactionDetail
                        transaction={selectedTransaction}
                        onClose={handleCloseDetail}
                    />
                )}

                {detailLoading && (
                    <div className="detail-loading-overlay">
                        <div className="loading-container">
                            <LoadingSpinner />
                            <p>거래 상세정보를 불러오는 중...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistoryPage;
