import { apiRequest } from './core';

export const reviewApi = {
    // 특정 카탈로그의 리뷰 목록 조회
    getCatalogReviews: (catalogId, page = 1, size = 10) => {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('size', size.toString());

        return apiRequest(`/catalogs/${catalogId}/reviews?${queryParams.toString()}`, {}, false);
    }
};