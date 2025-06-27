import React from 'react';

const CategorySelector = ({ onCategorySelect }) => {
    const categories = [
        { 
            type: 'CPU', 
            name: 'CPU', 
            description: 'Intel, AMD 등 중앙처리장치',
            icon: '🔥',
            color: '#3B82F6'
        },
        { 
            type: 'GPU', 
            name: 'GPU', 
            description: 'NVIDIA, AMD 등 그래픽카드',
            icon: '⚡',
            color: '#10B981'
        },
        { 
            type: 'SSD', 
            name: 'SSD', 
            description: 'NVME, SATA 등 고속 저장장치',
            icon: '💾',
            color: '#8B5CF6'
        }
    ];

    return (
        <div className="page-enter">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 text-primary">
                    🛍️ 카테고리를 선택하세요
                </h2>
                <p className="text-lg text-muted">
                    판매하실 중고 부품의 카테고리를 선택해주세요
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {categories.map((category, index) => (
                    <div
                        key={category.type}
                        onClick={() => onCategorySelect(category.type)}
                        className="group bg-primary border-2 border-light rounded-xl p-8 cursor-pointer text-center transition-all smooth-transition hover:border-primary hover:shadow-lg hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-primary-light"
                        role="button"
                        tabIndex={index + 1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onCategorySelect(category.type);
                            }
                        }}
                        aria-label={`${category.name} 카테고리 선택`}
                    >
                        {/* 아이콘 */}
                        <div 
                            className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300"
                            style={{ color: category.color }}
                        >
                            {category.icon}
                        </div>
                        
                        {/* 카테고리명 */}
                        <h3 className="text-2xl font-bold mb-3 text-primary group-hover:text-primary-dark transition-colors">
                            {category.name}
                        </h3>
                        
                        {/* 설명 */}
                        <p className="text-muted leading-relaxed group-hover:text-secondary transition-colors">
                            {category.description}
                        </p>
                        
                        {/* 선택 힌트 */}
                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="inline-block px-4 py-2 bg-primary-light text-primary text-sm font-medium rounded-full">
                                클릭하여 선택
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* 키보드 단축키 안내 */}
            <div className="text-center mt-8">
                <p className="text-xs text-light">
                    💡 <strong>Tab</strong>: 카테고리 이동 | <strong>Enter/Space</strong>: 선택
                </p>
            </div>
        </div>
    );
};

export default CategorySelector;