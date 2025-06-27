import React from 'react';
import LoadingSpinner from '../../ui/LoadingSpinner';
import Pagination from '../../ui/Pagination';

const ProductSelector = ({
    selectedCategory,
    catalogs,
    catalogLoading,
    searchKeyword,
    setSearchKeyword,
    onSearch,
    onProductSelect,
    onClearSearch,
    loadCatalogs,
    currentPage,
    totalPages,
    setCurrentPage
}) => {
    const handleSearch = (e) => {
        e.preventDefault();
        onSearch();
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            loadCatalogs(selectedCategory, searchKeyword, newPage);
        }
    };

    return (
        <div>
            <h2 style={{
                fontSize: "24px",
                fontWeight: "600",
                marginBottom: "24px",
                color: "#1a202c"
            }}>
                {selectedCategory} 제품을 선택하세요
            </h2>

            {/* 검색바 */}
            <form onSubmit={handleSearch} style={{ marginBottom: "24px" }}>
                <div style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center"
                }}>
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="제품명을 검색하세요..."
                        style={{
                            flex: 1,
                            padding: "12px 16px",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "16px",
                            outline: "none"
                        }}
                    />
                    <button
                        type="submit"
                        disabled={catalogLoading}
                        style={{
                            padding: "12px 24px",
                            backgroundColor: catalogLoading ? "#9ca3af" : "#38d39f",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "16px",
                            cursor: catalogLoading ? "not-allowed" : "pointer",
                            fontWeight: "600"
                        }}
                    >
                        🔍 검색
                    </button>
                    {searchKeyword && (
                        <button
                            type="button"
                            onClick={onClearSearch}
                            style={{
                                padding: "12px 16px",
                                backgroundColor: "#f7fafc",
                                color: "#4a5568",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                fontSize: "14px",
                                cursor: "pointer"
                            }}
                        >
                            초기화
                        </button>
                    )}
                </div>
            </form>

            {/* 제품 목록 */}
            {catalogLoading ? (
                <LoadingSpinner message="제품 목록을 불러오는 중..." />
            ) : catalogs.length === 0 ? (
                <div style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#718096"
                }}>
                    {searchKeyword ?
                        `"${searchKeyword}"에 대한 검색 결과가 없습니다.` :
                        `등록된 ${selectedCategory} 제품이 없습니다.`
                    }
                </div>
            ) : (
                <>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "16px"
                    }}>
                        {catalogs.map(catalog => (
                            <button
                                key={catalog.catalogId}
                                onClick={() => onProductSelect(catalog)}
                                style={{
                                    padding: "20px",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    backgroundColor: "#fff",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    textAlign: "left"
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = "#38d39f";
                                    e.target.style.backgroundColor = "#f0fdf4";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = "#e2e8f0";
                                    e.target.style.backgroundColor = "#fff";
                                }}
                            >
                                <div style={{
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    marginBottom: "8px",
                                    color: "#1a202c",
                                    lineHeight: "1.4"
                                }}>
                                    {catalog.catalogName}
                                </div>
                                {catalog.catalogDescription && (
                                    <div style={{
                                        fontSize: "14px",
                                        color: "#718096",
                                        marginBottom: "8px",
                                        lineHeight: "1.4"
                                    }}>
                                        {catalog.catalogDescription}
                                    </div>
                                )}
                                <div style={{
                                    fontSize: "12px",
                                    color: "#a0aec0"
                                }}>
                                    {catalog.manufacturer && `제조사: ${catalog.manufacturer}`}
                                    {catalog.chipset && ` | 칩셋: ${catalog.chipset}`}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div style={{ marginTop: "24px" }}>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}
            
            {/* 키보드 단축키 안내 */}
            {!catalogLoading && catalogs.length > 0 && (
                <div className="text-center mt-8">
                    <p className="text-xs text-light">
                        💡 <strong>Tab</strong>: 제품 이동 | <strong>Enter/Space</strong>: 선택 | <strong>Ctrl+K</strong>: 검색 포커스
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProductSelector;