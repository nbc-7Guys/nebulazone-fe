import React from 'react';
import HeaderNav from '../components/layout/HeaderNav';

export default function AdminDashboard() {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <HeaderNav />
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: '700', 
                        color: '#1a202c', 
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #e53e3e, #d69e2e)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        🛠️ 관리자 대시보드
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
                        NebulaZone 시스템 관리 및 운영 도구
                    </p>
                </div>

                {/* 관리 기능 그리드 */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '24px',
                    marginBottom: '2rem'
                }}>
                    {/* 포인트 관리 카드 */}
                    <div style={{
                        background: 'linear-gradient(135deg, #fff5f5, #fef5e7)',
                        border: '1px solid #fed7d7',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        cursor: 'pointer'
                    }}
                    onClick={() => window.location.href = '/admin/points'}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(229, 62, 62, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                    }}
                    >
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: '16px' 
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'linear-gradient(135deg, #e53e3e, #d69e2e)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                marginRight: '16px'
                            }}>
                                💰
                            </div>
                            <div>
                                <h3 style={{ 
                                    fontSize: '1.25rem', 
                                    fontWeight: '600', 
                                    color: '#e53e3e',
                                    margin: 0
                                }}>
                                    포인트 관리
                                </h3>
                                <p style={{ 
                                    fontSize: '0.9rem', 
                                    color: '#9c4221',
                                    margin: '4px 0 0 0'
                                }}>
                                    Point Management
                                </p>
                            </div>
                        </div>
                        <p style={{ 
                            color: '#7c2d12', 
                            lineHeight: '1.5',
                            margin: 0,
                            fontSize: '14px'
                        }}>
                            사용자 포인트 충전/환전 요청을 승인하거나 거부할 수 있습니다. 
                            포인트 거래 내역을 조회하고 관리할 수 있습니다.
                        </p>
                        <div style={{
                            marginTop: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <span style={{ 
                                fontSize: '12px', 
                                color: '#9c4221',
                                fontWeight: '500'
                            }}>
                                클릭하여 이동
                            </span>
                            <span style={{ 
                                fontSize: '18px',
                                color: '#e53e3e'
                            }}>
                                →
                            </span>
                        </div>
                    </div>

                    {/* 제재 관리 카드 */}
                    <div style={{
                        background: 'linear-gradient(135deg, #f0f9ff, #eef2ff)',
                        border: '1px solid #bee3f8',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        cursor: 'pointer'
                    }}
                    onClick={() => window.location.href = '/admin/ban'}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                    }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                marginRight: '16px'
                            }}>
                                🚫
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '600',
                                    color: '#3b82f6',
                                    margin: 0
                                }}>
                                    제재 관리
                                </h3>
                                <p style={{
                                    fontSize: '0.9rem',
                                    color: '#4338ca',
                                    margin: '4px 0 0 0'
                                }}>
                                    Ban Management
                                </p>
                            </div>
                        </div>
                        <p style={{
                            color: '#4c51bf',
                            lineHeight: '1.5',
                            margin: 0,
                            fontSize: '14px'
                        }}>
                            사용자 계정을 제재하거나 제재 내역을 조회하고 관리할 수 있습니다.
                        </p>
                        <div style={{
                            marginTop: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <span style={{
                                fontSize: '12px',
                                color: '#4338ca',
                                fontWeight: '500'
                            }}>
                                클릭하여 이동
                            </span>
                            <span style={{
                                fontSize: '18px',
                                color: '#3b82f6'
                            }}>
                                →
                            </span>
                        </div>
                    </div>

                    {/* 추후 추가될 관리 기능들을 위한 플레이스홀더 */}
                    <div style={{
                        background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                        border: '2px dashed #cbd5e0',
                        borderRadius: '16px',
                        padding: '24px',
                        textAlign: 'center',
                        color: '#64748b'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>
                            🚧
                        </div>
                        <h3 style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: '600', 
                            margin: '0 0 8px 0',
                            color: '#64748b'
                        }}>
                            추가 기능 준비중
                        </h3>
                        <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.8 }}>
                            사용자 관리, 상품 관리 등<br />
                            추가 관리 기능이 곧 제공됩니다
                        </p>
                    </div>
                </div>

                {/* 빠른 통계 (향후 추가 예정) */}
                <div style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0'
                }}>
                    <h2 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '600', 
                        marginBottom: '16px',
                        color: '#1a202c'
                    }}>
                        📊 시스템 현황
                    </h2>
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#64748b'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>
                            📈
                        </div>
                        <p style={{ fontSize: '1.1rem', margin: 0 }}>
                            시스템 통계 및 현황 정보가<br />
                            곧 제공될 예정입니다
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}