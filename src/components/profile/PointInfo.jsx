import React from 'react';
import { useNavigate } from 'react-router-dom';

const PointInfo = ({ user }) => {
    const navigate = useNavigate();

    const formatPoint = (point) => {
        return new Intl.NumberFormat('ko-KR').format(point || 0);
    };

    const handleChargePoint = () => {
        navigate('/points');
    };

    const handlePointHistory = () => {
        navigate('/transactions');
    };

    return (
        <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
            }}>
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1a202c',
                    margin: 0
                }}>
                    💰 보유 포인트
                </h3>
            </div>

            <div style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                marginBottom: '16px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: '8px'
                }}>
                    <span style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#38d39f'
                    }}>
                        {formatPoint(user?.point)}
                    </span>
                    <span style={{
                        fontSize: '16px',
                        color: '#6b7280',
                        fontWeight: '500'
                    }}>
                        P
                    </span>
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '12px'
            }}>
                <button
                    onClick={handleChargePoint}
                    style={{
                        flex: 1,
                        backgroundColor: '#38d39f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#2fb88a';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#38d39f';
                    }}
                >
                    포인트 관리
                </button>
                <button
                    onClick={handlePointHistory}
                    style={{
                        flex: 1,
                        backgroundColor: '#fff',
                        color: '#4a5568',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f7fafc';
                        e.target.style.borderColor = '#cbd5e0';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#fff';
                        e.target.style.borderColor = '#e2e8f0';
                    }}
                >
                    거래 내역
                </button>
            </div>
        </div>
    );
};

export default PointInfo;