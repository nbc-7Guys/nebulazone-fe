import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import HeaderNav from "../components/HeaderNav";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import {userApi} from "../services/api";
import {JwtManager} from "../utils/JwtManager";
import {ErrorHandler, ToastManager} from "../utils/errorHandler";

export default function MyPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 수정 모드 상태
    const [editMode, setEditMode] = useState(null); // 'nickname', 'password', 'phone', 'address', null
    const [updating, setUpdating] = useState(false);

    // 폼 데이터
    const [formData, setFormData] = useState({
        nickname: "",
        phone: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        roadAddress: "",
        detailAddress: "",
        addressNickname: ""
    });

    // 회원탈퇴 관련
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawPassword, setWithdrawPassword] = useState("");
    const [withdrawing, setWithdrawing] = useState(false);

    const [selectedProfileImage, setSelectedProfileImage] = useState(null); // 새로 선택한 파일
    const [previewUrl, setPreviewUrl] = useState(null); // 미리보기 URL
    const [savingProfileImage, setSavingProfileImage] = useState(false); // 저장 중 상태


    // 로그인 확인
    useEffect(() => {
        const jwt = JwtManager.getJwt();
        if (!jwt) {
            navigate('/login');
            return;
        }
        loadUserProfile();
    }, [navigate]);

    // 사용자 정보 로드
    const loadUserProfile = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await userApi.getMyProfile();
            setUser(response);

            // 기본 주소 찾기
            const defaultAddress = response.addresses?.find(addr =>
                addr.addressNickname === "기본배송지" || response.addresses?.length === 1
            ) || {};

            setFormData(prev => ({
                ...prev,
                nickname: response.nickname || "",
                phone: response.phone || "",
                roadAddress: defaultAddress.roadAddress || "",
                detailAddress: defaultAddress.detailAddress || "",
                addressNickname: defaultAddress.addressNickname || "기본배송지"
            }));
        } catch (error) {
            console.error('프로필 로드 실패:', error);
            const errorInfo = ErrorHandler.handleApiError(error);

            // 구체적인 에러 메시지 설정
            if (errorInfo.status === 401) {
                setError('로그인이 필요합니다. 다시 로그인해주세요.');
                JwtManager.removeTokens();
                navigate('/login');
            } else if (errorInfo.status === 404) {
                setError('사용자 정보를 찾을 수 없습니다.');
            } else {
                setError(errorInfo.message || '사용자 정보를 불러오는데 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 폼 데이터 변경
    const handleFormChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
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
            const updateData = {
                nickname: formData.nickname,
                passwordChangeForm: null
            };

            await userApi.updateProfile(updateData);
            await loadUserProfile();
            setEditMode(null);
            ToastManager.success('닉네임이 성공적으로 변경되었습니다.');
        } catch (error) {
            console.error('닉네임 수정 실패:', error);
            const errorInfo = ErrorHandler.handleApiError(error);

            if (errorInfo.status === 409) {
                ToastManager.error('이미 사용 중인 닉네임입니다.');
            } else if (errorInfo.status === 400) {
                ToastManager.error(errorInfo.message || '닉네임 형식이 올바르지 않습니다.');
            } else {
                ToastManager.error(errorInfo.message || '닉네임 수정에 실패했습니다.');
            }
        } finally {
            setUpdating(false);
        }
    };

    // 전화번호 수정
    const handleUpdatePhone = async () => {
        if (!formData.phone.trim()) {
            ToastManager.error('전화번호를 입력해주세요.');
            return;
        }

        // 전화번호 형식 검증 (간단한 검증)
        const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
        if (!phoneRegex.test(formData.phone.replace(/-/g, ''))) {
            ToastManager.error('올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)');
            return;
        }

        setUpdating(true);
        setError("");

        try {
            const updateData = {
                phone: formData.phone
            };

            await userApi.updateProfile(updateData);
            await loadUserProfile();
            setEditMode(null);
            ToastManager.success('전화번호가 성공적으로 변경되었습니다.');
        } catch (error) {
            console.error('전화번호 수정 실패:', error);
            const errorInfo = ErrorHandler.handleApiError(error);
            ToastManager.error(errorInfo.message || '전화번호 수정에 실패했습니다.');
        } finally {
            setUpdating(false);
        }
    };

    // 비밀번호 변경
    const handleUpdatePassword = async () => {
        if (!formData.oldPassword || !formData.newPassword) {
            ToastManager.error('기존 비밀번호와 새 비밀번호를 모두 입력해주세요.');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            ToastManager.error('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            return;
        }

        if (formData.newPassword.length < 8) {
            ToastManager.error('새 비밀번호는 8자리 이상이어야 합니다.');
            return;
        }

        setUpdating(true);
        setError("");

        try {
            const updateData = {
                nickname: null,
                passwordChangeForm: {
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword
                }
            };

            await userApi.updateProfile(updateData);
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

    // 주소 수정
    const handleUpdateAddress = async () => {
        if (!formData.roadAddress.trim()) {
            ToastManager.error('도로명 주소를 입력해주세요.');
            return;
        }

        setUpdating(true);
        setError("");

        try {
            const updateData = {
                addresses: [{
                    roadAddress: formData.roadAddress,
                    detailAddress: formData.detailAddress,
                    addressNickname: formData.addressNickname || "기본배송지"
                }]
            };

            await userApi.updateProfile(updateData);
            await loadUserProfile();
            setEditMode(null);
            ToastManager.success('주소가 성공적으로 변경되었습니다.');
        } catch (error) {
            console.error('주소 수정 실패:', error);
            const errorInfo = ErrorHandler.handleApiError(error);
            ToastManager.error(errorInfo.message || '주소 수정에 실패했습니다.');
        } finally {
            setUpdating(false);
        }
    };

    // 회원탈퇴
    const handleWithdraw = async () => {
        if (!withdrawPassword) {
            ToastManager.error('비밀번호를 입력해주세요.');
            return;
        }

        if (!confirm('정말로 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        setWithdrawing(true);
        setError("");

        try {
            await userApi.withdraw(withdrawPassword);
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
            setWithdrawing(false);
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
            phone: user?.phone || "",
            roadAddress: defaultAddress.roadAddress || "",
            detailAddress: defaultAddress.detailAddress || "",
            addressNickname: defaultAddress.addressNickname || "기본배송지",
            oldPassword: "",
            newPassword: "",
            confirmPassword: ""
        }));
        setError("");
    };

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // OAuth 타입 한글 변환
    const getOAuthTypeLabel = (oAuthType) => {
        switch (oAuthType) {
            case 'DOMAIN':
                return '일반 회원';
            case 'GOOGLE':
                return '구글 로그인';
            case 'KAKAO':
                return '카카오 로그인';
            case 'NAVER':
                return '네이버 로그인';
            default:
                return oAuthType || '일반 회원';
        }
    };

    const defaultAddress = user?.addresses?.find(addr =>
        addr.addressNickname === "기본배송지" || user?.addresses?.length === 1
    ) || {};

    if (loading) {
        return (
            <div style={{background: "#f8fafc", minHeight: "100vh"}}>
                <HeaderNav/>
                <LoadingSpinner size="large" message="사용자 정보를 불러오는 중..."/>
            </div>
        );
    }

    return (
        <div style={{background: "#f8fafc", minHeight: "100vh"}}>
            <HeaderNav/>

            <div style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "40px 20px"
            }}>
                {/* 헤더 */}
                <div style={{marginBottom: "40px"}}>
                    <h1 style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginBottom: "8px",
                        color: "#1a202c"
                    }}>
                        마이페이지
                    </h1>
                    <p style={{
                        fontSize: "16px",
                        color: "#718096"
                    }}>
                        계정 정보를 관리하고 설정을 변경할 수 있습니다.
                    </p>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <ErrorMessage
                        message={error}
                        onRetry={() => setError('')}
                        retryText="확인"
                        style={{marginBottom: "24px"}}
                    />
                )}

                {/* 프로필 이미지 및 수정 버튼 */}
                <div style={{display: "flex", alignItems: "center", marginBottom: "32px"}}>
                    <img
                        src={user?.profileImageUrl || "/default-profile.png"}
                        alt="프로필 이미지"
                        style={{
                            width: "180px",
                            height: "180px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #e2e8f0",
                            marginRight: "24px",
                            background: "#f4f4f4"
                        }}
                    />
                    <button
                        onClick={() => setEditMode('profileImage')}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#38d39f",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            cursor: "pointer"
                        }}
                    >
                        프로필 이미지 수정
                    </button>
                </div>

                {/* 프로필 이미지 수정 폼 */}
                {editMode === 'profileImage' && (
                    <div style={{marginBottom: "24px"}}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setSelectedProfileImage(file);
                                    setPreviewUrl(URL.createObjectURL(file));
                                }
                            }}
                        />
                        {previewUrl && (
                            <div style={{margin: "16px 0"}}>
                                <img
                                    src={previewUrl}
                                    alt="미리보기"
                                    style={{
                                        width: "180px",
                                        height: "180px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: "2px solid #38d39f",
                                        marginBottom: "12px"
                                    }}
                                />
                            </div>
                        )}
                        {selectedProfileImage && (
                            <div style={{marginBottom: "12px"}}>
                                <button
                                    onClick={async () => {
                                        setSavingProfileImage(true);
                                        try {
                                            await userApi.updateProfileImage(selectedProfileImage);
                                            await loadUserProfile();
                                            setEditMode(null);
                                            setSelectedProfileImage(null);
                                            setPreviewUrl(null);
                                            ToastManager.success('프로필 이미지가 변경되었습니다.');
                                        } catch (error) {
                                            ToastManager.error('프로필 이미지 변경에 실패했습니다.');
                                        } finally {
                                            setSavingProfileImage(false);
                                        }
                                    }}
                                    disabled={savingProfileImage}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#38d39f",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        cursor: savingProfileImage ? "not-allowed" : "pointer",
                                        marginRight: "8px"
                                    }}
                                >
                                    {savingProfileImage ? "저장 중..." : "저장"}
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedProfileImage(null);
                                        setPreviewUrl(null);
                                        handleCancelEdit();
                                    }}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#f7fafc",
                                        color: "#4a5568",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        cursor: "pointer"
                                    }}
                                >
                                    취소
                                </button>
                            </div>
                        )}
                    </div>
                )}


                {/* 기본 정보 카드 */}
                <div style={{
                    backgroundColor: "#fff",
                    padding: "32px",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    marginBottom: "24px"
                }}>
                    <h2 style={{
                        fontSize: "20px",
                        fontWeight: "600",
                        marginBottom: "24px",
                        color: "#1a202c"
                    }}>
                        기본 정보
                    </h2>

                    {/* 사용자 ID */}
                    <div style={{marginBottom: "24px"}}>
                        <label style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "8px",
                            color: "#374151"
                        }}>
                            사용자 ID
                        </label>
                        <div style={{
                            padding: "12px 16px",
                            backgroundColor: "#f7fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            color: "#4a5568"
                        }}>
                            {user?.userId}
                        </div>
                    </div>

                    {/* 이메일 */}
                    <div style={{marginBottom: "24px"}}>
                        <label style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "8px",
                            color: "#374151"
                        }}>
                            이메일
                        </label>
                        <div style={{
                            padding: "12px 16px",
                            backgroundColor: "#f7fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            color: "#4a5568"
                        }}>
                            {user?.email}
                        </div>
                    </div>

                    {/* 닉네임 */}
                    <div style={{marginBottom: "24px"}}>
                        <label style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "8px",
                            color: "#374151"
                        }}>
                            닉네임
                        </label>

                        {editMode === 'nickname' ? (
                            <div style={{display: "flex", gap: "8px", alignItems: "center"}}>
                                <input
                                    type="text"
                                    value={formData.nickname}
                                    onChange={(e) => handleFormChange('nickname', e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: "12px 16px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        outline: "none"
                                    }}
                                />
                                <button
                                    onClick={handleUpdateNickname}
                                    disabled={updating}
                                    style={{
                                        padding: "12px 16px",
                                        backgroundColor: "#38d39f",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        cursor: updating ? "not-allowed" : "pointer",
                                        opacity: updating ? 0.7 : 1
                                    }}
                                >
                                    {updating ? "저장 중..." : "저장"}
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    style={{
                                        padding: "12px 16px",
                                        backgroundColor: "#f7fafc",
                                        color: "#4a5568",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        cursor: "pointer"
                                    }}
                                >
                                    취소
                                </button>
                            </div>
                        ) : (
                            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                <div style={{
                                    padding: "12px 16px",
                                    backgroundColor: "#f7fafc",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    color: "#4a5568",
                                    flex: 1
                                }}>
                                    {user?.nickname}
                                </div>
                                <button
                                    onClick={() => setEditMode('nickname')}
                                    style={{
                                        marginLeft: "12px",
                                        padding: "12px 16px",
                                        backgroundColor: "#e2e8f0",
                                        color: "#4a5568",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        cursor: "pointer"
                                    }}
                                >
                                    수정
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 전화번호 */}
                    <div style={{marginBottom: "24px"}}>
                        <label style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "8px",
                            color: "#374151"
                        }}>
                            전화번호
                        </label>

                        {editMode === 'phone' ? (
                            <div style={{display: "flex", gap: "8px", alignItems: "center"}}>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleFormChange('phone', e.target.value)}
                                    placeholder="010-1234-5678"
                                    style={{
                                        flex: 1,
                                        padding: "12px 16px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        outline: "none"
                                    }}
                                />
                                <button
                                    onClick={handleUpdatePhone}
                                    disabled={updating}
                                    style={{
                                        padding: "12px 16px",
                                        backgroundColor: "#38d39f",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        cursor: updating ? "not-allowed" : "pointer",
                                        opacity: updating ? 0.7 : 1
                                    }}
                                >
                                    {updating ? "저장 중..." : "저장"}
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    style={{
                                        padding: "12px 16px",
                                        backgroundColor: "#f7fafc",
                                        color: "#4a5568",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        cursor: "pointer"
                                    }}
                                >
                                    취소
                                </button>
                            </div>
                        ) : (
                            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                <div style={{
                                    padding: "12px 16px",
                                    backgroundColor: "#f7fafc",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    color: "#4a5568",
                                    flex: 1
                                }}>
                                    {user?.phone || '등록된 전화번호가 없습니다'}
                                </div>
                                <button
                                    onClick={() => setEditMode('phone')}
                                    style={{
                                        marginLeft: "12px",
                                        padding: "12px 16px",
                                        backgroundColor: "#e2e8f0",
                                        color: "#4a5568",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        cursor: "pointer"
                                    }}
                                >
                                    수정
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 포인트 */}
                    <div style={{marginBottom: "24px"}}>
                        <label style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "8px",
                            color: "#374151"
                        }}>
                            보유 포인트
                        </label>
                        <div style={{
                            padding: "12px 16px",
                            backgroundColor: "#f0fff4",
                            border: "1px solid #38d39f",
                            borderRadius: "8px",
                            color: "#2d7d52",
                            fontWeight: "600"
                        }}>
                            {user?.point?.toLocaleString() || 0} 포인트
                        </div>
                    </div>

                    {/* 가입 정보 */}
                    <div style={{
                        borderTop: "1px solid #e2e8f0",
                        paddingTop: "24px",
                        marginTop: "24px"
                    }}>
                        <h3 style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            marginBottom: "16px",
                            color: "#1a202c"
                        }}>
                            가입 정보
                        </h3>

                        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
                            <div>
                                <label style={{
                                    display: "block",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    marginBottom: "4px",
                                    color: "#6b7280"
                                }}>
                                    가입 유형
                                </label>
                                <div style={{fontSize: "14px", color: "#374151"}}>
                                    {getOAuthTypeLabel(user?.oAuthType)}
                                </div>
                            </div>
                            <div>
                                <label style={{
                                    display: "block",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    marginBottom: "4px",
                                    color: "#6b7280"
                                }}>
                                    가입일
                                </label>
                                <div style={{fontSize: "14px", color: "#374151"}}>
                                    {formatDate(user?.createdAt)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 빠른 메뉴 */}
                    <div style={{
                        borderTop: "1px solid #e2e8f0",
                        paddingTop: "24px",
                        marginTop: "24px"
                    }}>
                        <h3 style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            marginBottom: "16px",
                            color: "#1a202c"
                        }}>
                            빠른 메뉴
                        </h3>
                        <div style={{display: "flex", gap: "12px", flexWrap: "wrap"}}>
                            <button
                                onClick={() => navigate('/transactions')}
                                style={{
                                    padding: "12px 20px",
                                    backgroundColor: "#007bff",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "background-color 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "#0056b3";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "#007bff";
                                }}
                            >
                                📋 거래내역 보기
                            </button>
                            <button
                                onClick={() => navigate('/chat/rooms')}
                                style={{
                                    padding: "12px 20px",
                                    backgroundColor: "#28a745",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "background-color 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "#1e7e34";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "#28a745";
                                }}
                            >
                                💬 채팅방 보기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}