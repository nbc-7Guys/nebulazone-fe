import React, { useState } from 'react';
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
            if (file.size > 5 * 1024 * 1024) { // 5MB 제한
                ToastManager.error('이미지 파일은 5MB 이하로 선택해주세요.');
                return;
            }

            if (!file.type.startsWith('image/')) {
                ToastManager.error('이미지 파일만 선택 가능합니다.');
                return;
            }

            setSelectedProfileImage(file);
            setPreviewUrl(URL.createObjectURL(file));
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
        setPreviewUrl(null);
    };

    return (
        <div className="bg-primary p-8 rounded-lg shadow border mb-6 text-center">
            <h1 className="text-3xl font-bold mb-8 text-primary">
                내 프로필
            </h1>

            {/* 프로필 이미지 */}
            <div className="inline-block relative mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-light mx-auto relative">
                    <img
                        src={previewUrl || user?.profileImageUrl || "/default-avatar.png"}
                        alt="프로필 이미지"
                        className="w-50 h-50 object-cover"
                        onError={(e) => {
                            e.target.src = "/default-avatar.png";
                        }}
                    />
                </div>

                {/* 이미지 업로드 버튼 */}
                <label
                    htmlFor="profile-image-input"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer text-white text-base border-2 border-white hover:bg-primary-dark transition-colors"
                >
                    📷
                    <input
                        id="profile-image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        style={{ display: "none" }}
                    />
                </label>
            </div>

            {/* 이미지 변경 버튼들 */}
            {selectedProfileImage && (
                <div className="flex gap-3 justify-center mb-6">
                    <button
                        onClick={handleSaveProfileImage}
                        disabled={savingProfileImage}
                        className={`px-4 py-2 text-white border-none rounded text-sm font-medium transition-all ${
                            savingProfileImage ? 'bg-muted cursor-not-allowed' : 'btn-primary hover:shadow-lg hover:-translate-y-1'
                        }`}
                    >
                        {savingProfileImage ? "저장 중..." : "저장"}
                    </button>
                    <button
                        onClick={handleCancelImageChange}
                        className="px-4 py-2 bg-muted text-secondary border border-light rounded text-sm cursor-pointer font-medium hover:bg-secondary transition-colors"
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