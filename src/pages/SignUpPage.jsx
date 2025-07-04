import React, { useState } from "react";
import axios from "axios";
import HeaderNav from "../components/layout/HeaderNav";
import PrivacyModal from "../components/ui/PrivacyModal";
import { ENV } from "../utils/env";
import { ErrorHandler, ToastManager } from "../utils/error/errorHandler";
import {useNavigate} from "react-router-dom";

const INIT_FORM = {
    email: "",
    password: "",
    nickname: "",
    phone: "",
    roadAddress: "",
    detailAddress: "",
    agree: false,
};

export default function SignUpPage() {
    const [form, setForm] = useState(INIT_FORM);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const navigate = useNavigate();

    // 입력 값 변경
    const onChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({
            ...f,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // 간단 벨리데이션
    const validate = () => {
        if (!form.email || !form.password || !form.nickname || !form.phone ||
            !form.roadAddress || !form.detailAddress) return "모든 필드를 입력하세요.";
        if (!form.agree) return "개인정보 수집 및 이용에 동의해야 합니다.";
        // 이메일, 비밀번호, 핸드폰번호 등 추가 벨리데이션도 필요시 추가
        return null;
    };

    // 개인정보 동의 모달 핸들러
    const handlePrivacyModalOpen = () => {
        setShowPrivacyModal(true);
    };

    const handlePrivacyModalClose = () => {
        setShowPrivacyModal(false);
    };

    const handlePrivacyAgree = () => {
        setForm(f => ({ ...f, agree: true }));
        setShowPrivacyModal(false);
    };

    const onSubmit = async e => {
        e.preventDefault();
        setErrMsg("");
        setSuccess(false);
        const err = validate();
        if (err) {
            setErrMsg(err);
            return;
        }
        setLoading(true);

        // 서버 API 구조에 맞춰 주소 배열 구성
        const payload = {
            email: form.email,
            password: form.password,
            nickname: form.nickname,
            phone: form.phone,
            addresses: [
                {
                    roadAddress: form.roadAddress,
                    detailAddress: form.detailAddress,
                    addressNickname: "기본배송지"
                }
            ]
        };

        try {
            await axios.post(`${ENV.API_BASE_URL}/users/signup`, payload, {
                headers: { "Content-Type": "application/json" }
            });
            setSuccess(true);
            setForm(INIT_FORM);
            ToastManager.success("회원가입이 완료되었습니다!");
            navigate("/login");
        } catch (error) {
            console.error("회원가입 실패:", error);
            
            // 서버 응답이 있는 경우 직접 처리
            if (error.response?.data) {
                const errorData = error.response.data;
                
                // 409 중복 에러 처리
                if (errorData.status === 409) {
                    if (errorData.message.includes('이메일')) {
                        setErrMsg("이미 사용 중인 이메일입니다.");
                    } else if (errorData.message.includes('닉네임')) {
                        setErrMsg("이미 사용 중인 닉네임입니다.");
                    } else if (errorData.message.includes('핸드폰번호')) {
                        setErrMsg("이미 사용 중인 핸드폰번호입니다.");
                    } else {
                        setErrMsg(errorData.message || "이미 존재하는 정보입니다.");
                    }
                }
                // 400 입력값 검증 에러 처리
                else if (errorData.status === 400) {
                    if (errorData.errors && errorData.errors.length > 0) {
                        // 첫 번째 에러 메시지 사용
                        const firstError = errorData.errors[0];
                        setErrMsg(firstError.reason || "입력값을 확인해주세요.");
                    } else {
                        setErrMsg(errorData.message || "입력값을 확인해주세요.");
                    }
                }
                // 기타 에러
                else {
                    setErrMsg(errorData.message || "회원가입에 실패했습니다.");
                }
            } else {
                // 네트워크 에러 등
                setErrMsg("회원가입에 실패했습니다. 다시 시도해주세요.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "#fafbfc", minHeight: "100vh" }}>
            <HeaderNav />
            
            <div style={{ 
                maxWidth: 540, 
                margin: "56px auto", 
                background: "#fff", 
                borderRadius: 16, 
                boxShadow: "0 2px 12px #0001", 
                padding: "48px 0" 
            }}>
                <h2 style={{ 
                    textAlign: "center", 
                    fontSize: 32, 
                    fontWeight: 700, 
                    marginBottom: 42 
                }}>
                    회원가입
                </h2>

                {/* 폼 */}
                <div style={{ maxWidth: 440, margin: "0 auto" }}>
                    <form onSubmit={onSubmit}>
                        {/* 이메일 */}
                        <div style={fieldContainerStyle}>
                            <label style={labelStyle}>이메일</label>
                            <input 
                                name="email" 
                                value={form.email} 
                                onChange={onChange}
                                placeholder="example@email.com" 
                                style={inputStyle} 
                                autoComplete="username"
                                type="email"
                                onFocus={(e) => e.target.style.borderColor = "#1986F8"}
                                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                            />
                        </div>

                        {/* 비밀번호 */}
                        <div style={fieldContainerStyle}>
                            <label style={labelStyle}>비밀번호</label>
                            <input 
                                type="password" 
                                name="password" 
                                value={form.password} 
                                onChange={onChange}
                                placeholder="8자 이상, 대소문자, 숫자, 특수문자 포함" 
                                style={inputStyle} 
                                autoComplete="new-password"
                                onFocus={(e) => e.target.style.borderColor = "#1986F8"}
                                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                            />
                        </div>

                        {/* 닉네임 */}
                        <div style={fieldContainerStyle}>
                            <label style={labelStyle}>닉네임</label>
                            <input 
                                name="nickname" 
                                value={form.nickname} 
                                onChange={onChange}
                                placeholder="2~10자 한글, 영문, 숫자" 
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = "#1986F8"}
                                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                            />
                        </div>

                        {/* 전화번호 */}
                        <div style={fieldContainerStyle}>
                            <label style={labelStyle}>전화번호</label>
                            <input 
                                name="phone" 
                                value={form.phone} 
                                onChange={onChange}
                                placeholder="010-1234-5678" 
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = "#1986F8"}
                                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                            />
                        </div>

                        {/* 주소 */}
                        <div style={fieldContainerStyle}>
                            <label style={labelStyle}>도로명 주소</label>
                            <input 
                                name="roadAddress" 
                                value={form.roadAddress} 
                                onChange={onChange}
                                placeholder="서울시 강남구 테헤란로 123" 
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = "#1986F8"}
                                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                            />
                        </div>

                        <div style={fieldContainerStyle}>
                            <label style={labelStyle}>상세 주소</label>
                            <input 
                                name="detailAddress" 
                                value={form.detailAddress} 
                                onChange={onChange}
                                placeholder="101동 1001호" 
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = "#1986F8"}
                                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                            />
                        </div>

                        {/* 개인정보 동의 */}
                        <div style={{ marginBottom: 22 }}>
                            <label style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                cursor: "pointer",
                                fontSize: 15
                            }}>
                                <input 
                                    type="checkbox" 
                                    name="agree" 
                                    checked={form.agree} 
                                    onChange={onChange} 
                                    style={{ 
                                        marginRight: 8,
                                        cursor: "pointer"
                                    }} 
                                />
                                개인정보 수집 및 이용 동의
                            </label>
                            <button
                                type="button"
                                onClick={handlePrivacyModalOpen}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#1986F8",
                                    fontSize: 13,
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                    marginTop: 4,
                                    marginLeft: 24,
                                    padding: 0
                                }}
                            >
                                약관 전문 보기
                            </button>
                        </div>

                        {errMsg && <div style={{ color: "red", marginBottom: 10 }}>{errMsg}</div>}
                        {success && <div style={{ color: "#38d39f", marginBottom: 10 }}>회원가입이 완료되었습니다!</div>}

                        <button type="submit" disabled={loading}
                                style={{
                                    width: "100%",
                                    marginTop: 18,
                                    background: "#1986F8",
                                    color: "#fff",
                                    fontWeight: 600,
                                    fontSize: 18,
                                    borderRadius: 8,
                                    border: "none",
                                    padding: "15px 0",
                                    letterSpacing: "1px"
                                }}
                        >
                            {loading ? "회원가입 중..." : "회원가입"}
                        </button>
                    </form>
                </div>
            </div>

            {/* 개인정보 동의 모달 */}
            <PrivacyModal 
                isOpen={showPrivacyModal}
                onClose={handlePrivacyModalClose}
                onAgree={handlePrivacyAgree}
            />
        </div>
    );
}

const fieldContainerStyle = {
    marginBottom: 20
};

const labelStyle = {
    display: "block",
    fontSize: 14,
    fontWeight: 500,
    color: "#333",
    marginBottom: 6
};

const inputStyle = {
    width: "100%", 
    fontSize: 17, 
    padding: "15px 16px",
    border: "1px solid #eee", 
    borderRadius: 8, 
    outline: "none",
    marginBottom: 6, 
    marginTop: 2, 
    background: "#fafbfc",
    transition: "border-color 0.2s ease"
};
