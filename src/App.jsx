import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ChatRoomPage from "./pages/ChatRoomPage";
import ChatRoomListPage from "./pages/ChatRoomListPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import { JwtManager } from "./utils/JwtManager";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<ProductListPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/chat/:roomId" element={<ChatRoomPage />} />
                <Route path="/chat/rooms" element={<ChatRoomListPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} /> {/* 로그인 추가 */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
