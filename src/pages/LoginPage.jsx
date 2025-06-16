import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderNav from "../components/HeaderNav";
import { JwtManager } from "../utils/JwtManager";
import { ENV } from "../utils/env";

const INIT_FORM = { email: "", password: "" };

export default function LoginPage() {
    const [form, setForm] = useState(INIT_FORM);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const navigate = useNavigate();

    const onChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const onSubmit = async e => {
        e.preventDefault();
        setErrMsg("");
        setLoading(true);
        try {
            const res = await fetch(`${ENV.API_BASE_URL}/auth/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password
                })
            });
            if (!res.ok) throw new Error("로그인 실패");
            const data = await res.json();
            if (!data.accessToken || !data.refreshToken) throw new Error("토큰이 응답에 없습니다.");
            JwtManager.setJwt(data.accessToken, data.refreshToken);
            setForm(INIT_FORM);
            navigate("/", { replace: true });
        } catch (err) {
            setErrMsg("이메일 또는 비밀번호가 올바르지 않습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "#fafbfc", minHeight: "100vh" }}>
            <HeaderNav />
            <div style={{
                maxWidth: 420, margin: "56px auto", background: "#fff", borderRadius: 16,
                boxShadow: "0 2px 12px #0001", padding: "44px 0"
            }}>
                <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 36 }}>로그인</h2>
                <form style={{ maxWidth: 330, margin: "0 auto" }} onSubmit={onSubmit}>
                    <div style={{ marginBottom: 18 }}>
                        <input name="email" value={form.email} onChange={onChange}
                               placeholder="아이디(이메일)" style={inputStyle} autoComplete="username" />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <input type="password" name="password" value={form.password} onChange={onChange}
                               placeholder="비밀번호" style={inputStyle} autoComplete="current-password" />
                    </div>
                    {errMsg && <div style={{ color: "red", marginBottom: 10 }}>{errMsg}</div>}
                    <button type="submit" disabled={loading}
                            style={{
                                width: "100%", marginTop: 8, background: "#1986F8", color: "#fff",
                                fontWeight: 600, fontSize: 17, borderRadius: 8, border: "none",
                                padding: "12px 0"
                            }}>
                        {loading ? "로그인 중..." : "로그인"}
                    </button>
                </form>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%", fontSize: 16, padding: "14px 15px",
    border: "1px solid #eee", borderRadius: 8, outline: "none",
    marginBottom: 0, marginTop: 0, background: "#fafbfc"
};
