import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Breadcrumb = ({ customItems = null }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // 기본 브레드크럼 아이템 생성
    const generateBreadcrumbItems = () => {
        const pathnames = location.pathname.split('/').filter((x) => x);
        const items = [{ label: '홈', path: '/', icon: '🏠' }];

        let currentPath = '';
        pathnames.forEach((pathname, index) => {
            currentPath += `/${pathname}`;
            
            // 경로별 라벨 매핑
            const pathLabels = {
                '/catalogs': { label: '카탈로그', icon: '📖' },
                '/products': { label: '상품', icon: '🛍️' },
                '/posts': { label: '커뮤니티', icon: '📝' },
                '/chat': { label: '채팅', icon: '💬' },
                '/mypage': { label: '마이페이지', icon: '👤' },
                '/transactions': { label: '거래내역', icon: '📋' },
                '/login': { label: '로그인', icon: '🔑' },
                '/signup': { label: '회원가입', icon: '✍️' }
            };

            // 동적 ID 처리 (예: /catalogs/123)
            if (pathLabels[`/${pathnames[0]}`] && index === 1) {
                items.push({
                    label: `상세보기`,
                    path: currentPath,
                    icon: '📄'
                });
            } else if (pathLabels[currentPath]) {
                items.push({
                    ...pathLabels[currentPath],
                    path: currentPath
                });
            } else if (pathname === 'direct') {
                items.push({ label: '직거래', path: currentPath, icon: '🤝' });
            } else if (pathname === 'auction') {
                items.push({ label: '경매', path: currentPath, icon: '⚡' });
            } else if (pathname === 'create') {
                items.push({ label: '등록', path: currentPath, icon: '➕' });
            } else if (pathname === 'edit') {
                items.push({ label: '수정', path: currentPath, icon: '✏️' });
            } else if (pathname === 'rooms') {
                items.push({ label: '목록', path: currentPath, icon: '📋' });
            } else {
                // 숫자인 경우 (ID) 건너뛰기
                if (!/^\d+$/.test(pathname)) {
                    items.push({
                        label: pathname.charAt(0).toUpperCase() + pathname.slice(1),
                        path: currentPath,
                        icon: '📄'
                    });
                }
            }
        });

        return items;
    };

    const items = customItems || generateBreadcrumbItems();

    const handleItemClick = (path, index) => {
        if (index < items.length - 1) { // 마지막 아이템이 아닌 경우만 클릭 가능
            navigate(path);
        }
    };

    return (
        <nav 
            aria-label="breadcrumb" 
            style={{
                padding: "12px 0",
                marginBottom: "20px"
            }}
        >
            <ol style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: 0,
                padding: 0,
                listStyle: "none",
                flexWrap: "wrap"
            }}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const isClickable = !isLast;
                    
                    return (
                        <li 
                            key={index}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                        >
                            <button
                                onClick={() => handleItemClick(item.path, index)}
                                disabled={!isClickable}
                                className={isClickable ? "smooth-transition" : ""}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "6px 12px",
                                    background: isLast 
                                        ? "linear-gradient(135deg, #38d39f, #2eb888)" 
                                        : "transparent",
                                    color: isLast ? "#fff" : "#6b7280",
                                    border: isLast ? "none" : "1px solid transparent",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: isLast ? "600" : "500",
                                    cursor: isClickable ? "pointer" : "default",
                                    textDecoration: "none",
                                    boxShadow: isLast ? "0 2px 8px rgba(56, 211, 159, 0.3)" : "none"
                                }}
                                onMouseEnter={(e) => {
                                    if (isClickable) {
                                        e.target.style.backgroundColor = "#f7fafc";
                                        e.target.style.borderColor = "#e2e8f0";
                                        e.target.style.color = "#38d39f";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (isClickable) {
                                        e.target.style.backgroundColor = "transparent";
                                        e.target.style.borderColor = "transparent";
                                        e.target.style.color = "#6b7280";
                                    }
                                }}
                            >
                                <span style={{ fontSize: "12px" }}>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                            
                            {!isLast && (
                                <span style={{
                                    color: "#cbd5e0",
                                    fontSize: "14px",
                                    userSelect: "none"
                                }}>
                                    /
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;