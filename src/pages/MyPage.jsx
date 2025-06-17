import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderNav from "../components/HeaderNav";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { userApi } from "../services/api";
import { JwtManager } from "../utils/JwtManager";
import { ErrorHandler, ToastManager } from "../utils/errorHandler";

export default function MyPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // 수정 모드 상태
    const [editMode, setEditMode] = useState(null); // 'nickname', 'password', null
    const [updating, setUpdating] = useState(false);
    
    // 폼 데이터
    const [formData, setFormData] = useState({
        nickname: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    
    // 회원탈퇴 관련
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawPassword, setWithdrawPassword] = useState("");
    const [withdrawing, setWithdrawing] = useState(false);

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
            setFormData(prev => ({ ...prev, nickname: response.nickname || "" }));
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
        setFormData(prev => ({ ...prev, [field]: value }));
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
            await loadUserProfile(); // 프로필 새로고침
            setEditMode(null);
            ToastManager.success('닉네임이 성공적으로 변경되었습니다.');
        } catch (error) {
            console.error('닉네임 수정 실패:', error);
            const errorInfo = ErrorHandler.handleApiError(error);
            
            // 구체적인 에러 메시지 표시
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
            
            // 구체적인 에러 메시지 표시
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
            // 2초 후 메인 페이지로 이동
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            console.error('회원탈퇴 실패:', error);
            const errorInfo = ErrorHandler.handleApiError(error);
            
            // 구체적인 에러 메시지 표시
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
        setFormData(prev => ({
            ...prev,
            nickname: user?.nickname || "",
            oldPassword: "",
            newPassword: "",
            confirmPassword: ""
        }));
        setError("");
    };

    if (loading) {
        return (
            <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
                <HeaderNav />
                <LoadingSpinner size="large" message="사용자 정보를 불러오는 중..." />
            </div>
        );
    }

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <HeaderNav />

            <div style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "40px 20px"
            }}>
                {/* 헤더 */}
                <div style={{ marginBottom: "40px" }}>
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
                        style={{ marginBottom: "24px" }}
                    />
                )}

                {/* 사용자 정보 카드 */}
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

                    {/* 이메일 */}
                    <div style={{ marginBottom: "24px" }}>
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
                    <div style={{ marginBottom: "24px" }}>
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
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
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
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14,2 14,8 20,8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10,9 9,9 8,9"/>
                                </svg>
                                거래내역 보기
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
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                채팅방 보기
                            </button>
                        </div>
                    </div>
                </div>

                {/* 비밀번호 변경 카드 */}
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
                        비밀번호 변경
                    </h2>

                    {editMode === 'password' ? (
                        <div>
                            {/* 기존 비밀번호 */}
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    marginBottom: "8px",
                                    color: "#374151"
                                }}>
                                    기존 비밀번호 *
                                </label>
                                <input
                                    type="password"
                                    value={formData.oldPassword}
                                    onChange={(e) => handleFormChange('oldPassword', e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        outline: "none"
                                    }}
                                />
                            </div>

                            {/* 새 비밀번호 */}
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    marginBottom: "8px",
                                    color: "#374151"
                                }}>
                                    새 비밀번호 *
                                </label>
                                <input
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={(e) => handleFormChange('newPassword', e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        outline: "none"
                                    }}
                                />
                                <div style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    marginTop: "4px"
                                }}>
                                    대소문자, 숫자, 특수문자를 각각 최소 1자 이상 포함하며 8글자 이상
                                </div>
                            </div>

                            {/* 비밀번호 확인 */}
                            <div style={{ marginBottom: "24px" }}>
                                <label style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    marginBottom: "8px",
                                    color: "#374151"
                                }}>
                                    새 비밀번호 확인 *
                                </label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        outline: "none"
                                    }}
                                />
                            </div>

                            {/* 버튼 그룹 */}
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button
                                    onClick={handleUpdatePassword}
                                    disabled={updating}
                                    style={{
                                        padding: "12px 24px",
                                        backgroundColor: updating ? "#9ca3af" : "#38d39f",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        cursor: updating ? "not-allowed" : "pointer"
                                    }}
                                >
                                    {updating ? "변경 중..." : "비밀번호 변경"}
                                </button>
                                
                                <button
                                    onClick={handleCancelEdit}
                                    style={{
                                        padding: "12px 24px",
                                        backgroundColor: "#f7fafc",
                                        color: "#4a5568",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        cursor: "pointer"
                                    }}
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setEditMode('password')}
                            style={{
                                padding: "12px 24px",
                                backgroundColor: "#e2e8f0",
                                color: "#4a5568",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                cursor: "pointer"
                            }}
                        >
                            비밀번호 변경하기
                        </button>
                    )}
                </div>

                {/* 회원탈퇴 카드 */}
                <div style={{
                    backgroundColor: "#fff",
                    padding: "32px",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    border: "1px solid #fed7d7"
                }}>
                    <h2 style={{
                        fontSize: "20px",
                        fontWeight: "600",
                        marginBottom: "16px",
                        color: "#e53e3e"
                    }}>
                        회원탈퇴
                    </h2>
                    
                    <p style={{
                        fontSize: "14px",
                        color: "#4a5568",
                        marginBottom: "24px"
                    }}>
                        회원탈퇴시 모든 데이터가 삭제되며 복구할 수 없습니다.
                    </p>

                    {showWithdraw ? (
                        <div>
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    marginBottom: "8px",
                                    color: "#374151"
                                }}>
                                    비밀번호 확인 *
                                </label>
                                <input
                                    type="password"
                                    value={withdrawPassword}
                                    onChange={(e) => setWithdrawPassword(e.target.value)}
                                    placeholder="비밀번호를 입력하세요"
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        outline: "none"
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "12px" }}>
                                <button
                                    onClick={handleWithdraw}
                                    disabled={withdrawing}
                                    style={{
                                        padding: "12px 24px",
                                        backgroundColor: withdrawing ? "#9ca3af" : "#e53e3e",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        cursor: withdrawing ? "not-allowed" : "pointer"
                                    }}
                                >
                                    {withdrawing ? "탈퇴 중..." : "회원탈퇴"}
                                </button>
                                
                                <button
                                    onClick={() => {
                                        setShowWithdraw(false);
                                        setWithdrawPassword("");
                                        setError("");
                                    }}
                                    style={{
                                        padding: "12px 24px",
                                        backgroundColor: "#f7fafc",
                                        color: "#4a5568",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        cursor: "pointer"
                                    }}
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowWithdraw(true)}
                            style={{
                                padding: "12px 24px",
                                backgroundColor: "#fed7d7",
                                color: "#e53e3e",
                                border: "1px solid #feb2b2",
                                borderRadius: "8px",
                                fontSize: "16px",
                                cursor: "pointer"
                            }}
                        >
                            회원탈퇴하기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
