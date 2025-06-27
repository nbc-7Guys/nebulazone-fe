import { apiRequest } from './core';

const catalogApi = {
    // 카테고리 목록 조회 (인증 필요 없음)
    getCatalogs: (keyword = '', page = 1, size = 10, type = 'CPU') => {
        const queryParams = new URLSearchParams();
        queryParams.append('type', type); // 파라미터로 받은 type 사용
        if (keyword) queryParams.append('keyword', keyword);
        queryParams.append('page', page.toString());
        queryParams.append('size', size.toString());

        return apiRequest(`/catalogs?${queryParams.toString()}`, {}, false); // 인증 필요 없음
    },

    // 카테고리 상세 조회 (인증 필요 없음)
    getCatalog: (catalogId) =>
        apiRequest(`/catalogs/${catalogId}`, {}, false), // 인증 필요 없음
};

export { catalogApi };