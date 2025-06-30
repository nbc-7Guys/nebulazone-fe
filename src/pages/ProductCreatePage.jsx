import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderNav from "../components/layout/HeaderNav";
import ErrorMessage from "../components/common/ErrorMessage";
import { catalogApi, productApi } from "../services/api";
import { JwtManager } from "../services/managers/JwtManager";
import {
    StepIndicator,
    PageHeader,
    CategorySelector,
    ProductSelector,
    ProductForm
} from "../components/product/create";

export default function ProductCreatePage() {
    const navigate = useNavigate();

    // 기본 상태 관리
    const [step, setStep] = useState('category');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCatalog, setSelectedCatalog] = useState(null);
    const [catalogs, setCatalogs] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 페이징 및 검색 상태
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 12;

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

    // 로그인 확인
    useEffect(() => {
        const jwt = JwtManager.getJwt();
        if (!jwt) {
            navigate('/login');
            return;
        }
    }, [navigate]);

    // 카탈로그 데이터 로드 함수
    const loadCatalogs = async (categoryType, keyword = '', page = 1) => {
        setCatalogLoading(true);
        setError('');

        try {
            const response = await catalogApi.getCatalogs(keyword, page, pageSize, categoryType);
            setCatalogs(response.content || []);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
            setCurrentPage(page);
        } catch (error) {
            console.error('카탈로그 조회 실패:', error);
            setError('제품 목록을 불러오는데 실패했습니다.');
            setCatalogs([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setCatalogLoading(false);
        }
    };

    // 카테고리 선택 처리
    const handleCategorySelect = async (categoryType) => {
        setSelectedCategory(categoryType);
        setStep('product');
        setCurrentPage(1);
        setSearchKeyword('');
        await loadCatalogs(categoryType, '', 1);
    };

    // 검색 처리
    const handleSearch = () => {
        setCurrentPage(1);
        loadCatalogs(selectedCategory, searchKeyword, 1);
    };

    // 검색 초기화
    const handleClearSearch = () => {
        setSearchKeyword('');
        setCurrentPage(1);
        loadCatalogs(selectedCategory, '', 1);
    };

    // 제품 선택 처리
    const handleProductSelect = (catalog) => {
        setSelectedCatalog(catalog);
        setStep('form');
    };

    // 폼 데이터 변경 처리
    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 뒤로가기 처리
    const handleBack = () => {
        if (step === 'product') {
            setStep('category');
            setSelectedCategory('');
            setCatalogs([]);
        } else if (step === 'form') {
            setStep('product');
            setSelectedCatalog(null);
        } else {
            navigate(-1);
        }
    };

    // 폼에서 이전 버튼 처리
    const handleFormBack = () => {
        setStep('product');
        setSelectedCatalog(null);
    };

    // 상품 등록 처리
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCatalog) {
            setError('제품을 선택해주세요.');
            return;
        }

        if (!formData.name || !formData.description || !formData.price) {
            setError('모든 필수 항목을 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 경매 종료시간 계산
            let endTime = null;
            if (formData.type === 'AUCTION' && formData.endTime) {
                const now = new Date();
                const endTimeDate = new Date(now);

                switch (formData.endTime) {
                    case 'minute_1':
                        endTimeDate.setMinutes(endTimeDate.getMinutes() + 1);
                        break;
                    case 'hour_12':
                        endTimeDate.setHours(endTimeDate.getHours() + 12);
                        break;
                    case 'hour_24':
                        endTimeDate.setHours(endTimeDate.getHours() + 24);
                        break;
                    case 'day_3':
                        endTimeDate.setDate(endTimeDate.getDate() + 3);
                        break;
                    default:
                        endTimeDate.setMinutes(endTimeDate.getMinutes() + 1);
                }

                endTime = endTimeDate.toISOString();
            }

            const productData = {
                catalogId: selectedCatalog.catalogId,
                name: formData.name,
                description: formData.description,
                price: parseInt(formData.price),
                type: formData.type,
                ...(endTime && { endTime })
            };

            // 1단계: 상품 등록 (multipart, 이미지 제외)
            const response = await productApi.createProduct(
                selectedCatalog.catalogId,
                productData
            );

            // 2단계: 이미지가 있으면 별도 업로드
            if (images && images.length > 0) {
                console.log('이미지 업로드 시작:', {
                    catalogId: selectedCatalog.catalogId,
                    productId: response.productId,
                    imageCount: images.length
                });
                try {
                    const imageResponse = await productApi.updateProductImages(
                        selectedCatalog.catalogId,
                        response.productId,
                        images
                    );
                    console.log('이미지 업로드 성공:', imageResponse);
                } catch (imageError) {
                    console.error('이미지 업로드 실패:', imageError);
                    console.error('이미지 업로드 실패 상세:', {
                        catalogId: selectedCatalog.catalogId,
                        productId: response.productId,
                        error: imageError.message,
                        stack: imageError.stack
                    });
                    // 상품은 등록되었지만 이미지 업로드 실패 시 알림
                    setError(`상품은 성공적으로 등록되었습니다! 하지만 이미지 업로드에 실패했습니다. 상품 수정에서 이미지를 다시 업로드해주세요.`);
                    
                    // 이미지 업로드가 실패해도 상품 등록은 성공했으므로 페이지 이동
                    setTimeout(() => {
                        if (formData.type === 'DIRECT') {
                            navigate(`/products/direct/${response.productId}?catalogId=${selectedCatalog.catalogId}`);
                        } else {
                            navigate(`/products/auction/${response.productId}`);
                        }
                    }, 3000);  // 3초 후 자동 이동
                }
            } else {
                console.log('업로드할 이미지가 없습니다:', { images });
            }

            console.log('상품 등록 성공:', response);
            
            // 성공 시 해당 상품 상세 페이지로 이동
            if (formData.type === 'DIRECT') {
                navigate(`/products/direct/${response.productId}?catalogId=${selectedCatalog.catalogId}`);
            } else {
                navigate(`/products/auction/${response.productId}`);
            }

        } catch (error) {
            console.error('상품 등록 실패:', error);
            setError(error.message || '상품 등록에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#f8fafc"
        }}>
            <HeaderNav />
            
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "40px 20px"
            }}>
                <PageHeader
                    step={step}
                    selectedCategory={selectedCategory}
                    totalElements={totalElements}
                    onBack={handleBack}
                />

                <StepIndicator currentStep={step} />

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
                        <CategorySelector onCategorySelect={handleCategorySelect} />
                    )}

                    {/* 2단계: 제품 선택 */}
                    {step === 'product' && (
                        <ProductSelector
                            selectedCategory={selectedCategory}
                            catalogs={catalogs}
                            catalogLoading={catalogLoading}
                            searchKeyword={searchKeyword}
                            setSearchKeyword={setSearchKeyword}
                            onSearch={handleSearch}
                            onProductSelect={handleProductSelect}
                            onClearSearch={handleClearSearch}
                            loadCatalogs={loadCatalogs}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            setCurrentPage={setCurrentPage}
                        />
                    )}

                    {/* 3단계: 상품 정보 입력 */}
                    {step === 'form' && (
                        <ProductForm
                            selectedCatalog={selectedCatalog}
                            formData={formData}
                            handleFormChange={handleFormChange}
                            images={images}
                            setImages={setImages}
                            onSubmit={handleSubmit}
                            loading={loading}
                            onBack={handleFormBack}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}