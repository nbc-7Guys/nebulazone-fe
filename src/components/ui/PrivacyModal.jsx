import React from 'react';

const PrivacyModal = ({ isOpen, onClose, onAgree }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
            }}>
                {/* 헤더 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                    paddingBottom: '16px',
                    borderBottom: '2px solid #f0f0f0'
                }}>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        margin: 0
                    }}>
                        개인정보 수집 및 이용 동의
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            color: '#999',
                            cursor: 'pointer',
                            padding: '0',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* 내용 */}
                <div style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#555',
                    marginBottom: '32px'
                }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1a1a1a',
                            marginBottom: '12px'
                        }}>
                            1. 개인정보 수집 목적
                        </h3>
                        <p style={{ margin: '0 0 8px 0' }}>
                            - 회원가입 및 회원관리
                        </p>
                        <p style={{ margin: '0 0 8px 0' }}>
                            - 서비스 제공 및 상품 거래
                        </p>
                        <p style={{ margin: '0 0 8px 0' }}>
                            - 고객 상담 및 불만처리
                        </p>
                        <p style={{ margin: '0' }}>
                            - 마케팅 및 광고 활용
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1a1a1a',
                            marginBottom: '12px'
                        }}>
                            2. 수집하는 개인정보 항목
                        </h3>
                        <p style={{ margin: '0 0 8px 0' }}>
                            - 이메일, 비밀번호, 닉네임
                        </p>
                        <p style={{ margin: '0 0 8px 0' }}>
                            - 전화번호, 주소
                        </p>
                        <p style={{ margin: '0' }}>
                            - 서비스 이용 기록, 접속 로그
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1a1a1a',
                            marginBottom: '12px'
                        }}>
                            3. 개인정보 보유 및 이용 기간
                        </h3>
                        <p style={{ margin: '0 0 8px 0' }}>
                            - 회원탈퇴 시까지
                        </p>
                        <p style={{ margin: '0' }}>
                            - 관련 법령에 의해 보존할 필요가 있는 경우 해당 기간까지
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1a1a1a',
                            marginBottom: '12px'
                        }}>
                            4. 개인정보 제공 거부 권리
                        </h3>
                        <p style={{ margin: '0' }}>
                            귀하는 개인정보 수집·이용에 동의하지 않으실 수 있습니다. 
                            다만, 필수 항목에 대한 동의를 거부하실 경우 서비스 이용이 제한될 수 있습니다.
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                    }}>
                        <p style={{
                            margin: '0',
                            fontSize: '13px',
                            color: '#666',
                            fontWeight: '500'
                        }}>
                            위 개인정보 수집 및 이용에 동의하시겠습니까?
                        </p>
                    </div>
                </div>

                {/* 버튼 */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#f8f9fa',
                            color: '#6c757d',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#e9ecef';
                            e.target.style.borderColor = '#adb5bd';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#f8f9fa';
                            e.target.style.borderColor = '#dee2e6';
                        }}
                    >
                        취소
                    </button>
                    <button
                        onClick={onAgree}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#1986F8',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#0d6efd';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#1986F8';
                        }}
                    >
                        동의합니다
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyModal;