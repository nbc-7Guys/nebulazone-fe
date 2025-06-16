import React from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const delta = 2; // 현재 페이지 양쪽으로 보여줄 페이지 수
        const range = [];
        const rangeWithDots = [];

        // 시작과 끝 계산
        const start = Math.max(2, currentPage - delta);
        const end = Math.min(totalPages - 1, currentPage + delta);

        // 첫 번째 페이지는 항상 표시
        range.push(1);

        // 시작 부분에 ... 필요한지 확인
        if (start > 2) {
            range.push('...');
        }

        // 중간 페이지들
        for (let i = start; i <= end; i++) {
            range.push(i);
        }

        // 끝 부분에 ... 필요한지 확인
        if (end < totalPages - 1) {
            range.push('...');
        }

        // 마지막 페이지는 항상 표시 (totalPages > 1인 경우)
        if (totalPages > 1) {
            range.push(totalPages);
        }

        return range;
    };

    const pageNumbers = getPageNumbers();

    const handlePageClick = (page) => {
        if (page !== '...' && page !== currentPage && page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const handlePrevClick = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNextClick = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            marginTop: "40px",
            marginBottom: "20px"
        }}>
            {/* 이전 버튼 */}
            <button
                onClick={handlePrevClick}
                disabled={currentPage <= 1}
                style={{
                    padding: "8px 12px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#fff",
                    color: currentPage <= 1 ? "#a0aec0" : "#4a5568",
                    borderRadius: "6px",
                    cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                    if (currentPage > 1) {
                        e.target.style.backgroundColor = "#f7fafc";
                    }
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#fff";
                }}
            >
                &lt;
            </button>

            {/* 페이지 번호들 */}
            {pageNumbers.map((page, index) => (
                <React.Fragment key={index}>
                    {page === '...' ? (
                        <span style={{
                            padding: "8px 4px",
                            color: "#a0aec0",
                            fontSize: "14px"
                        }}>
                            ...
                        </span>
                    ) : (
                        <button
                            onClick={() => handlePageClick(page)}
                            style={{
                                padding: "8px 12px",
                                border: "1px solid #e2e8f0",
                                backgroundColor: page === currentPage ? "#38d39f" : "#fff",
                                color: page === currentPage ? "#fff" : "#4a5568",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: page === currentPage ? "600" : "400",
                                minWidth: "40px",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                if (page !== currentPage) {
                                    e.target.style.backgroundColor = "#f7fafc";
                                    e.target.style.borderColor = "#38d39f";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (page !== currentPage) {
                                    e.target.style.backgroundColor = "#fff";
                                    e.target.style.borderColor = "#e2e8f0";
                                }
                            }}
                        >
                            {page}
                        </button>
                    )}
                </React.Fragment>
            ))}

            {/* 다음 버튼 */}
            <button
                onClick={handleNextClick}
                disabled={currentPage >= totalPages}
                style={{
                    padding: "8px 12px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#fff",
                    color: currentPage >= totalPages ? "#a0aec0" : "#4a5568",
                    borderRadius: "6px",
                    cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                    if (currentPage < totalPages) {
                        e.target.style.backgroundColor = "#f7fafc";
                    }
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#fff";
                }}
            >
                &gt;
            </button>

            {/* 페이지 정보 */}
            <div style={{
                marginLeft: "16px",
                fontSize: "14px",
                color: "#718096"
            }}>
                {currentPage} / {totalPages} 페이지
            </div>
        </div>
    );
}