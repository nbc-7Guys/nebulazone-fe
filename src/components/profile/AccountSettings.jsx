import React, { useState } from 'react';

const AccountSettings = ({ onWithdraw, withdrawing }) => {
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawPassword, setWithdrawPassword] = useState("");

    const handleWithdrawSubmit = (e) => {
        e.preventDefault();
        onWithdraw(withdrawPassword);
    };

    return (
        <div style={{
            backgroundColor: "#fff",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
            <h3 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#1a202c",
                marginBottom: "20px"
            }}>
                계정 설정
            </h3>

            <div style={{
                padding: "20px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px"
            }}>
                <h4 style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#dc2626",
                    marginBottom: "12px"
                }}>
                    위험 영역
                </h4>
                <p style={{
                    fontSize: "14px",
                    color: "#7f1d1d",
                    marginBottom: "16px"
                }}>
                    계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                </p>

                {!showWithdraw ? (
                    <button
                        onClick={() => setShowWithdraw(true)}
                        style={{
                            padding: "10px 16px",
                            backgroundColor: "#dc2626",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "14px",
                            cursor: "pointer",
                            fontWeight: "500"
                        }}
                    >
                        회원 탈퇴
                    </button>
                ) : (
                    <form onSubmit={handleWithdrawSubmit}>
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{
                                display: "block",
                                fontSize: "14px",
                                fontWeight: "500",
                                marginBottom: "6px",
                                color: "#7f1d1d"
                            }}>
                                계정 삭제를 위해 비밀번호를 입력하세요
                            </label>
                            <input
                                type="password"
                                value={withdrawPassword}
                                onChange={(e) => setWithdrawPassword(e.target.value)}
                                placeholder="비밀번호"
                                required
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid #f87171",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    outline: "none"
                                }}
                            />
                        </div>
                        <div style={{
                            display: "flex",
                            gap: "8px"
                        }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowWithdraw(false);
                                    setWithdrawPassword("");
                                }}
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
                                disabled={withdrawing}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: withdrawing ? "#9ca3af" : "#dc2626",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    cursor: withdrawing ? "not-allowed" : "pointer"
                                }}
                            >
                                {withdrawing ? "처리 중..." : "계정 삭제"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AccountSettings;