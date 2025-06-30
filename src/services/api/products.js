import { apiRequest, publicApiRequest, ErrorHandler, axiosInstance } from './core';

const productApi = {
    // 상품 목록 조회 (공개)
    getProducts: async (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params.productname) queryParams.append('productname', params.productname);
        if (params.sellernickname) queryParams.append('sellernickname', params.sellernickname);
        if (params.type) queryParams.append('type', params.type);
        if (params.from) queryParams.append('from', params.from);
        if (params.to) queryParams.append('to', params.to);
        if (params.page) queryParams.append('page', params.page);
        if (params.size) queryParams.append('size', params.size);

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';
        
        return await publicApiRequest(endpoint, {}, false);
    },

    // 상품 상세 조회 (공개)
    getProduct: async (catalogId, productId) => {
        return await publicApiRequest(`/catalogs/${catalogId}/products/${productId}`, {}, false);
    },

    // 상품 등록 (JSON 전송)
    createProduct: async (catalogId, productData) => {
        try {
            const response = await apiRequest(`/catalogs/${catalogId}/products`, {
                method: 'POST',
                data: productData,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response;
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 상품 이미지 업로드/수정
    updateProductImages: async (catalogId, productId, images, remainImageUrls = []) => {
        const formData = new FormData();

        // 기존 이미지 URL들을 유지할 때 사용하는 요청 데이터
        const productRequest = {
            remainImageUrls: remainImageUrls
        };
        
        const productBlob = new Blob([JSON.stringify(productRequest)], {
            type: 'application/json'
        });
        formData.append('product', productBlob);

        if (images && images.length > 0) {
            images.forEach(image => {
                formData.append('images', image);
            });
        }

        try {
            const response = await apiRequest(`/catalogs/${catalogId}/products/${productId}/images`, {
                method: 'PUT',
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response;
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 상품 수정
    updateProduct: async (catalogId, productId, productData, images) => {
        const formData = new FormData();

        // JSON 파트에 Content-Type 명시적으로 설정
        const productBlob = new Blob([JSON.stringify(productData)], {
            type: 'application/json'
        });
        formData.append('product', productBlob);

        if (images && images.length > 0) {
            images.forEach(image => {
                formData.append('images', image);
            });
        }

        try {
            const response = await axiosInstance.put(`/catalogs/${catalogId}/products/${productId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },

    // 상품 삭제
    deleteProduct: (catalogId, productId) =>
        apiRequest(`/catalogs/${catalogId}/products/${productId}`, {
            method: 'DELETE',
        }),

    // 상품 구매
    purchaseProduct: async (catalogId, productId) => {
        try {
            return await apiRequest(`/catalogs/${Number(catalogId)}/products/${Number(productId)}/purchase`, {
                method: 'POST',
            });
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            throw new Error(errorInfo.message);
        }
    },
};

export { productApi };