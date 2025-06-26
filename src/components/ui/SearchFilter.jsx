import React from 'react';
import FormInput from './FormInput';
import Button from './Button';
import Card from './Card';

const SearchFilter = ({
    searchForm,
    onFormChange,
    onSearch,
    loading = false,
    showPriceFilter = true,
    showSellerFilter = true,
    showTypeFilter = false,
    typeOptions = [],
    placeholder = "상품명 검색...",
    className = '',
    style = {}
}) => {
    const handleInputChange = (field) => (e) => {
        onFormChange(field, e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    const handleClearFilters = () => {
        const clearedForm = {
            ...searchForm,
            productname: '',
            sellernickname: '',
            priceFrom: '',
            priceTo: '',
            page: 1
        };
        
        Object.keys(clearedForm).forEach(key => {
            if (key !== 'type' && key !== 'page' && key !== 'size') {
                onFormChange(key, '');
            }
        });
        onFormChange('page', 1);
    };

    const hasActiveFilters = searchForm.productname || searchForm.sellernickname || 
                           searchForm.priceFrom || searchForm.priceTo;

    return (
        <Card className={className} style={style}>
            <div style={{
                display: "grid",
                gridTemplateColumns: showSellerFilter ? "1fr 1fr auto" : "1fr auto",
                gap: "12px",
                alignItems: "center"
            }}>
                <FormInput
                    type="text"
                    placeholder={placeholder}
                    value={searchForm.productname || ''}
                    onChange={handleInputChange('productname')}
                    onKeyPress={handleKeyPress}
                    style={{ marginBottom: 0 }}
                />

                {showSellerFilter && (
                    <FormInput
                        type="text"
                        placeholder="판매자 닉네임 검색..."
                        value={searchForm.sellernickname || ''}
                        onChange={handleInputChange('sellernickname')}
                        onKeyPress={handleKeyPress}
                        style={{ marginBottom: 0 }}
                    />
                )}

                {showTypeFilter && (
                    <select
                        value={searchForm.type || ''}
                        onChange={handleInputChange('type')}
                        style={{
                            padding: "12px 16px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            outline: "none"
                        }}
                    >
                        {typeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                )}

                <Button
                    onClick={onSearch}
                    loading={loading}
                    disabled={loading}
                    variant="primary"
                >
                    {loading ? "검색 중..." : "검색"}
                </Button>
            </div>

            {showPriceFilter && (
                <div style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    marginTop: "16px",
                    paddingTop: "16px",
                    borderTop: "1px solid #e2e8f0"
                }}>
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>가격 범위:</span>
                    
                    <FormInput
                        type="number"
                        placeholder="최소 가격"
                        value={searchForm.priceFrom || ''}
                        onChange={handleInputChange('priceFrom')}
                        style={{ 
                            marginBottom: 0,
                            width: "120px"
                        }}
                    />
                    
                    <span style={{ color: "#718096" }}>~</span>
                    
                    <FormInput
                        type="number"
                        placeholder="최대 가격"
                        value={searchForm.priceTo || ''}
                        onChange={handleInputChange('priceTo')}
                        style={{ 
                            marginBottom: 0,
                            width: "120px"
                        }}
                    />

                    {hasActiveFilters && (
                        <Button
                            onClick={handleClearFilters}
                            variant="ghost"
                            size="small"
                        >
                            초기화
                        </Button>
                    )}
                </div>
            )}
        </Card>
    );
};

export default SearchFilter;