import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import HeaderNav from "../components/layout/HeaderNav";
import {JwtManager} from "../services/managers/JwtManager";
import {ENV} from "../utils/env";
import {authApi} from "../services/api";
import {useToastContext} from "../contexts/ToastContext";

const INIT_FORM = {email: "", password: ""};

export default function LoginPage() {
    const [form, setForm] = useState(INIT_FORM);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const navigate = useNavigate();
    const { toast } = useToastContext();

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
            
            // 로그인 성공 토스트 표시
            toast.success("로그인에 성공했습니다!", {
                title: "환영합니다!",
                duration: 3000
            });
            
            navigate("/", {replace: true});
        } catch (error) {
            console.error("로그인 오류:", error);
            setErrMsg(error.message || "이메일 또는 비밀번호가 올바르지 않습니다.");
            
            // 로그인 실패 토스트 표시
            toast.error(error.message || "이메일 또는 비밀번호가 올바르지 않습니다.", {
                title: "로그인 실패",
                duration: 5000
            });
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
                <div style={{margin: "24px 0", textAlign: "center"}}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "20px 0",
                        color: "#666"
                    }}>
                        <div style={{flex: 1, height: "1px", background: "#e1e5e9"}}></div>
                        <span style={{padding: "0 16px", fontSize: 14}}>간편 로그인</span>
                        <div style={{flex: 1, height: "1px", background: "#e1e5e9"}}></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleKakaoLogin}
                        style={{
                            width: "90%",
                            height: 50,
                            marginBottom: 12,
                            marginRight: 20,
                            marginLeft: 20,
                            background: "none",
                            border: "none",
                            borderRadius: 12,
                            cursor: "pointer",
                            padding: 0,
                            transition: "all 0.2s ease",
                            overflow: "hidden"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow = "0 4px 12px rgba(254, 229, 0, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0px)";
                            e.target.style.boxShadow = "0 2px 8px rgba(254, 229, 0, 0.3)";
                        }}>
                        <img
                            src="/kakao_login_large_wide.png"
                            alt="카카오로 로그인"
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 12,
                                objectFit: "cover"
                            }}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={handleNaverLogin}
                        style={{
                            width: "90%",
                            marginRight:20,
                            marginLeft:20,
                            height: 50,
                            background: "#03C75A",
                            border: "none",
                            borderRadius: 12,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#fff",
                            transition: "all 0.2s ease",
                            boxShadow: "0 2px 8px rgba(3, 199, 90, 0.3)"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = "#02B351";
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow = "0 4px 12px rgba(3, 199, 90, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "#03C75A";
                            e.target.style.transform = "translateY(0px)";
                            e.target.style.boxShadow = "0 2px 8px rgba(3, 199, 90, 0.3)";
                        }}>
                        <span style={{
                            display: "inline-block",
                            width: 18,
                            height: 18,
                            marginRight: 8,
                            background: "#fff",
                            borderRadius: 2,
                            fontSize: 12,
                            fontWeight: 800,
                            color: "#03C75A",
                            lineHeight: "18px",
                            textAlign: "center"
                        }}>N</span>
                        네이버로 시작하기
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
