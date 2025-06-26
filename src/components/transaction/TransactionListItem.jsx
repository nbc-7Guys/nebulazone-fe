import React from 'react';
import './TransactionListItem.css';

const TransactionListItem = ({ transaction, onClick }) => {
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
            minute: '2-digit'
        });
    };

    const getTransactionMethodText = (method) => {
        switch (method) {
            case 'DIRECT':
                return '즉시 거래';
            case 'AUCTION':
                return '경매';
            default:
                return method;
        }
    };

    const getStatusText = (userType) => {
        return userType === 'SELLER' ? '판매완료' : '구매완료';
    };

    const getStatusClass = (userType) => {
        return userType === 'SELLER' ? 'status-sold' : 'status-purchased';
    };

    // 현재 사용자가 판매자인지 확인 (userType 기준)
    const isCurrentUserSeller = () => {
        return transaction.userType === 'SELLER';
    };

    return (
        <div className="transaction-item" onClick={onClick}>
            <div className="transaction-item-content">
                <div className="transaction-main-info">
                    <div className="transaction-product">
                        <h4 className="product-name">{transaction.productName}</h4>
                        <span className={`transaction-status ${getStatusClass(transaction.userType)}`}>
                            {getStatusText(transaction.userType)}
                        </span>
                        {transaction.userType === 'BUYER' && transaction.userNickname && (
                            <span className="transaction-seller">
                                판매자: {transaction.userNickname}
                            </span>
                        )}
                    </div>
                    <div className="transaction-details">
                        <span className="transaction-price">
                            {formatPrice(transaction.txPrice)}원
                        </span>
                        <span className="transaction-method">
                            {getTransactionMethodText(transaction.txMethod)}
                        </span>
                    </div>
                </div>
                <div className="transaction-meta">
                    <span className="transaction-date">
                        {formatDate(transaction.txCreatedAt)}
                    </span>
                    <div className="transaction-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionListItem;
