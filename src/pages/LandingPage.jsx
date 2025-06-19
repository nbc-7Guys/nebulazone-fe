import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JwtManager } from '../utils/JwtManager';
import { auctionApi } from '../services/api';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const jwt = JwtManager.getJwt();
    const [popularAuctions, setPopularAuctions] = useState([]);
    const [closingAuctions, setClosingAuctions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAuctions = async () => {
            setIsLoading(true);
            try {
                // 인기 경매 가져오기
                const popularResponse = await auctionApi.getAuctionsBySort('POPULAR');
                console.log('인기 경매 응답 전체 데이터:', popularResponse);
                
                // 응답 구조 확인 및 데이터 추출
                let popularData = [];
                if (Array.isArray(popularResponse)) {
                    popularData = popularResponse;
                } else if (popularResponse && typeof popularResponse === 'object') {
                    // 응답이 배열이 아닌 객체인 경우 (예: { data: [...] } 형태)
                    const possibleArrayKeys = ['data', 'content', 'auctions', 'items', 'results'];
                    for (const key of possibleArrayKeys) {
                        if (Array.isArray(popularResponse[key])) {
                            popularData = popularResponse[key];
                            break;
                        }
                    }
                }
                
                console.log('처리된 인기 경매 데이터:', popularData);
                setPopularAuctions(popularData?.slice(0, 4) || []); // 상위 4개만 표시
                
                // 마감 임박 경매 가져오기
                const closingResponse = await auctionApi.getAuctionsBySort('CLOSING');
                console.log('마감 임박 경매 응답 전체 데이터:', closingResponse);
                
                // 응답 구조 확인 및 데이터 추출
                let closingData = [];
                if (Array.isArray(closingResponse)) {
                    closingData = closingResponse;
                } else if (closingResponse && typeof closingResponse === 'object') {
                    // 응답이 배열이 아닌 객체인 경우 (예: { data: [...] } 형태)
                    const possibleArrayKeys = ['data', 'content', 'auctions', 'items', 'results'];
                    for (const key of possibleArrayKeys) {
                        if (Array.isArray(closingResponse[key])) {
                            closingData = closingResponse[key];
                            console.log(`마감 임박 경매 데이터 찾음: closingResponse.${key}`);
                            break;
                        }
                    }
                }
                
                console.log('처리된 마감 임박 경매 데이터:', closingData);
                setClosingAuctions(closingData?.slice(0, 4) || []); // 상위 4개만 표시
                
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
        
        // 콘솔에 현재 렌더링 중인 경매 객체를 출력하여 디버깅
        console.log('렌더링 중인 경매 객체:', auction);
        
        // 서버 응답과 필드명 매핑
        const mappedAuction = {
            id: auction.auctionId,
            title: auction.productName || '제목 없음',
            currentPrice: auction.currentPrice || auction.startPrice || 0,
            startPrice: auction.startPrice || 0,
            endTime: auction.endTime,
            imageUrl: auction.productImageUrl && auction.productImageUrl !== '이미지 없음' ? auction.productImageUrl : '',
            bidCount: auction.bidCount || 0,
            sellerNickname: auction.sellerNickname || '판매자 정보 없음'
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
                                console.log('이미지 로딩 오류, 이미지 제거:', e.target.src);
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

    return (
        <div className="landing-page">
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
                                CPU, GPU, SSD 등 컴퓨터 부품의 안전한 중고거래와 실시간 경매를 경험하세요
                            </p>
                            <div className="hero-buttons">
                                {jwt ? (
                                    <>
                                        <button 
                                            className="btn-primary"
                                            onClick={() => navigate('/products/direct')}
                                        >
                                            🛍️ 상품 둘러보기
                                        </button>
                                        <button 
                                            className="btn-secondary"
                                            onClick={() => navigate('/products/create')}
                                        >
                                            📦 상품 등록하기
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            className="btn-primary"
                                            onClick={() => navigate('/signup')}
                                        >
                                            🚀 시작하기
                                        </button>
                                        <button 
                                            className="btn-secondary"
                                            onClick={() => navigate('/login')}
                                        >
                                            🔑 로그인
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-number">10K+</span>
                                <span className="stat-label">등록된 상품</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">5K+</span>
                                <span className="stat-label">활성 사용자</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">1K+</span>
                                <span className="stat-label">완료된 거래</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="scroll-indicator" onClick={() => scrollToSection('auction-section')}>
                    <div className="scroll-arrow">↓</div>
                    <span>인기 경매 보기</span>
                </div>
            </section>

            {/* Auction Section */}
            <section id="auction-section" className="auctions-section">
                <div className="container">
                    <h2 className="section-title">🔥 인기 경매</h2>
                    {isLoading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>경매 데이터를 불러오는 중...</p>
                        </div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <div className="auctions-grid">
                            {popularAuctions.length > 0 ? 
                                popularAuctions.map(auction => renderAuctionCard(auction)) : 
                                <div className="no-auctions">현재 진행 중인 인기 경매가 없습니다.</div>
                            }
                        </div>
                    )}
                    <div className="view-all-button">
                        <button onClick={() => navigate('/auctions?sort=POPULAR')}>
                            모든 인기 경매 보기 →
                        </button>
                    </div>

                    <h2 className="section-title">⏰ 마감 임박 경매</h2>
                    {isLoading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>경매 데이터를 불러오는 중...</p>
                        </div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <div className="auctions-grid">
                            {closingAuctions.length > 0 ? 
                                closingAuctions.map(auction => renderAuctionCard(auction)) : 
                                <div className="no-auctions">현재 마감 임박한 경매가 없습니다.</div>
                            }
                        </div>
                    )}
                    <div className="view-all-button">
                        <button onClick={() => navigate('/auctions?sort=CLOSING')}>
                            모든 마감 임박 경매 보기 →
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="container">
                    <h2 className="section-title">🌟 왜 NEBULAZONE인가요?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🛡️</div>
                            <h3>안전한 거래</h3>
                            <p>포인트 시스템과 거래 보호로 안전한 중고거래를 보장합니다</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">⚡</div>
                            <h3>실시간 경매</h3>
                            <p>실시간 입찰 시스템으로 최적의 가격에 원하는 제품을 구매하세요</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💬</div>
                            <h3>실시간 채팅</h3>
                            <p>판매자와 구매자 간 실시간 소통으로 빠른 거래 진행</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🎯</div>
                            <h3>전문 카테고리</h3>
                            <p>CPU, GPU, RAM, SSD 등 컴퓨터 부품 전문 플랫폼</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📱</div>
                            <h3>모바일 최적화</h3>
                            <p>언제 어디서나 편리하게 이용할 수 있는 반응형 디자인</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🏆</div>
                            <h3>신뢰도 시스템</h3>
                            <p>거래 기록과 평가를 통한 신뢰할 수 있는 판매자 확인</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <div className="container">
                    <h2 className="section-title">🛒 거래 방식</h2>
                    <div className="categories-grid-two">
                        <div className="category-card auction">
                            <div className="category-icon">⚡</div>
                            <h3>경매</h3>
                            <p>실시간 입찰로 최적의 가격에 구매하세요</p>
                            <div className="category-features">
                                <span>• 실시간 입찰</span>
                                <span>• 경쟁적 가격</span>
                                <span>• 시간 제한</span>
                            </div>
                            <button onClick={() => navigate('/products/auctions')}>
                                경매 참여하기 →
                            </button>
                        </div>
                        <div className="category-card instant">
                            <div className="category-icon">🛍️</div>
                            <h3>즉시 구매</h3>
                            <p>정해진 가격으로 바로 구매 가능합니다</p>
                            <div className="category-features">
                                <span>• 즉시 구매</span>
                                <span>• 고정 가격</span>
                                <span>• 빠른 거래</span>
                            </div>
                            <button onClick={() => navigate('/products/direct')}>
                                상품 둘러보기 →
                            </button>
                        </div>
                    </div>
                    
                    {/* 상품 검색 섹션 */}
                    <div className="search-section">
                        <h3>🔍 원하는 상품을 찾아보세요</h3>
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="상품명을 입력하세요 (예: RTX 4090, i7-13700K, DDR5 32GB...)"
                                className="search-input"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                        navigate(`/products?search=${encodeURIComponent(e.target.value.trim())}`);
                                    }
                                }}
                            />
                            <button 
                                className="search-button"
                                onClick={(e) => {
                                    const input = e.target.previousElementSibling;
                                    if (input.value.trim()) {
                                        navigate(`/products?search=${encodeURIComponent(input.value.trim())}`);
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
                                    onClick={() => navigate(`/products?search=${encodeURIComponent(term)}`)}
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>지금 시작하세요!</h2>
                        <p>NEBULAZONE에서 컴퓨터 부품의 새로운 거래 경험을 만나보세요</p>
                        {!jwt && (
                            <div className="cta-buttons">
                                <button 
                                    className="btn-primary large"
                                    onClick={() => navigate('/signup')}
                                >
                                    무료로 시작하기
                                </button>
                                <button 
                                    className="btn-secondary large"
                                    onClick={() => scrollToSection('features')}
                                >
                                    더 알아보기
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

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
