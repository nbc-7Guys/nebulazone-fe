import { apiRequest, publicApiRequest } from './core';

const productApi = {
    // 상품 목록 조회 (공개)
    getProducts: async (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params.keyword) queryParams.append('keyword', params.keyword);
        if (params.page !== undefined) queryParams.append('page', params.page);
        if (params.size !== undefined) queryParams.append('size', params.size);
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice);
        if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice);
        if (params.condition) queryParams.append('condition', params.condition);
        if (params.negotiable !== undefined) queryParams.append('negotiable', params.negotiable);

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';
        
        return await publicApiRequest(endpoint, {}, false);
    },

    // 상품 상세 조회 (공개)
    getProduct: async (catalogId, productId) => {
        return await publicApiRequest(`/catalogs/${catalogId}/products/${productId}`, {}, false);
    },

    // 상품 생성
    createProduct: async (catalogId, productData, images = []) => {
        const formData = new FormData();
        
        // 상품 데이터를 JSON 문자열로 변환하여 추가
        formData.append('productData', JSON.stringify(productData));
        
        // 이미지 파일들 추가
        images.forEach((image, index) => {
            formData.append('images', image);
        });

        return await apiRequest(`/catalogs/${catalogId}/products`, {
            method: 'POST',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // 상품 수정
    updateProduct: async (catalogId, productId, productData, images = []) => {
        const formData = new FormData();
        
        // 상품 데이터를 JSON 문자열로 변환하여 추가
        formData.append('productData', JSON.stringify(productData));
        
        // 이미지 파일들 추가
        images.forEach((image, index) => {
            formData.append('images', image);
        });

        return await apiRequest(`/catalogs/${catalogId}/products/${productId}`, {
            method: 'PUT',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // 상품 삭제
    deleteProduct: async (catalogId, productId) => {
        return await apiRequest(`/catalogs/${catalogId}/products/${productId}`, {
            method: 'DELETE'
        });
    },

    // 상품 구매
    purchaseProduct: async (catalogId, productId) => {
        return await apiRequest(`/catalogs/${catalogId}/products/${productId}/purchase`, {
            method: 'POST'
        });
    }
};

export { productApi };