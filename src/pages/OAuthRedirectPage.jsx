import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {JwtManager} from "../utils/JwtManager";

export default function OAuthRedirectPage() {
    const navigate = useNavigate();

    useEffect(() => {
        // 1. 이미 로그인된 상태면 홈으로
        if (JwtManager.getJwt()) {
            navigate("/", { replace: true });
            return;
        }

        // 2. URL에서 토큰 추출
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        console.log("Extracted tokens:", { accessToken, refreshToken });

        if (accessToken && refreshToken) {
            // 3. 토큰 저장
            JwtManager.setJwt(accessToken, refreshToken);
            console.log("Tokens stored. Navigating home...");

            // 4. 짧은 지연 후 홈으로 이동
            setTimeout(() => {
                navigate("/", { replace: true });
            }, 50);
        } else {
            console.error("Tokens missing, redirecting to login");
            navigate("/login");
        }
    }, [navigate]);

    return <div>로그인 처리 중...</div>;
}
