import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import HeaderNav from "../components/layout/HeaderNav";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import {userApi} from "../services/api";
import {JwtManager} from "../services/managers/index.js";
import {ErrorHandler, ToastManager} from "../utils/error/errorHandler";
import {AccountSettings, AddressEditor, PasswordEditor, ProfileHeader, ProfileInfoEditor} from "../components/profile";

export default function MyPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 수정 모드 상태
    const [editMode, setEditMode] = useState(null); // 'nickname', 'password', 'address', null
    const [updating, setUpdating] = useState(false);

    // 폼 데이터
    const [formData, setFormData] = useState({
        nickname: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        roadAddress: "",
        detailAddress: "",
        addressNickname: ""
    });

    // 로그인 확인
    useEffect(() => {
        const jwt = JwtManager.getJwt();
        if (!jwt) {
            navigate('/login');
            return;
        }
        loadUserProfile();
    }, [navigate]);

    // 사용자 프로필 로드
    const loadUserProfile = async () => {
        try {
            setLoading(true);
            setError("");
            const userData = await userApi.getMyProfile();
            setUser(userData);

            // 기본 주소 설정
            const defaultAddress = userData?.addresses?.find(addr =>
                addr.addressNickname === "기본배송지" || userData?.addresses?.length === 1
            ) || {};

            setFormData(prev => ({
                ...prev,
                nickname: userData?.nickname || "",
                roadAddress: defaultAddress.roadAddress || "",
                detailAddress: defaultAddress.detailAddress || "",
                addressNickname: defaultAddress.addressNickname || "기본배송지"
            }));
        } catch (error) {
            console.error('프로필 로드 실패:', error);
            const errorInfo = ErrorHandler.handleApiError(error);
            setError(errorInfo.message || '프로필을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 닉네임 수정
    const handleUpdateNickname = async () => {
        if (!formData.nickname.trim()) {
            ToastManager.error('닉네임을 입력해주세요.');
            return;
        }

        setUpdating(true);
        setError("");

        try {
            await userApi.updateProfile({nickname: formData.nickname});
            await loadUserProfile();
            setEditMode(null);
            ToastManager.success('닉네임이 성공적으로 변경되었습니다.');
        } catch (error) {
            console.error('닉네임 수정 실패:', error);
            const errorInfo = ErrorHandler.handleApiError(error);
            ToastManager.error(errorInfo.message || '닉네임 수정에 실패했습니다.');
        } finally {
            setUpdating(false);
        }
    };

    // 비밀번호 수정
    const handleUpdatePassword = async () => {
        if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
            ToastManager.error('모든 필드를 입력해주세요.');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            ToastManager.error('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            return;
        }

        if (formData.newPassword.length < 8) {
            ToastManager.error('새 비밀번호는 8자 이상이어야 합니다.');
            return;
        }

        setUpdating(true);
        setError("");

        try {
            await userApi.updateProfile({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });
            setEditMode(null);
            setFormData(prev => ({
                ...prev,
                oldPassword: "",
                newPassword: "",
                confirmPassword: ""
            }));
            ToastManager.success('비밀번호가 성공적으로 변경되었습니다.');
        } catch (error) {
            console.error('비밀번호 수정 실패:', error);
            const errorInfo = ErrorHandler.handleApiError(error);

            if (errorInfo.status === 401 || errorInfo.status === 400) {
                if (errorInfo.message && errorInfo.message.includes('비밀번호')) {
                    ToastManager.error('기존 비밀번호가 올바르지 않습니다.');
                } else {
                    ToastManager.error(errorInfo.message || '비밀번호 수정에 실패했습니다.');
                }
            } else {
                ToastManager.error(errorInfo.message || '비밀번호 수정에 실패했습니다.');
            }
        } finally {
            setUpdating(false);
        }
    };

    // 주소 추가
    const handleAddAddress = async (address) => {
        setUpdating(true);
        try {
            await userApi.addAddress(address); // nickname 포함된 address 객체
            await loadUserProfile(); // 유저 정보 새로고침
            ToastManager.success('주소가 성공적으로 추가되었습니다.');
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            ToastManager.error(errorInfo.message || '주소 추가에 실패했습니다.');
        } finally {
            setUpdating(false);
        }
    };

    // 주소 수정
    const handleUpdateAddress = async (oldAddressNickname, address) => {
        setUpdating(true);
        try {
            await userApi.updateAddress({
                oldAddressNickname,
                roadAddress: address.roadAddress,
                detailAddress: address.detailAddress,
                addressNickname: address.addressNickname
            });
            await loadUserProfile();
            ToastManager.success('주소가 성공적으로 수정되었습니다.');
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            ToastManager.error(errorInfo.message || '주소 수정에 실패했습니다.');
        } finally {
            setUpdating(false);
        }
    };

    // 주소 삭제
    const handleDeleteAddress = async (address) => {
        setUpdating(true);
        try {
            await userApi.deleteAddress(address);
            await loadUserProfile();
            ToastManager.success('주소가 성공적으로 삭제되었습니다.');
        } catch (error) {
            const errorInfo = ErrorHandler.handleApiError(error);
            ToastManager.error(errorInfo.message || '주소 삭제에 실패했습니다.');
        } finally {
            setUpdating(false);
        }
    };

    // 회원탈퇴
    const handleWithdraw = async (password) => {
        if (!password) {
            ToastManager.error('비밀번호를 입력해주세요.');
            return;
        }

        if (!confirm('정말로 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        setUpdating(true);
        setError("");

        try {
            await userApi.withdraw(password);
            JwtManager.removeTokens();
            ToastManager.success('회원탈퇴가 완료되었습니다.');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            console.error('회원탈퇴 실패:', error);
            const errorInfo = ErrorHandler.handleApiError(error);

            if (errorInfo.status === 401 || errorInfo.status === 400) {
                ToastManager.error('비밀번호가 올바르지 않습니다.');
            } else {
                ToastManager.error(errorInfo.message || '회원탈퇴에 실패했습니다. 다시 시도해주세요.');
            }
        } finally {
            setUpdating(false);
        }
    };

    // 수정 취소
    const handleCancelEdit = () => {
        setEditMode(null);
        const defaultAddress = user?.addresses?.find(addr =>
            addr.addressNickname === "기본배송지" || user?.addresses?.length === 1
        ) || {};

        setFormData(prev => ({
            ...prev,
            nickname: user?.nickname || "",
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
            roadAddress: defaultAddress.roadAddress || "",
            detailAddress: defaultAddress.detailAddress || "",
            addressNickname: defaultAddress.addressNickname || "기본배송지"
        }));
    };

    // 업데이트 핸들러 매핑
    const getUpdateHandler = () => {
        switch (editMode) {
            case 'nickname':
                return handleUpdateNickname;
            case 'password':
                return handleUpdatePassword;
            default:
                return () => {
                };
        }
    };

    if (loading) {
        return (
            <div style={{minHeight: "100vh", backgroundColor: "#f8fafc"}}>
                <HeaderNav/>
                <LoadingSpinner message="프로필을 불러오는 중..."/>
            </div>
        );
    }

    return (
        <div style={{minHeight: "100vh", backgroundColor: "#f8fafc"}}>
            <HeaderNav/>

            <div style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "40px 20px"
            }}>
                {error && (
                    <ErrorMessage
                        message={error}
                        onRetry={loadUserProfile}
                        style={{marginBottom: "24px"}}
                    />
                )}

                <ProfileHeader
                    user={user}
                    onUserUpdate={loadUserProfile}
                />

                <ProfileInfoEditor
                    user={user}
                    editMode={editMode}
                    setEditMode={setEditMode}
                    formData={formData}
                    setFormData={setFormData}
                    updating={updating}
                    onUpdate={getUpdateHandler()}
                    onCancel={handleCancelEdit}
                />

                <PasswordEditor
                    editMode={editMode}
                    setEditMode={setEditMode}
                    formData={formData}
                    setFormData={setFormData}
                    updating={updating}
                    onUpdate={getUpdateHandler()}
                    onCancel={handleCancelEdit}
                />

                <AddressEditor
                    user={user}
                    onAddAddress={handleAddAddress}
                    onUpdateAddress={handleUpdateAddress}
                    onDeleteAddress={handleDeleteAddress}
                />

                <AccountSettings
                    onWithdraw={handleWithdraw}
                    withdrawing={updating}
                />
            </div>
        </div>
    );
}