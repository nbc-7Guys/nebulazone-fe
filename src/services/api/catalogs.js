import { publicApiRequest } from './core';

const catalogApi = {
    // 카탈로그(카테고리) 목록 조회 (공개)
    getCatalogs: async (keyword = '', page = 0, size = 10, type = '') => {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (page !== undefined) params.append('page', page);
        if (size !== undefined) params.append('size', size);
        if (type) params.append('type', type);
        
        const queryString = params.toString();
        const endpoint = queryString ? `/catalogs?${queryString}` : '/catalogs';
        
        return await publicApiRequest(endpoint, {}, false);
    },

    // 카탈로그(카테고리) 상세 조회 (공개)
    getCatalog: async (catalogId) => {
        return await publicApiRequest(`/catalogs/${catalogId}`, {}, false);
    }
};

export { catalogApi };