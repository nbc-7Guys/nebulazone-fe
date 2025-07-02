import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNav from '../components/layout/HeaderNav';
import { JwtManager } from '../services/managers/JwtManager';
import { auctionApi, catalogApi } from '../services/api';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const jwt = JwtManager.getJwt();
    const [popularAuctions, setPopularAuctions] = useState([]);
    const [closingAuctions, setClosingAuctions] = useState([]);
    const [popularCatalogs, setPopularCatalogs] = useState([]);
    const [popularLastUpdated, setPopularLastUpdated] = useState(null);
    const [closingLastUpdated, setClosingLastUpdated] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAuctions = async () => {
            setIsLoading(true);
            try {
                
                // 인기 경매 가져오기
                const popularResponse = await auctionApi.getAuctionsBySort('POPULAR');
                
                // 응답 구조 확인 및 데이터 추출
                let popularData = [];
                let popularUpdated = null;
                if (Array.isArray(popularResponse)) {
                    popularData = popularResponse;
                } else if (popularResponse && typeof popularResponse === 'object') {
                    // 응답이 배열이 아닌 객체인 경우 (예: { auctions: [...], lastUpdated: "..." } 형태)
                    const possibleArrayKeys = ['auctions', 'data', 'content', 'items', 'results'];
                    for (const key of possibleArrayKeys) {
                        if (Array.isArray(popularResponse[key])) {
                            popularData = popularResponse[key];
                            break;
                        }
                    }
                    // lastUpdated 정보 추출
                    popularUpdated = popularResponse.lastUpdated;
                }
                
                setPopularAuctions(popularData?.slice(0, 4) || []); // 상위 4개만 표시
                setPopularLastUpdated(popularUpdated);
                
                // 마감 임박 경매 가져오기
                const closingResponse = await auctionApi.getAuctionsBySort('CLOSING');
                
                // 응답 구조 확인 및 데이터 추출
                let closingData = [];
                let closingUpdated = null;
                if (Array.isArray(closingResponse)) {
                    closingData = closingResponse;
                } else if (closingResponse && typeof closingResponse === 'object') {
                    // 응답이 배열이 아닌 객체인 경우 (예: { auctions: [...], lastUpdated: "..." } 형태)
                    const possibleArrayKeys = ['auctions', 'data', 'content', 'items', 'results'];
                    for (const key of possibleArrayKeys) {
                        if (Array.isArray(closingResponse[key])) {
                            closingData = closingResponse[key];
                            break;
                        }
                    }
                    // lastUpdated 정보 추출
                    closingUpdated = closingResponse.lastUpdated;
                }
                
                setClosingAuctions(closingData?.slice(0, 4) || []); // 상위 4개만 표시
                setClosingLastUpdated(closingUpdated);
                
                // 인기 카탈로그 가져오기 (CPU 카테고리에서 4개)
                try {
                    const catalogResponse = await catalogApi.getCatalogs('', 1, 4, 'CPU');
                    setPopularCatalogs(catalogResponse?.content || []);
                } catch (catalogError) {
                    console.error('카탈로그 데이터를 가져오는 중 오류 발생:', catalogError);
                    // 카탈로그 오류는 전체 페이지 로딩에 영향을 주지 않도록 함
                }
                
                setError(null);
            } catch (err) {
                console.error('경매 데이터를 가져오는 중 오류 발생:', err);
                setError('경매 데이터를 불러오는 데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAuctions();
    }, []);

    const scrollToSection = (sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({ 
            behavior: 'smooth' 
        });
    };

    // 남은 시간 계산 함수
    const calculateTimeLeft = (endDate) => {
        const difference = new Date(endDate) - new Date();
        
        if (difference <= 0) {
            return '마감됨';
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        
        if (days > 0) {
            return `${days}일 ${hours}시간`;
        } else if (hours > 0) {
            return `${hours}시간 ${minutes}분`;
        } else {
            return `${minutes}분`;
        }
    };

    // 가격 포맷 함수
    const formatPrice = (price) => {
        if (price === null || price === undefined || price === 0) {
            return '가격 정보 없음';
        }
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원';
    };

    // 경매 카드 렌더링 함수
    const renderAuctionCard = (auction) => {
        if (!auction) return null;
        
        
        // 서버 응답과 필드명 매핑
        const mappedAuction = {
            id: auction.auctionId,
            title: auction.productName || '제목 없음',
            currentPrice: auction.currentPrice || 0,
            startPrice: auction.startPrice || 0,
            endTime: auction.endTime,
            imageUrl: auction.productImageUrl && auction.productImageUrl !== '이미지 없음' ? auction.productImageUrl : '',
            bidCount: auction.bidCount || 0,
            sellerNickname: auction.sellerNickname || auction.sellerName || '판매자'
        };
        
        return (
            <div 
                key={mappedAuction.id || `auction-${Math.random()}`} 
                className="auction-card"
                onClick={() => mappedAuction.id ? navigate(`/products/${mappedAuction.id}`) : null}
            >
                <div className="auction-image">
                    {/* 이미지 URL이 유효한 경우에만 이미지 태그를 렌더링 */}
                    {mappedAuction.imageUrl && mappedAuction.imageUrl.trim() !== '' ? (
                        <img 
                            src={mappedAuction.imageUrl} 
                            alt={mappedAuction.title} 
                            onError={(e) => {
                                // 이미지 태그 자체를 제거
                                e.target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="no-image-placeholder">
                            <span>이미지 없음</span>
                        </div>
                    )}
                    <div className="auction-time-left">
                        {mappedAuction.endTime ? calculateTimeLeft(mappedAuction.endTime) : '정보 없음'}
                    </div>
                </div>
                <div className="auction-info">
                    <h3 className="auction-title">{mappedAuction.title}</h3>
                    <div className="auction-price">
                        <span className="current-bid">
                            {mappedAuction.currentPrice > 0 
                                ? formatPrice(mappedAuction.currentPrice) 
                                : `시작가: ${formatPrice(mappedAuction.startPrice)}`}
                        </span>
                        <span className="bid-count">{mappedAuction.bidCount}건의 입찰</span>
                    </div>
                    <div className="auction-seller">{mappedAuction.sellerNickname}</div>
                </div>
            </div>
        );
    };

    // 홈화면용 컴팩트한 경매 카드 렌더링 함수 (입찰 건수와 판매자 정보 강조)
    const renderAuctionCardWithDetails = (auction) => {
        if (!auction) return null;
        
        // 서버 응답과 필드명 매핑
        const mappedAuction = {
            id: auction.auctionId,
            title: auction.productName || '제목 없음',
            currentPrice: auction.currentPrice || 0,
            startPrice: auction.startPrice || 0,
            endTime: auction.endTime,
            imageUrl: auction.productImageUrl && auction.productImageUrl !== '이미지 없음' ? auction.productImageUrl : '',
            bidCount: auction.bidCount || 0,
            sellerNickname: auction.sellerNickname || auction.sellerName || '판매자'
        };
        
        return (
            <div 
                key={mappedAuction.id || `auction-${Math.random()}`} 
                className="auction-card-compact"
                onClick={() => mappedAuction.id ? navigate(`/products/auction/${mappedAuction.id}`) : null}
            >
                <div className="auction-image-compact">
                    {mappedAuction.imageUrl && mappedAuction.imageUrl.trim() !== '' ? (
                        <img 
                            src={mappedAuction.imageUrl} 
                            alt={mappedAuction.title} 
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="no-image-placeholder-compact">
                            <span>📷</span>
                        </div>
                    )}
                    <div className="auction-status-badge">
                        <span className="time-left">
                            {mappedAuction.endTime ? calculateTimeLeft(mappedAuction.endTime) : '정보 없음'}
                        </span>
                    </div>
                    
                    {/* 판매/낙찰 상태 마크 */}
                    {(auction.isSold || auction.isWon || auction.isFailed) && (
                        <div className="sale-status-badge" style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            backgroundColor: auction.isWon || auction.isSold ? '#fed7d7' : '#f7fafc',
                            color: auction.isWon || auction.isSold ? '#f56565' : '#a0aec0',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            border: `1px solid ${auction.isWon || auction.isSold ? '#f56565' : '#a0aec0'}`,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            zIndex: 10
                        }}>
                            {auction.isWon ? '낙찰완료' : auction.isSold ? '판매완료' : auction.isFailed ? '유찰' : '완료'}
                        </div>
                    )}
                </div>
                <div className="auction-info-compact">
                    <h4 className="auction-title-compact">{mappedAuction.title}</h4>
                    <div className="auction-price-compact">
                        <span className="current-price">
                            {mappedAuction.currentPrice > 0 
                                ? formatPrice(mappedAuction.currentPrice) 
                                : formatPrice(mappedAuction.startPrice)}
                        </span>
                        {mappedAuction.currentPrice === 0 && (
                            <span className="start-price-label">시작가</span>
                        )}
                    </div>
                    <div className="auction-details">
                        <div className="bid-info">
                            <span className="bid-count">🔥 {mappedAuction.bidCount}건 입찰</span>
                        </div>
                        <div className="seller-info">
                            <span className="seller-name">👤 {mappedAuction.sellerNickname}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 업데이트 시간 포맷팅 함수
    const formatLastUpdated = (lastUpdated) => {
        if (!lastUpdated) return null;
        
        try {
            const date = new Date(lastUpdated);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            
            return `${month}/${day} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} 기준`;
        } catch (error) {
            return null;
        }
    };

    return (
        <div className="landing-page">
            <HeaderNav />
            
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1 className="hero-title">
                                <span className="brand-name">NEBULAZONE</span>
                                <span className="hero-subtitle">중고 거래 | 경매 | 커뮤니티</span>
                            </h1>
                            <p className="hero-description">
                                컴퓨터 부품의 안전한 중고거래와 실시간 경매를 경험하세요
                            </p>
                            <div className="hero-buttons">
                                {jwt ? (
                                    <>
                                        <button 
                                            className="btn-primary"
                                            onClick={() => navigate('/products/direct')}
                                        >
                                            상품 둘러보기
                                        </button>
                                        <button 
                                            className="btn-secondary"
                                            onClick={() => navigate('/products/create')}
                                        >
                                            상품 등록하기
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            className="btn-primary"
                                            onClick={() => navigate('/signup')}
                                        >
                                            회원가입
                                        </button>
                                        <button 
                                            className="btn-secondary"
                                            onClick={() => navigate('/login')}
                                        >
                                            로그인
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-number">2,847</span>
                                <span className="stat-label">등록된 상품</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">1,203</span>
                                <span className="stat-label">활성 사용자</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">956</span>
                                <span className="stat-label">완료된 거래</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="scroll-indicator" onClick={() => scrollToSection('search-section')}>
                    <div className="scroll-arrow">↓</div>
                    <span>상품 검색하기</span>
                </div>
            </section>

            {/* 상품 검색 섹션 */}
            <section id="search-section" className="search-section">
                <div className="container">
                    <h2>원하는 상품을 찾아보세요</h2>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="상품명을 입력하세요 (예: RTX 4090, i7-13700K, DDR5 32GB...)"
                            className="search-input"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    navigate(`/products/direct?search=${encodeURIComponent(e.target.value.trim())}`);
                                }
                            }}
                        />
                        <button
                            className="search-button"
                            onClick={(e) => {
                                const input = e.target.previousElementSibling;
                                if (input.value.trim()) {
                                    navigate(`/products/direct?search=${encodeURIComponent(input.value.trim())}`);
                                }
                            }}
                        >
                            검색
                        </button>
                    </div>
                    <div className="popular-searches">
                        <span>인기 검색어:</span>
                        {['RTX 4090', 'i7-13700K', 'DDR5', 'RTX 4070', 'Ryzen 7800X3D'].map((term) => (
                            <button
                                key={term}
                                className="search-tag"
                                onClick={() => navigate(`/products/direct?search=${encodeURIComponent(term)}`)}
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Auctions Section - 양 옆으로 나란히 배치 (위로 이동) */}
            <section id="auction-section" className="auctions-section">
                <div className="container">
                    <h2 className="section-title">🔥 실시간 경매</h2>
                    <div className="auction-update-info">
                        <span className="update-schedule">📅 경매 순위는 5분마다 업데이트됩니다</span>
                    </div>
                    {isLoading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>경매 데이터를 불러오는 중...</p>
                        </div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <div className="dual-auction-grid">
                            {/* 인기 경매 */}
                            <div className="auction-section-half">
                                <h3 className="auction-subsection-title">
                                    <span className="icon">🔥</span>
                                    인기 경매
                                    <span className="subtitle">입찰이 활발한 경매</span>
                                    {popularLastUpdated && (
                                        <span className="last-updated">{formatLastUpdated(popularLastUpdated)}</span>
                                    )}
                                </h3>
                                <div className="auctions-grid-compact">
                                    {popularAuctions.length > 0 ? 
                                        popularAuctions.slice(0, 4).map(auction => renderAuctionCardWithDetails(auction)) : 
                                        <div className="no-auctions">현재 진행 중인 인기 경매가 없습니다.</div>
                                    }
                                </div>
                            </div>

                            {/* 마감임박 경매 */}
                            <div className="auction-section-half">
                                <h3 className="auction-subsection-title">
                                    <span className="icon">⏰</span>
                                    마감임박 경매
                                    <span className="subtitle">곧 종료되는 경매</span>
                                    {closingLastUpdated && (
                                        <span className="last-updated">{formatLastUpdated(closingLastUpdated)}</span>
                                    )}
                                </h3>
                                <div className="auctions-grid-compact">
                                    {closingAuctions.length > 0 ? 
                                        closingAuctions.slice(0, 4).map(auction => renderAuctionCardWithDetails(auction)) : 
                                        <div className="no-auctions">현재 마감 임박 경매가 없습니다.</div>
                                    }
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="view-all-button">
                        <button onClick={() => navigate('/products/auction')}>
                            모든 경매 보기 →
                        </button>
                    </div>
                </div>
            </section>

            {/* 안전거래 섹션 */}
            <section className="safety-section">
                <div className="container">
                    <h2 className="section-title">안전한 거래</h2>
                    <div className="safety-grid">
                        <div className="safety-card">
                            <div className="safety-icon">🛡️</div>
                            <h3>거래 보호</h3>
                            <p>포인트 시스템으로 안전한 거래를 보장합니다</p>
                        </div>
                        <div className="safety-card">
                            <div className="safety-icon">💬</div>
                            <h3>실시간 채팅</h3>
                            <p>판매자와 구매자 간 실시간 소통</p>
                        </div>
                        <div className="safety-card">
                            <div className="safety-icon">⭐</div>
                            <h3>신뢰도 시스템</h3>
                            <p>거래 기록과 평가를 통한 신뢰할 수 있는 거래</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 통합 서비스 섹션 - 거래방식과 커뮤니티 */}
            <section className="services-section">
                <div className="container">
                    <h2 className="section-title">NEBULAZONE 서비스</h2>
                    <div className="services-grid">
                        {/* 거래 방식 */}
                        <div className="service-group">
                            <h3 className="service-group-title">
                                <span className="service-icon">🛒</span>
                                거래 방식
                            </h3>
                            <div className="service-cards">
                                <div className="service-card auction-type">
                                    <div className="service-card-icon">⚡</div>
                                    <div className="service-card-content">
                                        <h4>경매</h4>
                                        <p>실시간 입찰로 최적 가격</p>
                                        <button onClick={() => navigate('/products/auction')}>
                                            경매 참여 →
                                        </button>
                                    </div>
                                </div>
                                <div className="service-card instant-type">
                                    <div className="service-card-icon">🛍️</div>
                                    <div className="service-card-content">
                                        <h4>즉시 구매</h4>
                                        <p>고정 가격으로 바로 구매</p>
                                        <button onClick={() => navigate('/products/direct')}>
                                            상품 보기 →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 커뮤니티 */}
                        <div className="service-group">
                            <h3 className="service-group-title">
                                <span className="service-icon">💬</span>
                                커뮤니티
                            </h3>
                            <div className="service-cards">
                                <div className="service-card community-type">
                                    <div className="service-card-icon">📝</div>
                                    <div className="service-card-content">
                                        <h4>자유게시판</h4>
                                        <p>자유로운 소통과 정보 공유</p>
                                        <button onClick={() => navigate('/posts?type=FREE')}>
                                            게시판 →
                                        </button>
                                    </div>
                                </div>
                                <div className="service-card qna-type">
                                    <div className="service-card-icon">❓</div>
                                    <div className="service-card-content">
                                        <h4>질문/답변</h4>
                                        <p>궁금한 점을 물어보세요</p>
                                        <button onClick={() => navigate('/posts?type=QNA')}>
                                            질문하기 →
                                        </button>
                                    </div>
                                </div>
                                <div className="service-card review-type">
                                    <div className="service-card-icon">⭐</div>
                                    <div className="service-card-content">
                                        <h4>거래후기</h4>
                                        <p>거래 경험과 후기 공유</p>
                                        <button onClick={() => navigate('/posts?type=REVIEW')}>
                                            후기 보기 →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            {/*<section id="features" className="features-section">*/}
            {/*    <div className="container">*/}
            {/*        <h2 className="section-title">🌟 왜 NEBULAZONE인가요?</h2>*/}
            {/*        <div className="features-grid">*/}
            {/*            <div className="feature-card">*/}
            {/*                <div className="feature-icon">🛡️</div>*/}
            {/*                <h3>안전한 거래</h3>*/}
            {/*                <p>포인트 시스템과 거래 보호로 안전한 중고거래를 보장합니다</p>*/}
            {/*            </div>*/}
            {/*            <div className="feature-card">*/}
            {/*                <div className="feature-icon">⚡</div>*/}
            {/*                <h3>실시간 경매</h3>*/}
            {/*                <p>실시간 입찰 시스템으로 최적의 가격에 원하는 제품을 구매하세요</p>*/}
            {/*            </div>*/}
            {/*            <div className="feature-card">*/}
            {/*                <div className="feature-icon">💬</div>*/}
            {/*                <h3>실시간 채팅</h3>*/}
            {/*                <p>판매자와 구매자 간 실시간 소통으로 빠른 거래 진행</p>*/}
            {/*            </div>*/}
            {/*            <div className="feature-card">*/}
            {/*                <div className="feature-icon">🎯</div>*/}
            {/*                <h3>전문 카테고리</h3>*/}
            {/*                <p>CPU, GPU, RAM, SSD 등 컴퓨터 부품 전문 플랫폼</p>*/}
            {/*            </div>*/}
            {/*            <div className="feature-card">*/}
            {/*                <div className="feature-icon">📱</div>*/}
            {/*                <h3>모바일 최적화</h3>*/}
            {/*                <p>언제 어디서나 편리하게 이용할 수 있는 반응형 디자인</p>*/}
            {/*            </div>*/}
            {/*            <div className="feature-card">*/}
            {/*                <div className="feature-icon">🏆</div>*/}
            {/*                <h3>신뢰도 시스템</h3>*/}
            {/*                <p>거래 기록과 평가를 통한 신뢰할 수 있는 판매자 확인</p>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</section>*/}

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <h3>NEBULAZONE</h3>
                            <p>컴퓨터 부품 전문 중고거래 플랫폼</p>
                        </div>
                        <div className="footer-links">
                            <div className="link-group">
                                <h4>서비스</h4>
                                <a href="/products/direct">상품 둘러보기</a>
                                <a href="/products/auctions">경매 참여</a>
                                <a href="/chat/rooms">실시간 채팅</a>
                            </div>
                            <div className="link-group">
                                <h4>계정</h4>
                                <a href="/login">로그인</a>
                                <a href="/signup">회원가입</a>
                                <a href="/mypage">마이페이지</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2025 NEBULAZONE. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
