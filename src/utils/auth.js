import { jwtDecode } from "jwt-decode";
import { JwtManager } from "./JwtManager";

export function getMyUserIdFromJwt() {
    const jwt = JwtManager.getJwt();
    if (!jwt) return null;
    try {
        const decoded = jwtDecode(jwt);
        return decoded.jti;
    } catch {
        return null;
    }
}
