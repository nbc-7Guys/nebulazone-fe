import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bidApi } from '../services/api';
import HeaderNav from '../components/layout/HeaderNav';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ErrorHandler, ToastManager } from '../utils/error/errorHandler';
import { JwtManager } from '../services/managers/JwtManager';

export default function MyBidsPage() {
    const navigate = useNavigate();
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // 로그인 확인
    useEffect(() => {
        const jwt = JwtManager.getJwt();
        if (!jwt) {
            navigate('/login');
            return;
        }
        loadMyBids();
    }, [navigate]);

    // 내 입찰 내역 조회
    const loadMyBids = async (pageNum = 1, reset = false) => {
        try {
            if (pageNum === 1) {
                setLoading(true);
                setError('');
            } else {
                setLoadingMore(true);
            }

            const response = await bidApi.getMyBids(pageNum, 15);
            
            if (reset || pageNum === 1) {
                setBids(response.content || response.bids || []);
            } else {
                setBids(prev => [...prev, ...(response.content || response.bids || [])]);
            }
            
            setHasMore(response.hasNext || false);
            setPage(pageNum);
        } catch (error) {
            console.error('입찰 내역 조회 실패:', error);
            const errorInfo = ErrorHandler.handleApiError(error);
            setError(errorInfo.message || '입찰 내역을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // 더 보기
    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            loadMyBids(page + 1);
        }
    };

    // 입찰 상태 표시
    const getBidStatusBadge = (status) => {
        const statusMap = {
            'BID': { text: '입찰중', color: '#3182ce', bgColor: '#e6f3ff' },
            'WON': { text: '낙찰', color: '#38a169', bgColor: '#e6fffa' },
            'CANCELLED': { text: '취소됨', color: '#e53e3e', bgColor: '#fff5f5' },
            'FAILED': { text: '유찰', color: '#a0aec0', bgColor: '#f7fafc' }
        };
        
        const statusInfo = statusMap[status] || { text: status || '알 수 없음', color: '#718096', bgColor: '#f7fafc' };
        
        return (
            <span style={{
                display: 'inline-block',
                padding: '6px 12px',
                backgroundColor: statusInfo.bgColor,
                color: statusInfo.color,
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '600'
            }}>
                {statusInfo.text}
            </span>
        );
    };

    // 경매 상세 페이지로 이동
    const handleAuctionClick = (auctionId) => {
        navigate(`/products/auction/${auctionId}`);
    };

    if (loading) {
        return (
            <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
                <HeaderNav />
                <div style={{
                    maxWidth: 800,
                    margin: "40px auto",
                    background: "#fff",
                    borderRadius: 14,
                    padding: 42,
                    boxShadow: "0 4px 24px #0001",
                    textAlign: "center"
                }}>
                    <LoadingSpinner size="large" message="입찰 내역을 불러오는 중..." />
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <HeaderNav />
            <div style={{
                maxWidth: 800,
                margin: "40px auto",
                padding: "0 20px"
            }}>
                {/* 헤더 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '24px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: '#1a202c',
                            margin: '0 0 8px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            🏷️ 내 입찰 내역
                        </h1>
                        <p style={{
                            fontSize: '16px',
                            color: '#718096',
                            margin: 0
                        }}>
                            참여한 경매의 입찰 내역을 확인할 수 있습니다
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/mypage')}
                        style={{
                            padding: '12px 20px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#4a5568',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#e2e8f0';
                            e.target.style.borderColor = '#cbd5e0';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#f8fafc';
                            e.target.style.borderColor = '#e2e8f0';
                        }}
                    >
                        ← 마이페이지
                    </button>
                </div>

                {/* 에러 상태 */}
                {error && (
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        padding: '40px',
                        marginBottom: '24px',
                        border: '1px solid #fed7d7',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <div style={{
                            color: '#e53e3e',
                            fontSize: '18px',
                            fontWeight: '600',
                            marginBottom: '8px'
                        }}>
                            데이터를 불러올 수 없습니다
                        </div>
                        <div style={{
                            color: '#a0aec0',
                            fontSize: '14px',
                            marginBottom: '20px'
                        }}>
                            {error}
                        </div>
                        <button
                            onClick={() => loadMyBids(1, true)}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#3182ce',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#2c5aa0';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#3182ce';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            다시 시도
                        </button>
                    </div>
                )}

                {/* 입찰 내역 목록 */}
                {!error && (
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid #e2e8f0'
                    }}>
                        {/* 상태 표시 */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '20px',
                            paddingBottom: '16px',
                            borderBottom: '1px solid #e2e8f0'
                        }}>
                            <span style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#4a5568'
                            }}>
                                총 {bids.length}건의 입찰 내역
                            </span>
                            {bids.length > 0 && (
                                <button
                                    onClick={() => loadMyBids(1, true)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        color: '#718096',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🔄 새로고침
                                </button>
                            )}
                        </div>

                        {bids.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: '#718096'
                            }}>
                                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>
                                <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
                                    아직 입찰 내역이 없습니다
                                </div>
                                <div style={{ fontSize: '16px', marginBottom: '24px' }}>
                                    관심있는 경매에 참여해보세요!
                                </div>
                                <button
                                    onClick={() => navigate('/products/auction')}
                                    style={{
                                        padding: '16px 32px',
                                        backgroundColor: '#7f56fd',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#6b46c1';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 8px 24px rgba(127, 86, 253, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '#7f56fd';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    경매 구경하기 →
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* 입찰 목록 */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {bids.map((bid, index) => (
                                        <div
                                            key={`${bid.auctionId}-${bid.bidPrice}-${index}`}
                                            style={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer',
                                                position: 'relative'
                                            }}
                                            onClick={() => handleAuctionClick(bid.auctionId)}
                                            onMouseEnter={(e) => {
                                                e.target.style.borderColor = '#cbd5e0';
                                                e.target.style.backgroundColor = '#f8fafc';
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.borderColor = '#e2e8f0';
                                                e.target.style.backgroundColor = 'white';
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            {/* 상태 배지 */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '16px',
                                                right: '16px'
                                            }}>
                                                {getBidStatusBadge(bid.bidStatus)}
                                            </div>

                                            {/* 경매 정보 */}
                                            <div style={{ marginBottom: '16px', paddingRight: '100px' }}>
                                                <h3 style={{
                                                    fontSize: '18px',
                                                    fontWeight: '600',
                                                    color: '#1a202c',
                                                    margin: '0 0 8px 0',
                                                    lineHeight: '1.4'
                                                }}>
                                                    {bid.auctionProductName || bid.auctionTitle || bid.productName || `경매 #${bid.auctionId}`}
                                                </h3>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#718096',
                                                    marginBottom: '4px'
                                                }}>
                                                    경매 ID: #{bid.auctionId}
                                                </div>
                                                {bid.bidTime && (
                                                    <div style={{
                                                        fontSize: '14px',
                                                        color: '#a0aec0'
                                                    }}>
                                                        입찰일: {new Date(bid.bidTime).toLocaleString('ko-KR', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* 입찰 금액 */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        color: '#718096',
                                                        marginBottom: '4px'
                                                    }}>
                                                        내 입찰가
                                                    </div>
                                                    <div style={{
                                                        fontSize: '24px',
                                                        fontWeight: '700',
                                                        color: '#2d3748'
                                                    }}>
                                                        {(bid.bidPrice || 0).toLocaleString()}원
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#7f56fd',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    경매 보기 →
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 더 보기 버튼 */}
                                {hasMore && (
                                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            style={{
                                                padding: '16px 32px',
                                                backgroundColor: loadingMore ? '#e2e8f0' : '#f8fafc',
                                                color: loadingMore ? '#a0aec0' : '#4a5568',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                cursor: loadingMore ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!loadingMore) {
                                                    e.target.style.backgroundColor = '#edf2f7';
                                                    e.target.style.borderColor = '#cbd5e0';
                                                    e.target.style.transform = 'translateY(-2px)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!loadingMore) {
                                                    e.target.style.backgroundColor = '#f8fafc';
                                                    e.target.style.borderColor = '#e2e8f0';
                                                    e.target.style.transform = 'translateY(0)';
                                                }
                                            }}
                                        >
                                            {loadingMore ? '불러오는 중...' : '더 보기'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}