import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import BanUserForm from '../components/forms/BanUserForm';
import SEOHead from '../components/common/SEOHead';

const AdminBanCreatePage = () => {
  return (
    <PageContainer>
      <SEOHead
        title="어드민 유저 제재 등록"
        description="관리자용 유저 제재 등록 페이지"
        keywords="admin, user ban, 제재 등록"
      />
      <h1 className="text-2xl font-bold mb-6 text-center">유저 제재 등록</h1>
      <BanUserForm />
    </PageContainer>
  );
};

export default AdminBanCreatePage;
