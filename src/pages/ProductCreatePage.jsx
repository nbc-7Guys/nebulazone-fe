import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderNav from "../components/HeaderNav";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { catalogApi, productApi } from "../services/api";
import { JwtManager } from "../utils/JwtManager";

export default function ProductCreatePage() {
    const navigate = useNavigate();

    // 상태 관리
    const [step, setStep] = useState('category'); // 'category', 'product', 'form'
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCatalog, setSelectedCatalog] = useState(null);
    const [catalogs, setCatalogs] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 상품 폼 데이터
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        type: 'DIRECT',
        endTime: ''
    });

    // 이미지 업로드
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // 로그인 확인
    useEffect(() => {
        const jwt = JwtManager.getJwt();
        if (!jwt) {
            navigate('/login');
            return;
        }
    }, [navigate]);

    // 카테고리 선택 처리
    const handleCategorySelect = async (categoryType) => {
        setSelectedCategory(categoryType);
        setStep('product');
        setCatalogLoading(true);
        setError('');

        try {
            const response = await catalogApi.getCatalogs('', 1, 10, categoryType);
            setCatalogs(response.content || []);
        } catch (error) {
            console.error('카탈로그 조회 실패:', error);
            setError('제품 목록을 불러오는데 실패했습니다.');
            setCatalogs([]);
        } finally {
            setCatalogLoading(false);
        }
    };

    // 제품 선택 처리
    const handleProductSelect = (catalog) => {
        setSelectedCatalog(catalog);
        setFormData(prev => ({
            ...prev,
            name: catalog.catalogName
        }));
        setStep('form');
    };

    // 폼 데이터 변경 처리
    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 이미지 선택 처리
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            alert('최대 5개의 이미지만 업로드할 수 있습니다.');
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        // 미리보기 생성
        const newPreviews = [...imagePreviews];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews.push(e.target.result);
                setImagePreviews([...newPreviews]);
            };
            reader.readAsDataURL(file);
        });
    };

    // 이미지 삭제 처리
    const handleImageRemove = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    // 상품 등록 처리
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCatalog) {
            setError('제품을 선택해주세요.');
            return;
        }

        if (!formData.name || !formData.description || !formData.price) {
            setError('모든 필수 정보를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseInt(formData.price), // Long으로 변환됨
                type: formData.type,
                endTime: formData.endTime || null // 입력하지 않으면 null
            };

            await productApi.createProduct(selectedCatalog.catalogId, productData, images);
            
            alert('상품이 성공적으로 등록되었습니다!');
            navigate('/');

        } catch (error) {
            console.error('상품 등록 실패:', error);
            setError('상품 등록에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    // 뒤로 가기 처리
    const handleBack = () => {
        if (step === 'form') {
            setStep('product');
        } else if (step === 'product') {
            setStep('category');
            setSelectedCategory('');
            setCatalogs([]);
        } else {
            navigate('/');
        }
    };

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <HeaderNav />

            <div style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "40px 20px"
            }}>
                {/* 헤더 */}
                <div style={{ marginBottom: "40px" }}>
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
                        {step === 'category' && '카테고리를 선택해주세요'}
                        {step === 'product' && `${selectedCategory} 제품을 선택해주세요`}
                        {step === 'form' && '상품 정보를 입력해주세요'}
                    </p>
                </div>

                {/* 단계 표시 */}
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "40px"
                }}>
                    {['category', 'product', 'form'].map((stepName, index) => (
                        <div key={stepName} style={{ display: "flex", alignItems: "center" }}>
                            <div style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: step === stepName ? "#38d39f" : 
                                    ['category', 'product', 'form'].indexOf(step) > index ? "#38d39f" : "#e2e8f0",
                                color: step === stepName || ['category', 'product', 'form'].indexOf(step) > index ? "#fff" : "#9ca3af",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                fontWeight: "600"
                            }}>
                                {index + 1}
                            </div>
                            {index < 2 && (
                                <div style={{
                                    width: "60px",
                                    height: "2px",
                                    backgroundColor: ['category', 'product', 'form'].indexOf(step) > index ? "#38d39f" : "#e2e8f0",
                                    margin: "0 16px"
                                }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <ErrorMessage
                        message={error}
                        onRetry={() => setError('')}
                        retryText="확인"
                        style={{ marginBottom: "24px" }}
                    />
                )}

                {/* 컨텐츠 */}
                <div style={{
                    backgroundColor: "#fff",
                    padding: "32px",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                    {/* 1단계: 카테고리 선택 */}
                    {step === 'category' && (
                        <div>
                            <h2 style={{
                                fontSize: "24px",
                                fontWeight: "600",
                                marginBottom: "24px",
                                color: "#1a202c"
                            }}>
                                카테고리를 선택하세요
                            </h2>

                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: "20px"
                            }}>
                                {['CPU', 'GPU', 'SSD'].map(category => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategorySelect(category)}
                                        style={{
                                            padding: "40px 20px",
                                            border: "2px solid #e2e8f0",
                                            borderRadius: "12px",
                                            backgroundColor: "#fff",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            textAlign: "center"
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
                                            fontSize: "32px",
                                            marginBottom: "12px"
                                        }}>
                                            {category === 'CPU' && '🔧'}
                                            {category === 'GPU' && '🎮'}
                                            {category === 'SSD' && '💾'}
                                        </div>
                                        <div style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#1a202c"
                                        }}>
                                            {category}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2단계: 제품 선택 */}
                    {step === 'product' && (
                        <div>
                            <h2 style={{
                                fontSize: "24px",
                                fontWeight: "600",
                                marginBottom: "24px",
                                color: "#1a202c"
                            }}>
                                {selectedCategory} 제품을 선택하세요
                            </h2>

                            {catalogLoading ? (
                                <LoadingSpinner message="제품 목록을 불러오는 중..." />
                            ) : catalogs.length === 0 ? (
                                <div style={{
                                    textAlign: "center",
                                    padding: "40px",
                                    color: "#718096"
                                }}>
                                    등록된 {selectedCategory} 제품이 없습니다.
                                </div>
                            ) : (
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                                    gap: "16px"
                                }}>
                                    {catalogs.map(catalog => (
                                        <button
                                            key={catalog.catalogId}
                                            onClick={() => handleProductSelect(catalog)}
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
                                                color: "#1a202c"
                                            }}>
                                                {catalog.catalogName}
                                            </div>
                                            {catalog.catalogDescription && (
                                                <div style={{
                                                    fontSize: "14px",
                                                    color: "#718096",
                                                    marginBottom: "8px"
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
                            )}
                        </div>
                    )}

                    {/* 3단계: 상품 정보 입력 */}
                    {step === 'form' && (
                        <form onSubmit={handleSubmit}>
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
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => handleFormChange('price', e.target.value)}
                                    placeholder="가격을 입력하세요"
                                    required
                                    min="0"
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

                            {/* 경매 종료시간 (경매일 때만 표시) */}
                            {formData.type === 'AUCTION' && (
                                <div style={{ marginBottom: "24px" }}>
                                    <label style={{
                                        display: "block",
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        marginBottom: "8px",
                                        color: "#374151"
                                    }}>
                                        경매 종료시간 (선택사항)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.endTime}
                                        onChange={(e) => handleFormChange('endTime', e.target.value)}
                                        min={new Date().toISOString().slice(0, 16)} // 현재 시간 이후만 선택 가능
                                        style={{
                                            width: "100%",
                                            padding: "12px 16px",
                                            border: "1px solid #d1d5db",
                                            borderRadius: "8px",
                                            fontSize: "16px",
                                            outline: "none"
                                        }}
                                    />
                                    <div style={{
                                        fontSize: "12px",
                                        color: "#6b7280",
                                        marginTop: "4px"
                                    }}>
                                        종료시간을 설정하지 않으면 무기한 경매로 진행됩니다.
                                    </div>
                                </div>
                            )}

                            {/* 이미지 업로드 */}
                            <div style={{ marginBottom: "32px" }}>
                                <label style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    marginBottom: "8px",
                                    color: "#374151"
                                }}>
                                    상품 이미지 (선택사항, 최대 5개)
                                </label>
                                
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    style={{ display: "none" }}
                                    id="imageUpload"
                                />
                                
                                <label
                                    htmlFor="imageUpload"
                                    style={{
                                        display: "inline-block",
                                        padding: "12px 24px",
                                        backgroundColor: "#f7fafc",
                                        border: "2px dashed #d1d5db",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        color: "#4a5568",
                                        marginBottom: "16px"
                                    }}
                                >
                                    📷 이미지 선택
                                </label>

                                {/* 이미지 미리보기 */}
                                {imagePreviews.length > 0 && (
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                                        gap: "12px"
                                    }}>
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} style={{ position: "relative" }}>
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    style={{
                                                        width: "100%",
                                                        height: "120px",
                                                        objectFit: "cover",
                                                        borderRadius: "8px",
                                                        border: "1px solid #e2e8f0"
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleImageRemove(index)}
                                                    style={{
                                                        position: "absolute",
                                                        top: "4px",
                                                        right: "4px",
                                                        width: "24px",
                                                        height: "24px",
                                                        backgroundColor: "rgba(0,0,0,0.7)",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "50%",
                                                        cursor: "pointer",
                                                        fontSize: "12px"
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 등록 버튼 */}
                            <div style={{
                                display: "flex",
                                gap: "12px",
                                justifyContent: "flex-end"
                            }}>
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    style={{
                                        padding: "12px 24px",
                                        backgroundColor: "#f7fafc",
                                        color: "#4a5568",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        cursor: "pointer"
                                    }}
                                >
                                    이전
                                </button>
                                
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: "12px 32px",
                                        backgroundColor: loading ? "#9ca3af" : "#38d39f",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        fontWeight: "600",
                                        cursor: loading ? "not-allowed" : "pointer",
                                        minWidth: "120px"
                                    }}
                                >
                                    {loading ? (
                                        <LoadingSpinner size="small" color="#fff" />
                                    ) : (
                                        '상품 등록'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}