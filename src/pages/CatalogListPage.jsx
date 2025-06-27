import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import HeaderNav from '../components/layout/HeaderNav';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/ui/Pagination';
import CatalogCard from '../components/catalog/CatalogCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Breadcrumb from '../components/ui/Breadcrumb';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import { catalogApi } from '../services/api';

export default function CatalogListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // 상태 관리
    const [catalogs, setCatalogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 검색 및 필터 상태
    const [searchKeyword, setSearchKeyword] = useState(searchParams.get('keyword') || '');
    const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'CPU');

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 12;

    const catalogTypes = [
        { value: 'CPU', label: '프로세서' },
        { value: 'GPU', label: '그래픽카드' },
        { value: 'SSD', label: '저장장치' }
    ];

    // 카탈로그 목록 로드
    const loadCatalogs = async (keyword = '', type = 'CPU', page = 1) => {
        try {
            setLoading(true);
            setError('');
            
            const response = await catalogApi.getCatalogs(keyword, page, pageSize, type);
            setCatalogs(response.content || []);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
            setCurrentPage(page);

            // URL 쿼리 파라미터 업데이트
            const newSearchParams = new URLSearchParams();
            if (keyword) newSearchParams.set('keyword', keyword);
            if (type) newSearchParams.set('type', type);
            if (page > 1) newSearchParams.set('page', page.toString());
            setSearchParams(newSearchParams);

        } catch (error) {
            console.error('카탈로그 조회 실패:', error);
            setError('카탈로그 목록을 불러오는데 실패했습니다.');
            setCatalogs([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    // 검색 처리
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadCatalogs(searchKeyword, selectedType, 1);
    };

    // 타입 변경 처리
    const handleTypeChange = (newType) => {
        setSelectedType(newType);
        setCurrentPage(1);
        loadCatalogs(searchKeyword, newType, 1);
    };

    // 페이지 변경 처리
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            loadCatalogs(searchKeyword, selectedType, newPage);
        }
    };

    // 검색 초기화
    const handleClearSearch = () => {
        setSearchKeyword('');
        setCurrentPage(1);
        loadCatalogs('', selectedType, 1);
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        const keyword = searchParams.get('keyword') || '';
        const type = searchParams.get('type') || 'CPU';
        const page = parseInt(searchParams.get('page')) || 1;
        
        setSearchKeyword(keyword);
        setSelectedType(type);
        setCurrentPage(page);
        
        loadCatalogs(keyword, type, page);
    }, []);

    // 키보드 단축키 설정
    useKeyboardShortcuts({
        'ctrl+k': (e) => {
            e.preventDefault();
            const searchInput = document.querySelector('input[type="text"]');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        },
        'meta+k': (e) => { // Mac용
            e.preventDefault();
            const searchInput = document.querySelector('input[type="text"]');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        },
        'escape': () => {
            if (searchKeyword) {
                handleClearSearch();
            }
        },
        'ctrl+1': () => handleTypeChange('CPU'),
        'ctrl+2': () => handleTypeChange('GPU'),
        'ctrl+3': () => handleTypeChange('SSD')
    });

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
                <Breadcrumb />
                
                {/* 페이지 헤더 */}
                <div style={{
                    textAlign: "center",
                    marginBottom: "40px"
                }}>
                    <h1 style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginBottom: "8px",
                        color: "#1a202c"
                    }}>
                        제품 카탈로그
                    </h1>
                    <p style={{
                        fontSize: "16px",
                        color: "#718096"
                    }}>
                        다양한 컴퓨터 부품의 상세 정보와 사용자 리뷰를 확인하세요
                    </p>
                    
                    {/* 키보드 단축키 도움말 */}
                    <div style={{
                        fontSize: "12px",
                        color: "#9ca3af",
                        textAlign: "center",
                        marginTop: "8px"
                    }}>
                        💡 <strong>Ctrl+K</strong>: 검색 포커스 | <strong>Esc</strong>: 검색 초기화 | <strong>Ctrl+1~3</strong>: 카테고리 선택 | <strong>Alt+S</strong>: 메인 컨텐츠로 이동
                    </div>
                </div>

                {/* 검색 및 필터 */}
                <div style={{
                    backgroundColor: "#fff",
                    padding: "24px",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    marginBottom: "24px"
                }}>
                    {/* 타입 선택 */}
                    <div style={{ marginBottom: "20px" }}>
                        <div style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "8px",
                            color: "#374151"
                        }}>
                            카테고리
                        </div>
                        <div style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px"
                        }}>
                            {catalogTypes.map((type, index) => (
                                <button
                                    key={type.value}
                                    onClick={() => handleTypeChange(type.value)}
                                    className="smooth-transition"
                                    aria-label={`${type.label} 카테고리 선택`}
                                    aria-pressed={selectedType === type.value}
                                    tabIndex={10 + index}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: selectedType === type.value 
                                            ? "linear-gradient(135deg, #38d39f, #2eb888)" 
                                            : "#fff",
                                        background: selectedType === type.value 
                                            ? "linear-gradient(135deg, #38d39f, #2eb888)" 
                                            : "#fff",
                                        color: selectedType === type.value ? "#fff" : "#4a5568",
                                        border: selectedType === type.value ? "none" : "2px solid #e2e8f0",
                                        borderRadius: "25px",
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        fontWeight: selectedType === type.value ? "600" : "500",
                                        boxShadow: selectedType === type.value 
                                            ? "0 4px 15px rgba(56, 211, 159, 0.3)" 
                                            : "0 2px 8px rgba(0,0,0,0.1)",
                                        transform: selectedType === type.value ? "translateY(-1px)" : "translateY(0)",
                                        animationDelay: `${index * 0.05}s`,
                                        outline: "none"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedType !== type.value) {
                                            e.target.style.borderColor = "#38d39f";
                                            e.target.style.transform = "translateY(-1px)";
                                            e.target.style.boxShadow = "0 4px 12px rgba(56, 211, 159, 0.2)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedType !== type.value) {
                                            e.target.style.borderColor = "#e2e8f0";
                                            e.target.style.transform = "translateY(0)";
                                            e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                                        }
                                    }}
                                    onFocus={(e) => {
                                        if (selectedType !== type.value) {
                                            e.target.style.borderColor = "#38d39f";
                                            e.target.style.boxShadow = "0 0 0 3px rgba(56, 211, 159, 0.2), 0 2px 8px rgba(0,0,0,0.1)";
                                        } else {
                                            e.target.style.boxShadow = "0 0 0 3px rgba(255, 255, 255, 0.5), 0 4px 15px rgba(56, 211, 159, 0.3)";
                                        }
                                    }}
                                    onBlur={(e) => {
                                        if (selectedType !== type.value) {
                                            e.target.style.borderColor = "#e2e8f0";
                                            e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                                        } else {
                                            e.target.style.boxShadow = "0 4px 15px rgba(56, 211, 159, 0.3)";
                                        }
                                    }}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 검색바 */}
                    <form onSubmit={handleSearch}>
                        <div style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "center"
                        }}>
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="제품명이나 설명으로 검색하세요..."
                                aria-label="제품 검색"
                                tabIndex={1}
                                style={{
                                    flex: 1,
                                    padding: "12px 16px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    outline: "none",
                                    transition: "border-color 0.2s ease, box-shadow 0.2s ease"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#38d39f";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(56, 211, 159, 0.1)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#d1d5db";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="smooth-transition"
                                aria-label="검색 실행"
                                tabIndex={2}
                                style={{
                                    padding: "12px 24px",
                                    background: loading 
                                        ? "#9ca3af" 
                                        : "linear-gradient(135deg, #38d39f, #2eb888)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "12px",
                                    fontSize: "14px",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    fontWeight: "600",
                                    boxShadow: loading 
                                        ? "none" 
                                        : "0 4px 15px rgba(56, 211, 159, 0.3)",
                                    transform: loading ? "none" : "translateY(0)",
                                    outline: "none"
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.target.style.transform = "translateY(-2px)";
                                        e.target.style.boxShadow = "0 6px 20px rgba(56, 211, 159, 0.4)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) {
                                        e.target.style.transform = "translateY(0)";
                                        e.target.style.boxShadow = "0 4px 15px rgba(56, 211, 159, 0.3)";
                                    }
                                }}
                                onFocus={(e) => {
                                    if (!loading) {
                                        e.target.style.boxShadow = "0 0 0 3px rgba(56, 211, 159, 0.3), 0 4px 15px rgba(56, 211, 159, 0.3)";
                                    }
                                }}
                                onBlur={(e) => {
                                    if (!loading) {
                                        e.target.style.boxShadow = "0 4px 15px rgba(56, 211, 159, 0.3)";
                                    }
                                }}
                            >
                                {loading ? "🔄 검색 중..." : "🔍 검색"}
                            </button>
                            {searchKeyword && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    aria-label="검색 초기화"
                                    tabIndex={3}
                                    style={{
                                        padding: "12px 16px",
                                        backgroundColor: "#f7fafc",
                                        color: "#4a5568",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        outline: "none",
                                        transition: "all 0.2s ease"
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = "#38d39f";
                                        e.target.style.boxShadow = "0 0 0 3px rgba(56, 211, 159, 0.1)";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = "#e2e8f0";
                                        e.target.style.boxShadow = "none";
                                    }}
                                >
                                    초기화
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* 결과 헤더 */}
                {!loading && (
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px"
                    }}>
                        <div style={{
                            fontSize: "16px",
                            color: "#4a5568"
                        }}>
                            총 {totalElements}개의 제품
                            {searchKeyword && ` (${searchKeyword} 검색 결과)`}
                        </div>
                        <div style={{
                            fontSize: "14px",
                            color: "#6b7280"
                        }}>
                            페이지 {currentPage} / {totalPages}
                        </div>
                    </div>
                )}

                {/* 에러 메시지 */}
                {error && (
                    <ErrorMessage
                        message={error}
                        onRetry={() => loadCatalogs(searchKeyword, selectedType, currentPage)}
                        style={{ marginBottom: "24px" }}
                    />
                )}

                {/* 카탈로그 목록 */}
                {loading ? (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "20px",
                        marginBottom: "40px"
                    }}>
                        {Array.from({ length: 8 }, (_, index) => (
                            <div
                                key={index}
                                className="card-enter"
                                style={{
                                    animationDelay: `${index * 0.1}s`
                                }}
                            >
                                <SkeletonCard />
                            </div>
                        ))}
                    </div>
                ) : catalogs.length === 0 ? (
                    <div className="fade-in" style={{
                        textAlign: "center",
                        padding: "80px 20px",
                        background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
                        borderRadius: "20px",
                        border: "2px dashed #cbd5e0"
                    }}>
                        <div style={{
                            fontSize: "120px",
                            marginBottom: "20px",
                            animation: "bounce 2s infinite"
                        }}>
                            {searchKeyword ? "🔍" : "📦"}
                        </div>
                        <h3 style={{
                            fontSize: "24px",
                            fontWeight: "600",
                            color: "#2d3748",
                            marginBottom: "12px"
                        }}>
                            {searchKeyword ? "검색 결과가 없습니다" : "등록된 제품이 없습니다"}
                        </h3>
                        <p style={{
                            fontSize: "16px",
                            color: "#718096",
                            marginBottom: "30px",
                            lineHeight: "1.6"
                        }}>
                            {searchKeyword ? 
                                `"${searchKeyword}"에 대한 검색 결과를 찾을 수 없습니다.\n다른 키워드로 시도해보세요.` : 
                                "아직 등록된 제품이 없습니다.\n곧 다양한 제품들이 추가될 예정입니다."
                            }
                        </p>
                        {searchKeyword && (
                            <button
                                onClick={handleClearSearch}
                                className="btn-click smooth-transition"
                                style={{
                                    padding: "12px 24px",
                                    background: "linear-gradient(135deg, #38d39f, #2eb888)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "12px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 15px rgba(56, 211, 159, 0.3)"
                                }}
                            >
                                🔄 검색 초기화
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                            gap: "20px",
                            marginBottom: "40px"
                        }}>
                            {catalogs.map((catalog, index) => (
                                <div
                                    key={catalog.catalogId}
                                    className="card-enter"
                                    style={{
                                        animationDelay: `${index * 0.1}s`
                                    }}
                                >
                                    <CatalogCard catalog={catalog} />
                                </div>
                            ))}
                        </div>

                        {/* 페이지네이션 */}
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}