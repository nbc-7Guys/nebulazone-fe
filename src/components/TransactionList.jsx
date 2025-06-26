import React from 'react';
import TransactionListItem from './transaction/TransactionListItem';
import EmptyState from './common/EmptyState';
import './TransactionList.css';

const TransactionList = ({ transactions, loading, onTransactionClick }) => {
    if (loading) {
        return (
            <div className="transaction-list-loading">
                <div className="loading-spinner"></div>
                <p>거래내역을 불러오는 중...</p>
            </div>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <EmptyState
                icon="🛒"
                title="거래내역이 없습니다"
                description="상품을 구매하거나 판매하면 여기에 표시됩니다."
            />
        );
    }

    return (
        <div className="transaction-list">
            <div className="transaction-list-header">
                <h3>거래내역</h3>
                <span className="transaction-count">총 {transactions.length}건</span>
            </div>
            <div className="transaction-list-items">
                {transactions.map((transaction) => (
                    <TransactionListItem
                        key={transaction.txId}
                        transaction={transaction}
                        onClick={() => onTransactionClick(transaction.txId)}
                    />
                ))}
            </div>
        </div>
    );
};

export default TransactionList;
