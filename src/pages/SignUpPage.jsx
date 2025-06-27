import React, { useState } from "react";
import axios from "axios";
import HeaderNav from "../components/layout/HeaderNav";
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
            const errorInfo = ErrorHandler.handleApiError(error);
            
            // 구체적인 에러 메시지 설정
            if (errorInfo.status === 409) {
                if (errorInfo.message && errorInfo.message.includes('이메일')) {
                    setErrMsg("이미 사용 중인 이메일입니다.");
                } else if (errorInfo.message && errorInfo.message.includes('닉네임')) {
                    setErrMsg("이미 사용 중인 닉네임입니다.");
                } else {
                    setErrMsg("이미 존재하는 정보입니다. 다른 이메일이나 닉네임을 사용해주세요.");
                }
            } else if (errorInfo.status === 400) {
                setErrMsg(errorInfo.message || "입력 정보를 확인해주세요.");
            } else {
                setErrMsg(errorInfo.message || "회원가입에 실패했습니다. 다시 시도해주세요.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "#fafbfc", minHeight: "100vh" }}>
            <HeaderNav />
            <div style={{ maxWidth: 540, margin: "56px auto", background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px #0001", padding: "48px 0" }}>
                <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 700, marginBottom: 42 }}>회원가입</h2>
                <form style={{ maxWidth: 440, margin: "0 auto" }} onSubmit={onSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <input name="email" value={form.email} onChange={onChange}
                               placeholder="아이디를 입력하세요" style={inputStyle} autoComplete="username" />
                        <div style={labelStyle}>아이디</div>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <input type="password" name="password" value={form.password} onChange={onChange}
                               placeholder="비밀번호를 입력하세요" style={inputStyle} autoComplete="new-password" />
                        <div style={labelStyle}>비밀번호</div>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <input name="nickname" value={form.nickname} onChange={onChange}
                               placeholder="닉네임을 입력하세요" style={inputStyle} />
                        <div style={labelStyle}>닉네임</div>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <input name="phone" value={form.phone} onChange={onChange}
                               placeholder="전화번호를 입력하세요" style={inputStyle} />
                        <div style={labelStyle}>전화번호</div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <input name="roadAddress" value={form.roadAddress} onChange={onChange}
                               placeholder="주소를 입력하세요" style={inputStyle} />
                        <div style={labelStyle}>도로명 주소</div>
                    </div>
                    <div style={{ marginBottom: 26 }}>
                        <input name="detailAddress" value={form.detailAddress} onChange={onChange}
                               placeholder="주소를 입력하세요" style={inputStyle} />
                        <div style={labelStyle}>상세 주소</div>
                    </div>
                    <div style={{ marginBottom: 22 }}>
                        <label style={{ fontSize: 15 }}>
                            <input type="checkbox" name="agree" checked={form.agree} onChange={onChange} style={{ marginRight: 8 }} />
                            개인정보 수집 및 이용 동의
                        </label>
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
    );
}

const inputStyle = {
    width: "100%", fontSize: 17, padding: "15px 16px",
    border: "1px solid #eee", borderRadius: 8, outline: "none",
    marginBottom: 6, marginTop: 8, background: "#fafbfc"
};

const labelStyle = {
    position: "absolute", left: -9999, fontSize: 15, color: "#222"
};
