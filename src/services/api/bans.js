import { axiosInstance as api } from './core';

// 유저 제재(Ban) 등록
export const banUser = async (banData) => {
  try {
    const response = await api.post('/admin/bans', banData);
    return response.data;
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
};

// 제재 목록 조회
export const getBans = async () => {
  try {
    const response = await api.get('/admin/bans');
    return response.data;
  } catch (error) {
    console.error('Error fetching bans:', error);
    throw error;
  }
};

// 제재 해제(UNBAN)
export const deleteBan = async (ipAddress) => {
  try {
    const response = await api.delete(`/admin/bans/${ipAddress}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting ban:', error);
    throw error;
  }
};
