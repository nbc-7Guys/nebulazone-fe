import React from 'react';

const AddressEditor = ({
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

    const defaultAddress = user?.addresses?.find(addr =>
        addr.addressNickname === "기본배송지" || user?.addresses?.length === 1
    ) || {};

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
                    배송 주소
                </h3>
                {editMode !== 'address' && (
                    <button
                        onClick={() => setEditMode('address')}
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

            {editMode === 'address' ? (
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "16px" }}>
                        <label style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "6px",
                            color: "#374151"
                        }}>
                            도로명 주소 *
                        </label>
                        <input
                            type="text"
                            value={formData.roadAddress}
                            onChange={(e) => handleInputChange('roadAddress', e.target.value)}
                            placeholder="도로명 주소를 입력하세요"
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
                            상세 주소
                        </label>
                        <input
                            type="text"
                            value={formData.detailAddress}
                            onChange={(e) => handleInputChange('detailAddress', e.target.value)}
                            placeholder="상세 주소를 입력하세요"
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
                            주소 별칭
                        </label>
                        <input
                            type="text"
                            value={formData.addressNickname}
                            onChange={(e) => handleInputChange('addressNickname', e.target.value)}
                            placeholder="예: 집, 회사 (기본값: 기본배송지)"
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
                <div>
                    {defaultAddress.roadAddress ? (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "100px 1fr",
                            gap: "12px",
                            alignItems: "start"
                        }}>
                            <span style={{
                                fontSize: "14px",
                                color: "#6b7280",
                                fontWeight: "500"
                            }}>
                                도로명:
                            </span>
                            <span style={{
                                fontSize: "16px",
                                color: "#1a202c"
                            }}>
                                {defaultAddress.roadAddress}
                            </span>

                            {defaultAddress.detailAddress && (
                                <>
                                    <span style={{
                                        fontSize: "14px",
                                        color: "#6b7280",
                                        fontWeight: "500"
                                    }}>
                                        상세주소:
                                    </span>
                                    <span style={{
                                        fontSize: "16px",
                                        color: "#1a202c"
                                    }}>
                                        {defaultAddress.detailAddress}
                                    </span>
                                </>
                            )}

                            <span style={{
                                fontSize: "14px",
                                color: "#6b7280",
                                fontWeight: "500"
                            }}>
                                별칭:
                            </span>
                            <span style={{
                                fontSize: "16px",
                                color: "#1a202c"
                            }}>
                                {defaultAddress.addressNickname || "기본배송지"}
                            </span>
                        </div>
                    ) : (
                        <p style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            margin: 0
                        }}>
                            등록된 배송 주소가 없습니다. 주소를 등록해주세요.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AddressEditor;