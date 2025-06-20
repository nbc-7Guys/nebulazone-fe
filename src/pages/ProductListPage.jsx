import React, {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import HeaderNav from "../components/HeaderNav";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import {productApi} from "../services/api";

export default function ProductListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // 상태 관리
    const [products, setProducts] = useState([]);
    const [catalogs, setCatalogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [error, setError] = useState("");

    // 검색/필터 상태
    const [searchForm, setSearchForm] = useState({
        type: searchParams.get('type') || 'DIRECT',
        productname: searchParams.get('search') || searchParams.get('productname') || '',
        sellernickname: searchParams.get('sellernickname') || '',
        priceFrom: searchParams.get('from') || '',
        priceTo: searchParams.get('to') || '',
        page: parseInt(searchParams.get('page')) || 1,
        size: 12
    });

    // 페이지네이션 상태
    const [pagination, setPagination] = useState({
        totalPages: 0,
        totalElements: 0,
        currentPage: 1
    });

    // 카탈로그 목록 로드 - 제거 (서버 파라미터와 맞지 않음)
    useEffect(() => {
        setCatalogLoading(false);
    }, []);

    // 상품 목록 로드
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const params = {
                    productname: searchForm.productname || undefined,
                    sellernickname: searchForm.sellernickname || undefined,
                    type: searchForm.type,
                    from: searchForm.priceFrom || undefined,
                    to: searchForm.priceTo || undefined,
                    page: searchForm.page,
                    size: searchForm.size
                };

                const response = await productApi.getProducts(params);

                setProducts(response.content || []);
                setPagination({
                    totalPages: response.totalPages || 0,
                    totalElements: response.totalElements || 0,
                    currentPage: response.number + 1 || 1
                });

            } catch (error) {
                console.error('중고상품 목록 로드 실패:', error);
                setError('중고상품 목록을 불러오는데 실패했습니다.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [searchForm]);

    // URL 파라미터 업데이트
    useEffect(() => {
        const params = new URLSearchParams();

        if (searchForm.type !== 'DIRECT') params.set('type', searchForm.type);
        if (searchForm.productname) params.set('search', searchForm.productname);
        if (searchForm.sellernickname) params.set('sellernickname', searchForm.sellernickname);
        if (searchForm.priceFrom) params.set('from', searchForm.priceFrom);
        if (searchForm.priceTo) params.set('to', searchForm.priceTo);
        if (searchForm.page > 1) params.set('page', searchForm.page.toString());

        setSearchParams(params);
    }, [searchForm, setSearchParams]);

    // 폼 변경 핸들러
    const handleFormChange = (field, value) => {
        setSearchForm(prev => ({
            ...prev,
            [field]: value,
            page: field !== 'page' ? 1 : value // 검색 조건 변경 시 첫 페이지로
        }));
    };

    // 검색 실행
    const handleSearch = () => {
        setSearchForm(prev => ({...prev, page: 1}));
    };

    // 페이지 변경
    const handlePageChange = (newPage) => {
        handleFormChange('page', newPage);
    };

    // 상품 카드 클릭
    const handleProductClick = (product) => {
        // catalogId는 기본값으로 1을 사용하거나, 상품에서 가져온 catalogId 사용
        const catalogId = product.catalogId || 1;
        navigate(`/products/${product.productId}?catalogId=${catalogId}`);
    };

    return (
        <div style={{background: "#f8fafc", minHeight: "100vh"}}>
            <HeaderNav/>

            <div style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "40px 20px"
            }}>
                {/* 헤더 */}
                <div style={{marginBottom: "40px"}}>
                    <h1 style={{
                        fontSize: "48px",
                        fontWeight: "bold",
                        marginBottom: "16px",
                        color: "#1a202c"
                    }}>
                        중고거래
                    </h1>
                    <p style={{
                        fontSize: "18px",
                        color: "#718096"
                    }}>
                        Explore a wide range of secondhand PC parts from trusted sellers.
                    </p>
                </div>

                {/* 검색 및 필터 */}
                <div style={{
                    backgroundColor: "#fff",
                    padding: "24px",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    marginBottom: "32px"
                }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr 1fr auto",
                        gap: "12px",
                        alignItems: "center"
                    }}>
                        {/* 거래 유형 선택 */}
                        <select
                            value={searchForm.type}
                            onChange={(e) => handleFormChange('type', e.target.value)}
                            style={{
                                padding: "8px 12px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                                fontSize: "14px"
                            }}
                        >
                            <option value="DIRECT">직거래</option>
                            <option value="AUCTION">경매</option>
                        </select>

                        {/* 상품명 검색 */}
                        <input
                            type="text"
                            placeholder="상품명 검색..."
                            value={searchForm.productname}
                            onChange={(e) => handleFormChange('productname', e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            style={{
                                padding: "8px 16px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                                fontSize: "14px",
                                outline: "none"
                            }}
                        />

                        {/* 판매자 검색 */}
                        <input
                            type="text"
                            placeholder="판매자 닉네임 검색..."
                            value={searchForm.sellernickname}
                            onChange={(e) => handleFormChange('sellernickname', e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            style={{
                                padding: "8px 16px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                                fontSize: "14px",
                                outline: "none"
                            }}
                        />

                        {/* 검색 버튼 */}
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            style={{
                                padding: "8px 24px",
                                backgroundColor: "#38d39f",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "14px",
                                fontWeight: "500",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? "검색 중..." : "Search"}
                        </button>
                    </div>

                    {/* 가격 범위 필터 */}
                    <div style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                        marginTop: "16px",
                        paddingTop: "16px",
                        borderTop: "1px solid #e2e8f0"
                    }}>
                        <span style={{fontSize: "14px", fontWeight: "500"}}>가격 범위:</span>
                        <input
                            type="number"
                            placeholder="최소 가격"
                            value={searchForm.priceFrom}
                            onChange={(e) => handleFormChange('priceFrom', e.target.value)}
                            style={{
                                padding: "6px 12px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "4px",
                                fontSize: "14px",
                                width: "120px"
                            }}
                        />
                        <span style={{color: "#718096"}}>~</span>
                        <input
                            type="number"
                            placeholder="최대 가격"
                            value={searchForm.priceTo}
                            onChange={(e) => handleFormChange('priceTo', e.target.value)}
                            style={{
                                padding: "6px 12px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "4px",
                                fontSize: "14px",
                                width: "120px"
                            }}
                        />
                        {(searchForm.priceFrom || searchForm.priceTo) && (
                            <button
                                onClick={() => {
                                    handleFormChange('priceFrom', '');
                                    handleFormChange('priceTo', '');
                                }}
                                style={{
                                    padding: "4px 8px",
                                    backgroundColor: "#f7fafc",
                                    color: "#4a5568",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    cursor: "pointer"
                                }}
                            >
                                초기화
                            </button>
                        )}
                    </div>
                </div>

                {/* 결과 개수 표시 */}
                {!loading && !error && (
                    <div style={{
                        marginBottom: "20px",
                        fontSize: "14px",
                        color: "#718096"
                    }}>
                        총 {pagination.totalElements}개의 중고상품이 등록되어 있습니다.
                    </div>
                )}

                {/* 상품 목록 */}
                {loading ? (
                    <LoadingSpinner size="large" message="중고상품을 불러오는 중..."/>
                ) : error ? (
                    <ErrorMessage
                        message={error}
                        onRetry={() => setSearchForm(prev => ({...prev}))}
                        retryText="다시 불러오기"
                    />
                ) : products.length === 0 ? (
                    <EmptyState
                        icon="🔍"
                        title={searchForm.type === 'AUCTION' ? "등록된 경매가 없습니다" : "등록된 중고상품이 없습니다"}
                        description="다른 검색 조건으로 시도해보시거나 새로운 상품을 등록해보세요."
                        actionButton={
                            <button
                                onClick={() => {
                                    setSearchForm({
                                        type: searchForm.type === 'AUCTION' ? 'AUCTION' : 'DIRECT',
                                        productname: '',
                                        sellernickname: '',
                                        priceFrom: '',
                                        priceTo: '',
                                        page: 1,
                                        size: 12
                                    });
                                }}
                                style={{
                                    padding: "12px 24px",
                                    backgroundColor: "#38d39f",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                    fontWeight: "500",
                                    cursor: "pointer"
                                }}
                            >
                                전체 상품 보기
                            </button>
                        }
                    />
                ) : (
                    <>
                        {/* 상품 그리드 */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: "24px",
                            marginBottom: "40px"
                        }}>
                            {products.map(product => (
                                <ProductCard
                                    key={product.productId}
                                    product={{
                                        id: product.productId,
                                        name: product.productName,
                                        price: product.productPrice,
                                        image: product.productImages?.[0] || '/placeholder-image.jpg',
                                        category: product.txMethod === 'AUCTION' ? '경매' : '직거래',
                                        createdAt: product.createdAt
                                    }}
                                    onClick={() => handleProductClick(product)}
                                />
                            ))}
                        </div>

                        {/* 페이지네이션 */}
                        {pagination.totalPages > 1 && (
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}

                {/* 판매 등록 버튼 */}
                <div style={{
                    position: "fixed",
                    bottom: "30px",
                    right: "30px",
                    zIndex: 1000
                }}>
                    <button
                        onClick={() => navigate('/products/create')}
                        style={{
                            padding: "16px 24px",
                            backgroundColor: "#38d39f",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50px",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(56, 211, 159, 0.4)",
                            transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#2eb888";
                            e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#38d39f";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        + 판매 등록
                    </button>
                </div>
            </div>
        </div>
    );
}