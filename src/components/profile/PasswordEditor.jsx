import React from 'react';

const PasswordEditor = ({
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
                    비밀번호 변경
                </h3>
                {editMode !== 'password' && (
                    <button
                        onClick={() => setEditMode('password')}
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
                        변경
                    </button>
                )}
            </div>

            {editMode === 'password' ? (
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "16px" }}>
                        <label style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "6px",
                            color: "#374151"
                        }}>
                            현재 비밀번호
                        </label>
                        <input
                            type="password"
                            value={formData.oldPassword}
                            onChange={(e) => handleInputChange('oldPassword', e.target.value)}
                            placeholder="현재 비밀번호를 입력하세요"
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
                    <div style={{ marginBottom: "16px" }}>
                        <label style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "6px",
                            color: "#374151"
                        }}>
                            새 비밀번호
                        </label>
                        <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                            placeholder="새 비밀번호를 입력하세요"
                            required
                            minLength="8"
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
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "6px",
                            color: "#374151"
                        }}>
                            새 비밀번호 확인
                        </label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            placeholder="새 비밀번호를 다시 입력하세요"
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
                            {updating ? "변경 중..." : "변경"}
                        </button>
                    </div>
                </form>
            ) : (
                <p style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: 0
                }}>
                    보안을 위해 정기적으로 비밀번호를 변경해주세요.
                </p>
            )}
        </div>
    );
};

export default PasswordEditor;