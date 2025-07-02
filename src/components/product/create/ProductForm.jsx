import React from 'react';
import ImageUploader from '../../common/ImageUploader';

const ProductForm = ({
    selectedCatalog,
    formData,
    handleFormChange,
    images,
    setImages,
    onSubmit,
    loading,
    onBack
}) => {
    const auctionDurationOptions = [
        { value: 'MINUTE_1', label: '1분 (테스트용)' },
        { value: 'HOUR_12', label: '12시간' },
        { value: 'HOUR_24', label: '24시간' },
        { value: 'DAY_3', label: '3일' }
    ];

    return (
        <form onSubmit={onSubmit}>
            <h2 style={{
                fontSize: "24px",
                fontWeight: "600",
                marginBottom: "24px",
                color: "#1a202c"
            }}>
                상품 정보를 입력하세요
            </h2>

            {/* 선택된 제품 정보 */}
            <div style={{
                backgroundColor: "#f7fafc",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "24px",
                border: "1px solid #e2e8f0"
            }}>
                <div style={{
                    fontSize: "14px",
                    color: "#4a5568",
                    marginBottom: "4px"
                }}>
                    선택된 제품
                </div>
                <div style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1a202c"
                }}>
                    {selectedCatalog?.catalogName}
                </div>
            </div>

            {/* 거래 유형 */}
            <div style={{ marginBottom: "24px" }}>
                <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151"
                }}>
                    거래 유형 *
                </label>
                <div style={{ display: "flex", gap: "12px" }}>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                        <input
                            type="radio"
                            name="type"
                            value="DIRECT"
                            checked={formData.type === 'DIRECT'}
                            onChange={(e) => handleFormChange('type', e.target.value)}
                            style={{ marginRight: "8px" }}
                        />
                        직거래
                    </label>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                        <input
                            type="radio"
                            name="type"
                            value="AUCTION"
                            checked={formData.type === 'AUCTION'}
                            onChange={(e) => handleFormChange('type', e.target.value)}
                            style={{ marginRight: "8px" }}
                        />
                        경매
                    </label>
                </div>
            </div>

            {/* 상품명 */}
            <div style={{ marginBottom: "24px" }}>
                <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151"
                }}>
                    상품명 *
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="상품명을 입력하세요"
                    required
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "16px",
                        outline: "none"
                    }}
                />
            </div>

            {/* 상품 설명 */}
            <div style={{ marginBottom: "24px" }}>
                <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151"
                }}>
                    상품 설명 *
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="상품에 대한 자세한 설명을 입력하세요"
                    required
                    rows={4}
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "16px",
                        outline: "none",
                        resize: "vertical"
                    }}
                />
            </div>

            {/* 가격 */}
            <div style={{ marginBottom: "24px" }}>
                <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151"
                }}>
                    {formData.type === 'AUCTION' ? '경매 시작가 *' : '판매가격 *'}
                </label>
                <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => {
                        const value = e.target.value;
                        // 숫자와 콤마만 허용
                        const numericValue = value.replace(/[^0-9]/g, '');
                        const formattedValue = numericValue ? parseInt(numericValue).toLocaleString() : '';
                        handleFormChange('price', formattedValue);
                    }}
                    placeholder="가격을 입력하세요 (예: 50,000)"
                    required
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "16px",
                        outline: "none"
                    }}
                />
            </div>

            {/* 경매 종료시간 안내 및 선택 */}
            {formData.type === 'AUCTION' && (
                <>
                    <div style={{ 
                        marginBottom: '1rem',
                        padding: '1rem',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6'
                    }}>
                        <div style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            💡 경매 종료 시간 안내
                        </div>
                        <div style={{ color: '#495057', fontSize: '0.85rem' }}>
                            • 현재 시간: {new Date().toLocaleString('ko-KR')}
                            <br />
                            • 선택한 기간 후에 자동으로 경매가 종료됩니다
                            <br />
                            • 테스트용 1분 옵션도 제공합니다
                            <br />
                            • 경매는 등록 즉시 시작됩니다
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "8px",
                            color: "#374151"
                        }}>
                            경매 기간 *
                        </label>
                        <select
                            value={formData.endTime}
                            onChange={(e) => handleFormChange('endTime', e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                fontSize: "16px",
                                outline: "none",
                                backgroundColor: "#fff"
                            }}
                        >
                            <option value="">경매 기간을 선택하세요</option>
                            {auctionDurationOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
            )}

            {/* 이미지 업로드 */}
            <div style={{ marginBottom: "24px" }}>
                <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151"
                }}>
                    상품 이미지 (최대 5개)
                </label>
                <ImageUploader
                    onImagesChange={setImages}
                    maxImages={5}
                />
            </div>

            {/* 버튼 */}
            <div style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "32px"
            }}>
                <button
                    type="button"
                    onClick={onBack}
                    style={{
                        padding: "12px 24px",
                        backgroundColor: "#f7fafc",
                        color: "#4a5568",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "16px",
                        cursor: "pointer",
                        fontWeight: "600"
                    }}
                >
                    이전
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "12px 24px",
                        backgroundColor: loading ? "#9ca3af" : "#38d39f",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "16px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "600"
                    }}
                >
                    {loading ? "등록 중..." : "상품 등록"}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;