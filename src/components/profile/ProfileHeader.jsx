import React, { useState, useEffect } from 'react';
import { userApi } from '../../services/api';
import { ToastManager, ErrorHandler } from '../../utils/error/errorHandler';

const ProfileHeader = ({ user, onUserUpdate }) => {
    const [selectedProfileImage, setSelectedProfileImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [savingProfileImage, setSavingProfileImage] = useState(false);

    // OAuth 제공자별 아이콘 반환
    const getProviderIcon = (provider) => {
        const icons = {
            'kakao': '💬',
            'naver': '🟢',
            'google': '🔍',
            'github': '⚫'
        };
        return icons[provider?.toLowerCase()] || '🔑';
    };

    // OAuth 제공자별 라벨 반환
    const getProviderLabel = (provider) => {
        const labels = {
            'kakao': '카카오',
            'naver': '네이버',
            'google': '구글',
            'github': '깃허브'
        };
        return labels[provider?.toLowerCase()] || provider;
    };

    // OAuth 제공자별 배지 색상 반환
    const getProviderBadgeColor = (provider) => {
        const colors = {
            'kakao': { bg: '#FEE500', text: '#3C1E1E' },
            'naver': { bg: '#03C75A', text: '#ffffff' },
            'google': { bg: '#4285F4', text: '#ffffff' },
            'github': { bg: '#24292e', text: '#ffffff' }
        };
        return colors[provider?.toLowerCase()] || { bg: '#f0fff4', text: '#22543d' };
    };

    // 프로필 이미지 파일 선택 처리
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // 파일 크기 제한 (2MB로 강화)
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                ToastManager.error('프로필 이미지는 2MB 이하로 선택해주세요.');
                e.target.value = ''; // 파일 선택 초기화
                return;
            }

            // 파일 형식 검증 (더 엄격하게)
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                ToastManager.error('JPG, PNG, WebP 형식의 이미지만 업로드 가능합니다.');
                e.target.value = ''; // 파일 선택 초기화
                return;
            }

            // 파일명 길이 제한
            if (file.name.length > 100) {
                ToastManager.error('파일명이 너무 깁니다. 100자 이하로 해주세요.');
                e.target.value = ''; // 파일 선택 초기화
                return;
            }

            // 이미지 크기(해상도) 검증
            const img = new Image();
            img.onload = function() {
                // 최대 해상도 제한 (4096x4096)
                if (this.width > 4096 || this.height > 4096) {
                    ToastManager.error('이미지 해상도는 4096x4096 이하로 해주세요.');
                    e.target.value = ''; // 파일 선택 초기화
                    URL.revokeObjectURL(this.src);
                    return;
                }

                // 최소 해상도 제한 (100x100)
                if (this.width < 100 || this.height < 100) {
                    ToastManager.error('이미지 해상도는 최소 100x100 이상이어야 합니다.');
                    e.target.value = ''; // 파일 선택 초기화
                    URL.revokeObjectURL(this.src);
                    return;
                }

                // 모든 검증 통과 시 이미지 설정
                setSelectedProfileImage(file);
                setPreviewUrl(URL.createObjectURL(file));
            };

            img.onerror = function() {
                ToastManager.error('유효하지 않은 이미지 파일입니다.');
                e.target.value = ''; // 파일 선택 초기화
                URL.revokeObjectURL(this.src);
            };

            img.src = URL.createObjectURL(file);
        }
    };

    // 프로필 이미지 저장
    const handleSaveProfileImage = async () => {
        if (!selectedProfileImage) return;

        setSavingProfileImage(true);
        try {
            await userApi.updateProfileImage(selectedProfileImage);
            setSelectedProfileImage(null);
            setPreviewUrl(null);
            await onUserUpdate(); // 부모에서 사용자 정보 다시 로드
            ToastManager.success('프로필 이미지가 성공적으로 변경되었습니다.');
        } catch (error) {
            console.error('프로필 이미지 업데이트 실패:', error);
            const errorInfo = ErrorHandler.handleApiError(error);
            ToastManager.error(errorInfo.message || '프로필 이미지 변경에 실패했습니다.');
        } finally {
            setSavingProfileImage(false);
        }
    };

    // 프로필 이미지 변경 취소
    const handleCancelImageChange = () => {
        setSelectedProfileImage(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
    };

    // 컴포넌트 언마운트 시 메모리 정리
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    return (
        <div className="bg-primary p-8 rounded-lg shadow border mb-6 text-center">
            <h1 className="text-3xl font-bold mb-8 text-primary">
                내 프로필
            </h1>

            {/* 프로필 이미지 */}
            <div style={{
                display: 'inline-block',
                position: 'relative',
                marginBottom: '24px'
            }}>
                <div style={{
                    width: '128px',
                    height: '128px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid #e2e8f0',
                    margin: '0 auto',
                    position: 'relative'
                }}>
                    <img
                        src={previewUrl || user?.profileImageUrl || "/default-avatar.png"}
                        alt="프로필 이미지"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        onError={(e) => {
                            e.target.src = "/default-avatar.png";
                        }}
                    />
                </div>

                {/* 이미지 업로드 버튼 */}
                <label
                    htmlFor="profile-image-input"
                    style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        width: '36px',
                        height: '36px',
                        backgroundColor: '#38d39f',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '3px solid #fff',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.2s ease',
                        transform: 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#2fb88a';
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#38d39f';
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                    }}
                >
                    {/* 카메라 SVG 아이콘 */}
                    <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" 
                            stroke="white" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                        <circle 
                            cx="12" 
                            cy="13" 
                            r="4" 
                            stroke="white" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                    </svg>
                    <input
                        id="profile-image-input"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageSelect}
                        style={{ display: "none" }}
                    />
                </label>
            </div>

            {/* 이미지 변경 버튼들 */}
            {selectedProfileImage && (
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center',
                    marginBottom: '24px'
                }}>
                    <button
                        onClick={handleSaveProfileImage}
                        disabled={savingProfileImage}
                        style={{
                            padding: '8px 16px',
                            color: '#fff',
                            backgroundColor: savingProfileImage ? '#9ca3af' : '#38d39f',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: savingProfileImage ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!savingProfileImage) {
                                e.target.style.backgroundColor = '#2fb88a';
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!savingProfileImage) {
                                e.target.style.backgroundColor = '#38d39f';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }
                        }}
                    >
                        {savingProfileImage ? "저장 중..." : "저장"}
                    </button>
                    <button
                        onClick={handleCancelImageChange}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#f7fafc',
                            color: '#4a5568',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#edf2f7';
                            e.target.style.borderColor = '#cbd5e0';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#f7fafc';
                            e.target.style.borderColor = '#e2e8f0';
                        }}
                    >
                        취소
                    </button>
                </div>
            )}

            {/* 기본 정보 */}
            <h2 className="text-2xl font-semibold mb-2 text-primary">
                {user?.nickname || "사용자"}
            </h2>
            <p className="text-base text-muted mb-4">
                {user?.email}
            </p>
            {/* OAuth 로그인 방식 표시 */}
            {user?.provider && (
                <div 
                    className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium gap-2 transition-all hover:shadow-md"
                    style={{
                        backgroundColor: getProviderBadgeColor(user.provider).bg,
                        color: getProviderBadgeColor(user.provider).text
                    }}
                >
                    <span className="text-base">{getProviderIcon(user.provider)}</span>
                    <span>{getProviderLabel(user.provider)} 로그인</span>
                </div>
            )}
        </div>
    );
};

export default ProfileHeader;