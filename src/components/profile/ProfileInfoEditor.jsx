import React from 'react';

const ProfileInfoEditor = ({
    user,
    editMode,
    setEditMode,
    formData,
    setFormData,
    updating,
    onUpdate,
    onCancel
}) => {
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate();
    };

    return (
        <div style={{
            backgroundColor: "#fff",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            marginBottom: "24px"
        }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px"
            }}>
                <h3 style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#1a202c",
                    margin: 0
                }}>
                    기본 정보
                </h3>
                {editMode !== 'nickname' && (
                    <button
                        onClick={() => setEditMode('nickname')}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#38d39f",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "14px",
                            cursor: "pointer",
                            fontWeight: "500"
                        }}
                    >
                        수정
                    </button>
                )}
            </div>

            {editMode === 'nickname' ? (
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "16px" }}>
                        <label style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "6px",
                            color: "#374151"
                        }}>
                            닉네임
                        </label>
                        <input
                            type="text"
                            value={formData.nickname}
                            onChange={(e) => handleInputChange('nickname', e.target.value)}
                            placeholder="새 닉네임을 입력하세요"
                            required
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "14px",
                                outline: "none"
                            }}
                        />
                    </div>
                    <div style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-end"
                    }}>
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#f7fafc",
                                color: "#4a5568",
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                                fontSize: "14px",
                                cursor: "pointer"
                            }}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={updating}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: updating ? "#9ca3af" : "#38d39f",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "14px",
                                cursor: updating ? "not-allowed" : "pointer"
                            }}
                        >
                            {updating ? "저장 중..." : "저장"}
                        </button>
                    </div>
                </form>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr",
                    gap: "12px",
                    alignItems: "center"
                }}>
                    <span style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        fontWeight: "500"
                    }}>
                        닉네임:
                    </span>
                    <span style={{
                        fontSize: "16px",
                        color: "#1a202c"
                    }}>
                        {user?.nickname || "설정되지 않음"}
                    </span>

                    <span style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        fontWeight: "500"
                    }}>
                        이메일:
                    </span>
                    <span style={{
                        fontSize: "16px",
                        color: "#1a202c"
                    }}>
                        {user?.email}
                    </span>

                    <span style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        fontWeight: "500"
                    }}>
                        가입일:
                    </span>
                    <span style={{
                        fontSize: "16px",
                        color: "#1a202c"
                    }}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : "정보 없음"}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ProfileInfoEditor;