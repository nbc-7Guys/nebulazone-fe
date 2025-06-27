import React from 'react';

const SkeletonCard = () => {
    return (
        <div 
            className="p-6 rounded-xl shadow-lg border relative overflow-hidden"
            style={{
                background: "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-muted) 100%)",
                backdropFilter: "blur(10px)"
            }}
        >
            {/* 타입 배지 스켈레톤 */}
            <div 
                className="skeleton rounded-full mb-4" 
                style={{ width: "100px", height: "32px" }}
            />

            {/* 제품명 스켈레톤 */}
            <div 
                className="skeleton rounded mb-3" 
                style={{ width: "80%", height: "24px" }}
            />
            
            {/* 설명 스켈레톤 (2줄) */}
            <div 
                className="skeleton rounded mb-2" 
                style={{ width: "100%", height: "16px" }}
            />
            <div 
                className="skeleton rounded mb-6" 
                style={{ width: "70%", height: "16px" }}
            />

            {/* 스펙 태그들 스켈레톤 */}
            <div className="flex mb-4" style={{ gap: "8px" }}>
                <div 
                    className="skeleton rounded-lg" 
                    style={{ width: "80px", height: "24px" }}
                />
                <div 
                    className="skeleton rounded-lg" 
                    style={{ width: "60px", height: "24px" }}
                />
            </div>

            {/* 등록일 스켈레톤 */}
            <div 
                className="skeleton rounded ml-auto" 
                style={{ width: "120px", height: "12px" }}
            />
        </div>
    );
};

export default SkeletonCard;