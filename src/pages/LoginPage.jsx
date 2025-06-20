import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import HeaderNav from "../components/HeaderNav";
import {JwtManager} from "../utils/JwtManager";
import {ENV} from "../utils/env";
import {authApi} from "../services/api.js";

const INIT_FORM = {email: "", password: ""};

export default function LoginPage() {
    const [form, setForm] = useState(INIT_FORM);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const navigate = useNavigate();

    const onChange = e => {
        const {name, value} = e.target;
        setForm(f => ({...f, [name]: value}));
    };

    const onSubmit = async e => {
        e.preventDefault();
        setErrMsg("");
        setLoading(true);
        try {
            const data = await authApi.signIn(form.email, form.password);
            if (!data.accessToken || !data.refreshToken) {
                throw new Error("토큰이 응답에 없습니다.");
            }
            JwtManager.setJwt(data.accessToken, data.refreshToken);
            setForm(INIT_FORM);
            navigate("/", {replace: true});
        } catch (error) {
            console.error("로그인 오류:", error);
            setErrMsg(error.message || "이메일 또는 비밀번호가 올바르지 않습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleKakaoLogin = async () => {
        window.location.href = `${ENV.API_BASE_URL}/oauth2/authorization/kakao`;
    };

    const handleNaverLogin = async () => {
        window.location.href = `${ENV.API_BASE_URL}/oauth2/authorization/naver`;
    };

    return (
        <div style={{background: "#fafbfc", minHeight: "100vh"}}>
            <HeaderNav/>
            <div style={{
                maxWidth: 420, margin: "56px auto", background: "#fff", borderRadius: 16,
                boxShadow: "0 2px 12px #0001", padding: "44px 0"
            }}>
                <h2 style={{textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 36}}>로그인</h2>
                <form style={{maxWidth: 330, margin: "0 auto"}} onSubmit={onSubmit}>
                    <div style={{marginBottom: 18}}>
                        <input name="email" value={form.email} onChange={onChange}
                               placeholder="아이디(이메일)" style={inputStyle} autoComplete="username"/>
                    </div>
                    <div style={{marginBottom: 20}}>
                        <input type="password" name="password" value={form.password} onChange={onChange}
                               placeholder="비밀번호" style={inputStyle} autoComplete="current-password"/>
                    </div>
                    {errMsg && <div style={{color: "red", marginBottom: 10}}>{errMsg}</div>}
                    <button type="submit" disabled={loading}
                            style={{
                                width: "100%", marginTop: 8, background: "#1986F8", color: "#fff",
                                fontWeight: 600, fontSize: 17, borderRadius: 8, border: "none",
                                padding: "12px 0"
                            }}>
                        {loading ? "로그인 중..." : "로그인"}
                    </button>
                </form>
                <div style={{margin: "20px 0", textAlign: "center"}}>
                    <p style={{color: "#666", marginBottom: 15}}>또는</p>

                    <button
                        type="button"
                        onClick={handleKakaoLogin}
                        style={{
                            width: "100%",
                            marginBottom: 10,
                            background: "none",
                            border: "none",
                            borderRadius: 8,
                            padding: 0,
                            cursor: "pointer"
                        }}>
                        <img
                            src="https://developers.kakao.com/tool/resource/static/img/button/login/full/ko/kakao_login_large_wide.png"
                            alt="카카오로 로그인"
                            style={{ width: "100%", height: 58, borderRadius: 8 }}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={handleNaverLogin}
                        style={{
                            width: "100%",
                            background: "none",
                            border: "none",
                            borderRadius: 8,
                            padding: 0,
                            cursor: "pointer"
                        }}>
                        <img
                            src="naver-login.png"
                            alt="네이버로 로그인"
                            style={{ width: "100%", height: 58, borderRadius: 8 }}
                        />
                    </button>

                </div>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%", fontSize: 16, padding: "14px 15px",
    border: "1px solid #eee", borderRadius: 8, outline: "none",
    marginBottom: 0, marginTop: 0, background: "#fafbfc"
};
