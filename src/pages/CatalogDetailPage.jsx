import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderNav from '../components/layout/HeaderNav';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { CatalogInfo, ReviewList } from '../components/catalog';
import Breadcrumb from '../components/ui/Breadcrumb';
import { catalogApi, reviewApi } from '../services/api';

export default function CatalogDetailPage() {
    const { catalogId } = useParams();
    const navigate = useNavigate();

    // 상태 관리
    const [catalog, setCatalog] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [error, setError] = useState('');

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    // 리뷰 섭션 참조
    const reviewSectionRef = React.useRef(null);

    // 카탈로그 정보 로드
    const loadCatalog = async () => {
        try {
            setCatalogLoading(true);
            setError('');
            const catalogData = await catalogApi.getCatalog(catalogId);
            setCatalog(catalogData);
        } catch (error) {
            console.error('카탈로그 조회 실패:', error);
            if (error.response?.status === 404) {
                setError('요청하신 카탈로그를 찾을 수 없습니다.');
            } else {
                setError('카탈로그 정보를 불러오는데 실패했습니다.');
            }
        } finally {
            setCatalogLoading(false);
        }
    };

    // 리뷰 목록 로드
    const loadReviews = async (page = 1) => {
        try {
            setReviewsLoading(true);
            const reviewsData = await reviewApi.getCatalogReviews(catalogId, page, pageSize);
            setReviews(reviewsData.content || []);
            setTotalPages(reviewsData.totalPages || 0);
            setTotalElements(reviewsData.totalElements || 0);
            setCurrentPage(page);
        } catch (error) {
            console.error('리뷰 조회 실패:', error);
            setReviews([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setReviewsLoading(false);
        }
    };

    // 페이지 변경 처리
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            loadReviews(newPage);
        }
    };

    // 뒤로가기
    const handleBack = () => {
        navigate(-1);
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        if (!catalogId) {
            setError('올바르지 않은 카탈로그 ID입니다.');
            return;
        }

        loadCatalog();
        loadReviews(1);
    }, [catalogId]);

    // 카탈로그 로딩 중
    if (catalogLoading) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
                <HeaderNav />
                <LoadingSpinner message="카탈로그 정보를 불러오는 중..." />
            </div>
        );
    }

    // 에러 상태
    if (error && !catalog) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
                <HeaderNav />
                <div style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "40px 20px"
                }}>
                    <ErrorMessage
                        message={error}
                        onRetry={() => {
                            loadCatalog();
                            loadReviews(1);
                        }}
                        style={{ marginBottom: "24px" }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="page-enter" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
            <HeaderNav />
            
            <div
                role="main"
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "40px 20px"
                }}
            >
                {/* 브레드크럼 */}
                <Breadcrumb customItems={[
                    { label: '홈', path: '/', icon: '🏠' },
                    { label: '카탈로그', path: '/catalogs', icon: '📖' },
                    { label: catalog?.catalogName || '상세보기', path: `/catalogs/${catalogId}`, icon: '📄' }
                ]} />
                
                {/* 뒤로가기 버튼 */}
                <button
                    onClick={handleBack}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#e2e8f0",
                        color: "#4a5568",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        cursor: "pointer",
                        marginBottom: "24px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}
                >
                    ← 뒤로가기
                </button>

                {/* 에러 메시지 (부분 에러) */}
                {error && catalog && (
                    <ErrorMessage
                        message={error}
                        onRetry={() => setError('')}
                        retryText="확인"
                        style={{ marginBottom: "24px" }}
                    />
                )}

                {/* 카탈로그 기본 정보 */}
                {catalog && (
                    <div className="bg-primary p-8 rounded-lg shadow border mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-bold text-primary leading-tight">
                                {catalog.catalogName}
                            </h1>
                            <button
                                onClick={() => {
                                    reviewSectionRef.current?.scrollIntoView({ 
                                        behavior: 'smooth',
                                        block: 'start' 
                                    });
                                }}
                                className="btn-primary px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2"
                            >
                                <span>⭐ 리뷰 보기</span>
                                {reviews.length > 0 && (
                                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                                        {(reviews.reduce((acc, review) => acc + review.star, 0) / reviews.length).toFixed(1)}★ ({totalElements})
                                    </span>
                                )}
                                {reviews.length === 0 && (
                                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                                        ({totalElements})
                                    </span>
                                )}
                            </button>
                        </div>
                        
                        {catalog.catalogDescription && (
                            <p className="text-lg text-muted leading-relaxed">
                                {catalog.catalogDescription}
                            </p>
                        )}
                    </div>
                )}

                {/* 상세 사양 섭션 */}
                {catalog && (
                    <div className="bg-primary rounded-lg shadow border mb-8">
                        <div className="p-8">
                            <div className="flex items-center mb-6">
                                <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
                                    📋 상세 사양
                                </h2>
                            </div>
                            <CatalogInfo catalog={catalog} />
                        </div>
                    </div>
                )}

                {/* 리뷰 섭션 */}
                <div 
                    ref={reviewSectionRef}
                    className="bg-primary rounded-lg shadow border"
                >
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
                                ⭐ 사용자 리뷰
                            </h2>
                            <div className="flex items-center gap-4">
                                {reviews.length > 0 && (
                                    <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
                                        <div className="flex items-center">
                                            {Array.from({ length: 5 }, (_, index) => {
                                                const avgRating = reviews.length > 0 
                                                    ? (reviews.reduce((acc, review) => acc + review.star, 0) / reviews.length) 
                                                    : 0;
                                                const isFilled = index < Math.floor(avgRating);
                                                const isPartial = index === Math.floor(avgRating) && avgRating % 1 !== 0;
                                                
                                                return (
                                                    <span 
                                                        key={index}
                                                        className="text-yellow-400 text-lg"
                                                        style={{
                                                            filter: isFilled ? "drop-shadow(0 1px 2px rgba(251, 191, 36, 0.4))" : "none"
                                                        }}
                                                    >
                                                        {isFilled ? "★" : "☆"}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                        <span className="text-sm font-semibold text-yellow-700">
                                            {reviews.length > 0 
                                                ? (reviews.reduce((acc, review) => acc + review.star, 0) / reviews.length).toFixed(1)
                                                : "0.0"
                                            }
                                        </span>
                                    </div>
                                )}
                                <div className="text-sm text-muted">
                                    총 {totalElements}개의 리뷰
                                </div>
                            </div>
                        </div>
                        <ReviewList
                            reviews={reviews}
                            loading={reviewsLoading}
                            error={null}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalElements={totalElements}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}