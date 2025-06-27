import React from 'react';

const PageHeader = ({ step, selectedCategory, totalElements, onBack }) => {
    const getDescription = () => {
        switch (step) {
            case 'category':
                return '카테고리를 선택해주세요';
            case 'product':
                return `${selectedCategory} 제품을 선택해주세요 (${totalElements}개 제품)`;
            case 'form':
                return '상품 정보를 입력해주세요';
            default:
                return '';
        }
    };

    return (
        <div style={{
            textAlign: "center",
            marginBottom: "40px"
        }}>
            <button
                onClick={onBack}
                style={{
                    padding: "8px 16px",
                    backgroundColor: "#e2e8f0",
                    color: "#4a5568",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    cursor: "pointer",
                    marginBottom: "20px"
                }}
            >
                ← 뒤로가기
            </button>

            <h1 style={{
                fontSize: "32px",
                fontWeight: "bold",
                marginBottom: "8px",
                color: "#1a202c"
            }}>
                중고상품 등록
            </h1>
            <p style={{
                fontSize: "16px",
                color: "#718096"
            }}>
                {getDescription()}
            </p>
        </div>
    );
};

export default PageHeader;