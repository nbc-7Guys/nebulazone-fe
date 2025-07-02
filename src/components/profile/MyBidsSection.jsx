import React, { useState, useEffect } from 'react';
import { bidApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ErrorHandler, ToastManager } from '../../utils/error/errorHandler';

export default function MyBidsSection() {
    const navigate = useNavigate();
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // 내 입찰 내역 조회
    const loadMyBids = async (pageNum = 1, reset = false) => {
        try {
            if (pageNum === 1) {
                setLoading(true);
                setError('');
            } else {
                setLoadingMore(true);
            }

            const response = await bidApi.getMyBids(pageNum, 10);
            console.log('🔍 API 응답 데이터 구조:', response);
            console.log('🔍 API 응답 content:', response.content);
            console.log('🔍 API 응답 hasNext:', response.hasNext);
            
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

    useEffect(() => {
        loadMyBids();
    }, []);

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
                padding: '4px 8px',
                backgroundColor: statusInfo.bgColor,
                color: statusInfo.color,
                borderRadius: '12px',
                fontSize: '12px',
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
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
            }}>
                <div style={{ color: '#718096', fontSize: '16px' }}>
                    입찰 내역을 불러오는 중...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                border: '1px solid #e2e8f0'
            }}>
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1a202c',
                    margin: '0 0 16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    🏷️ 내 입찰 내역
                </h3>
                <div style={{
                    color: '#e53e3e',
                    textAlign: 'center',
                    padding: '20px'
                }}>
                    {error}
                    <button
                        onClick={() => loadMyBids(1, true)}
                        style={{
                            display: 'block',
                            margin: '16px auto 0',
                            padding: '8px 16px',
                            backgroundColor: '#3182ce',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            border: '1px solid #e2e8f0'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
            }}>
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a202c',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    🏷️ 내 입찰 내역
                </h3>
                <span style={{
                    fontSize: '12px',
                    color: '#718096',
                    backgroundColor: '#f7fafc',
                    padding: '2px 6px',
                    borderRadius: '8px'
                }}>
                    {bids.length}건
                </span>
            </div>

            {bids.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '20px 16px',
                    color: '#718096'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        아직 입찰 내역이 없습니다
                    </div>
                    <div style={{ fontSize: '12px' }}>
                        관심있는 경매에 참여해보세요!
                    </div>
                    <button
                        onClick={() => navigate('/products/auction')}
                        style={{
                            marginTop: '12px',
                            padding: '8px 16px',
                            backgroundColor: '#7f56fd',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#6b46c1';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#7f56fd';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        경매 구경하기
                    </button>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {bids.map((bid, index) => (
                            <div
                                key={`${bid.auctionId}-${bid.bidPrice}-${index}`}
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    padding: '12px',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleAuctionClick(bid.auctionId)}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = '#cbd5e0';
                                    e.target.style.backgroundColor = '#f8fafc';
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#1a202c',
                                            margin: '0 0 4px 0',
                                            lineHeight: '1.3'
                                        }}>
                                            {bid.auctionProductName || bid.auctionTitle || bid.productName || `경매 #${bid.auctionId}`}
                                        </h4>
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#a0aec0',
                                            marginBottom: '2px'
                                        }}>
                                            #{bid.auctionId} • {bid.bidTime && new Date(bid.bidTime).toLocaleDateString('ko-KR')}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        {getBidStatusBadge(bid.bidStatus)}
                                    </div>
                                </div>
                                
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        color: '#2d3748'
                                    }}>
                                        {(bid.bidPrice || 0).toLocaleString()}원
                                    </div>
                                    <div style={{
                                        fontSize: '10px',
                                        color: '#7f56fd',
                                        fontWeight: '500'
                                    }}>
                                        보기 →
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 더 보기 버튼 */}
                    {hasMore && (
                        <div style={{ textAlign: 'center', marginTop: '12px' }}>
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: loadingMore ? '#e2e8f0' : '#f7fafc',
                                    color: loadingMore ? '#a0aec0' : '#4a5568',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: loadingMore ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (!loadingMore) {
                                        e.target.style.backgroundColor = '#edf2f7';
                                        e.target.style.borderColor = '#cbd5e0';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loadingMore) {
                                        e.target.style.backgroundColor = '#f7fafc';
                                        e.target.style.borderColor = '#e2e8f0';
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
    );
}