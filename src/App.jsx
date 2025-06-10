import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ChatRoomPage from "./pages/ChatRoomPage";
import ChatRoomListPage from "./pages/ChatRoomListPage";
import JwtInputModal from "./components/JwtInputModal";
import SignUpPage from "./pages/SignUpPage";
import { JwtManager } from "./utils/JwtManager";

function App() {
    const [jwt, setJwt] = useState(JwtManager.getJwt());
    const [modalOpen, setModalOpen] = useState(!jwt);

    const handleLogout = () => {
        JwtManager.removeTokens();
        setJwt(null);
        setModalOpen(true);
    };

    const handleSaveJwt = (newJwt) => {
        setJwt(newJwt);
        setModalOpen(false);
    };

    return (
        <BrowserRouter>
            <button onClick={handleLogout} style={{ position: "fixed", top: 12, right: 16, zIndex: 2000, fontSize: 14 }}>로그아웃</button>
            <JwtInputModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={handleSaveJwt} />
            <Routes>
                <Route path="/" element={<ProductListPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/chat/:roomId" element={<ChatRoomPage />} />
                <Route path="/chat/rooms" element={<ChatRoomListPage />} />
                <Route path="/signup" element={<SignUpPage />} /> {/* 회원가입 추가 */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
