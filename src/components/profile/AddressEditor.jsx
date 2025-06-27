import React, {useState} from 'react';

const AddressEditor = ({
                           user,
                           onAddAddress,      // (address) => Promise
                           onUpdateAddress,   // (nickname, address) => Promise
                           onDeleteAddress    // (nickname) => Promise
                       }) => {
    const [editMode, setEditMode] = useState(null); // 'edit', 'add', null
    const [selectedNickname, setSelectedNickname] = useState(null);
    const [formData, setFormData] = useState({
        roadAddress: '',
        detailAddress: '',
        addressNickname: ''
    });
    const [updating, setUpdating] = useState(false);

    // 수정 시작
    const handleEdit = (address) => {
        setEditMode('edit');
        setSelectedNickname(address.addressNickname);
        setFormData({...address});
    };

    // 삭제
    const handleDelete = async (address) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        setUpdating(true);
        try {
            await onDeleteAddress(address);
            setEditMode(null);
            setSelectedNickname(null);
        } finally {
            setUpdating(false);
        }
    };

    // 추가 시작
    const handleAdd = () => {
        setEditMode('add');
        setSelectedNickname(null);
        setFormData({
            roadAddress: '',
            detailAddress: '',
            addressNickname: ''
        });
    };

    // 입력값 변경
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 저장(수정/추가)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            if (editMode === 'edit') {
                await onUpdateAddress(selectedNickname, formData);
            } else {
                await onAddAddress(formData);
            }
            setEditMode(null);
            setSelectedNickname(null);
            setFormData({
                roadAddress: '',
                detailAddress: '',
                addressNickname: ''
            });
        } finally {
            setUpdating(false);
        }
    };

    // 취소
    const handleCancel = () => {
        setEditMode(null);
        setSelectedNickname(null);
        setFormData({
            roadAddress: '',
            detailAddress: '',
            addressNickname: ''
        });
    };

    return (
        <div style={{
            backgroundColor: "#fff",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            marginBottom: "24px"
        }}>
            <h3 style={{fontSize: "20px", fontWeight: "600", color: "#1a202c", marginBottom: "20px"}}>
                주소 목록
            </h3>
            {/* 주소 목록 */}
            <ul style={{listStyle: "none", padding: 0, marginBottom: "20px"}}>
                {user.addresses && user.addresses.length > 0 ? (
                    user.addresses.map((address) => (
                        <li key={address.addressNickname} style={{
                            background: "#f9fafb",
                            borderRadius: "8px",
                            padding: "18px",
                            marginBottom: "14px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <div>
                                <div>
                                    <span style={{fontWeight: "600"}}>별칭:</span> {address.addressNickname}
                                </div>
                                <div>
                                    <span style={{fontWeight: "600"}}>도로명 주소:</span> {address.roadAddress}
                                </div>
                                <div>
                                    <span style={{fontWeight: "600"}}>상세 주소:</span> {address.detailAddress}
                                </div>
                            </div>
                            <div>
                                <button
                                    onClick={() => handleEdit(address)}
                                    style={{
                                        marginRight: "8px",
                                        padding: "6px 12px",
                                        background: "#38d39f",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "6px",
                                        fontSize: "14px",
                                        cursor: "pointer"
                                    }}
                                >
                                    수정
                                </button>
                                <button
                                    onClick={() => handleDelete(address)}
                                    style={{
                                        padding: "6px 12px",
                                        background: "#e53e3e",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "6px",
                                        fontSize: "14px",
                                        cursor: "pointer"
                                    }}
                                >
                                    삭제
                                </button>
                            </div>
                        </li>
                    ))
                ) : (
                    <li style={{
                        color: "#6b7280",
                        padding: "16px",
                        textAlign: "center"
                    }}>
                        등록된 주소가 없습니다.
                    </li>
                )}
            </ul>
            {/* 주소 추가 버튼 */}
            <button
                onClick={handleAdd}
                style={{
                    padding: "10px 20px",
                    background: "#3182ce",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "15px",
                    fontWeight: "500",
                    cursor: "pointer",
                    marginBottom: "18px"
                }}
            >
                주소 추가
            </button>

            {/* 입력/수정 폼 */}
            {(editMode === 'edit' || editMode === 'add') && (
                <form onSubmit={handleSubmit} style={{marginTop: "20px"}}>
                    <div style={{marginBottom: "16px"}}>
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
                    <div style={{marginBottom: "16px"}}>
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
                    <div style={{marginBottom: "20px"}}>
                        <label style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "6px",
                            color: "#374151"
                        }}>
                            주소 별칭 *
                        </label>
                        <input
                            type="text"
                            value={formData.addressNickname}
                            onChange={(e) => handleInputChange('addressNickname', e.target.value)}
                            placeholder="예: 집, 회사"
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
                            onClick={handleCancel}
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
            )}
        </div>
    );
};

export default AddressEditor;
