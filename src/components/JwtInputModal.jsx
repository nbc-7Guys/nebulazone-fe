import React, { useState } from "react";
import { JwtManager } from "../utils/JwtManager";

export default function JwtInputModal({ open, onClose, onSuccess }) {
    const [jwt, setJwt] = useState("");

    if (!open) return null;

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999
        }}>
            <div style={{
                background: "#fff", padding: "34px 44px", borderRadius: 14, minWidth: 340, boxShadow: "0 2px 20px #0002"
            }}>
                <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 22 }}>JWT 입력 (임시 로그인)</div>
                <input
                    value={jwt}
                    onChange={e => setJwt(e.target.value)}
                    placeholder="JWT 토큰"
                    style={{ width: "100%", padding: 8, marginBottom: 20 }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={onClose} style={{ padding: "8px 18px" }}>취소</button>
                    <button
                        onClick={() => {
                            JwtManager.setJwt(jwt);
                            onSuccess && onSuccess(jwt);
                            onClose();
                        }}
                        style={{
                            background: "#38d39f", color: "#fff", fontWeight: 500, padding: "8px 24px",
                            borderRadius: 6, border: "none"
                        }}
                        disabled={!jwt}
                    >저장</button>
                </div>
            </div>
        </div>
    );
}
