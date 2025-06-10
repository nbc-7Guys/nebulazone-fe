import React from "react";
import HeaderNav from "../components/HeaderNav";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import { products } from "../mock/products";

export default function ProductListPage() {
    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <HeaderNav />
            <div style={{ maxWidth: 980, margin: "32px auto 0", background: "#fff", borderRadius: 10, padding: 44 }}>
                <div style={{ fontWeight: 700, fontSize: 32, marginBottom: 10 }}>중고거래</div>
                <div style={{ color: "#93a1b4", fontSize: 15, marginBottom: 34 }}>Explore a wide range of secondhand PC parts from trusted sellers.</div>
                {/* 검색/필터 UI는 일단 모양만 */}
                <div style={{ display: "flex", gap: 12, marginBottom: 30 }}>
                    <select><option>종류</option></select>
                    <select><option>가격 범위</option></select>
                    <input type="text" placeholder="일반 판매..." style={{ flex: 1, padding: 8 }} />
                    <button style={{ background: "#38d39f", color: "#fff", padding: "0 24px", borderRadius: 5 }}>Search</button>
                </div>
                <div>
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                <button style={{
                    marginTop: 18,
                    background: "#38d39f",
                    color: "#fff",
                    padding: "12px 30px",
                    borderRadius: 8,
                    fontWeight: 500,
                    fontSize: 17,
                    border: "none"
                }}>판매 등록</button>
                <Pagination />
            </div>
        </div>
    );
}
