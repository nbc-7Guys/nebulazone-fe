import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import SEOHead from '../components/common/SEOHead';
import BanList from '../components/admin/BanList';
import { Link } from 'react-router-dom';

const AdminBanManagementPage = () => {
  console.log('AdminBanManagementPage rendered');
  return (
    <PageContainer>
      <SEOHead
        title="어드민 유저 제재 관리"
        description="관리자용 유저 제재 목록 조회 및 해제 페이지"
        keywords="admin, user ban, 제재 관리, 제재 목록"
      />
      <h1 className="text-2xl font-bold mb-6 text-center">유저 제재 관리</h1>
      <div className="flex justify-end mb-4">
        <Link to="/admin/ban/create" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          새로운 제재 등록
        </Link>
      </div>
      <BanList />
    </PageContainer>
  );
};

export default AdminBanManagementPage;
