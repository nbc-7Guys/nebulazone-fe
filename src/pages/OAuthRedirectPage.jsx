import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {JwtManager} from "../services/managers/JwtManager";
import {useToastContext} from "../contexts/ToastContext";

export default function OAuthRedirectPage() {
    const navigate = useNavigate();
    const { toast } = useToastContext();

    useEffect(() => {
        // 1. 이미 로그인된 상태면 홈으로
        if (JwtManager.getJwt()) {
            navigate("/", { replace: true });
            return;
        }

        // 2. URL에서 토큰 추출
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("access_token");

        console.log("Extracted tokens:", { accessToken });

        if (accessToken) {
            // 3. 토큰 저장
            JwtManager.setJwt(accessToken);
            console.log("Tokens stored. Navigating home...");

            // 소셜 로그인 성공 토스트 표시
            toast.success("소셜 로그인에 성공했습니다!", {
                title: "환영합니다!",
                duration: 3000
            });

            // 4. 짧은 지연 후 홈으로 이동
            setTimeout(() => {
                navigate("/", { replace: true });
            }, 50);
        } else {
            console.error("Tokens missing, redirecting to login");
            
            // 소셜 로그인 실패 토스트 표시
            toast.error("소셜 로그인에 실패했습니다.", {
                title: "로그인 실패",
                duration: 5000
            });
            
            navigate("/login");
        }
    }, [navigate]);

    return <div>로그인 처리 중...</div>;
}
