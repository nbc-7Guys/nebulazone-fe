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

    // 상품 등록
    createProduct: async (catalogId, productData, images) => {
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
            const response = await axiosInstance.post(`/catalogs/${catalogId}/products`, formData, {
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