import React from "react";
import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
    const navigate = useNavigate();

    const handleClick = () => {
        // 상세 페이지로 이동, product id 사용
        navigate(`/products/${product.id}`);
    };

    return (
        <div
            onClick={handleClick}
            style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 32,
                borderBottom: "1px solid #f1f1f1",
                paddingBottom: 20,
                cursor: "pointer",
                transition: "background 0.1s",
            }}
            onMouseOver={e => e.currentTarget.style.background = "#f5f7fa"}
            onMouseOut={e => e.currentTarget.style.background = "transparent"}
        >
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 17 }}>{product.name}</div>
                <div style={{ color: "#888", marginTop: 2, fontSize: 14 }}>{product.category}</div>
            </div>
            <img src={product.image} alt={product.name} style={{ width: 140, height: 90, borderRadius: 10, objectFit: "cover" }} />
        </div>
    );
}

export default ProductCard;
