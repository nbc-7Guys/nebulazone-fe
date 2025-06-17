import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductCreatePage from "./pages/ProductCreatePage";
import MyPage from "./pages/MyPage";
import ChatRoomPage from "./pages/ChatRoomPage";
import ChatRoomListPage from "./pages/ChatRoomListPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";
import { JwtManager } from "./utils/JwtManager";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<ProductListPage />} />
                <Route path="/products/create" element={<ProductCreatePage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/chat/:roomId" element={<ChatRoomPage />} />
                <Route path="/chat/rooms" element={<ChatRoomListPage />} />
                <Route path="/transactions" element={<TransactionHistoryPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} /> {/* 로그인 추가 */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
