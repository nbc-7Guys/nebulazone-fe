import { apiRequest, ErrorHandler } from './core';

const pointApi = {
  // 2.2. 내 포인트 요청 목록 조회
  getMyPointRequests: (status) => {
    const params = status ? `?status=${status}` : '';
    return apiRequest(`/points/requests${params}`);
  },

  // 2.3. 내 포인트 내역 조회 (페이징)
  getPointHistory: (page = 1, size = 10) =>
    apiRequest(`/points/histories?page=${page}&size=${size}`),

  // 2.1. 포인트 충전/환급 요청
  requestPointFund: async (fundData) => {
    try {
      return await apiRequest('/points/funds', {
        method: 'POST',
        data: fundData,
      });
    } catch (error) {
      const errorInfo = ErrorHandler.handleApiError(error);
      throw new Error(errorInfo.message);
    }
  },

  // 2.4. 포인트 요청 거절 (취소)
  cancelPointRequest: (pointId) =>
    apiRequest(`/points/points/${pointId}`, {
      method: 'DELETE',
    }),

  // 3.1. 어드민: 포인트 내역 검색 및 조회
  adminGetPointHistories: (params) =>
    apiRequest('/admin/points/histories', { params }),

  // 3.2. 어드민: 포인트 요청 승인
  adminApprovePointRequest: (pointHistoryId) =>
    apiRequest(`/admin/points/points/${pointHistoryId}/approve`, {
      method: 'POST',
    }),

  // 3.3. 어드민: 포인트 요청 거절
  adminRejectPointRequest: (pointHistoryId) =>
    apiRequest(`/admin/points/points/${pointHistoryId}/reject`, {
      method: 'POST',
    }),
};

export { pointApi };