import React from 'react';
import './TransactionDetail.css';

const TransactionDetail = ({ transaction, onClose }) => {
    if (!transaction) return null;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ko-KR').format(price);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getTransactionMethodText = (method) => {
        switch (method) {
            case 'POINT':
                return '포인트';
            case 'CASH':
                return '현금';
            case 'CARD':
                return '카드';
            default:
                return method;
        }
    };

    const getStatusText = (isSold) => {
        return isSold ? '판매완료' : '구매완료';
    };

    const getStatusClass = (isSold) => {
        return isSold ? 'status-sold' : 'status-purchased';
    };

    return (
        <div className="transaction-detail-overlay" onClick={onClose}>
            <div className="transaction-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="transaction-detail-header">
                    <h2>거래 상세정보</h2>
                    <button className="close-button" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="transaction-detail-content">
                    <div className="detail-section">
                        <h3>거래 정보</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>거래 ID</label>
                                <span>{transaction.txId}</span>
                            </div>
                            <div className="detail-item">
                                <label>거래 상태</label>
                                <span className={`transaction-status ${getStatusClass(transaction.isSold)}`}>
                                    {getStatusText(transaction.isSold)}
                                </span>
                            </div>
                            <div className="detail-item">
                                <label>거래 금액</label>
                                <span className="transaction-price">{formatPrice(transaction.txPrice)}원</span>
                            </div>
                            <div className="detail-item">
                                <label>결제 방법</label>
                                <span>{getTransactionMethodText(transaction.txMethod)}</span>
                            </div>
                            <div className="detail-item">
                                <label>거래 일시</label>
                                <span>{formatDate(transaction.txCreatedAt)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>상품 정보</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>상품 ID</label>
                                <span>{transaction.productId}</span>
                            </div>
                            <div className="detail-item">
                                <label>상품명</label>
                                <span className="product-name">{transaction.productName}</span>
                            </div>
                            <div className="detail-item">
                                <label>상품 등록일</label>
                                <span>{formatDate(transaction.productCreatedAt)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>판매자 정보</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>판매자 ID</label>
                                <span>{transaction.sellerId}</span>
                            </div>
                            <div className="detail-item">
                                <label>판매자 닉네임</label>
                                <span>{transaction.sellerNickname}</span>
                            </div>
                            <div className="detail-item">
                                <label>판매자 이메일</label>
                                <span>{transaction.sellerEmail}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="transaction-detail-footer">
                    <button className="btn-close" onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetail;
