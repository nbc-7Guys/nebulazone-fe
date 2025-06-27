import React from 'react';

const CatalogInfo = ({ catalog }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '';
        }
    };

    const getTypeLabel = (type) => {
        const typeMap = {
            'CPU': '프로세서',
            'GPU': '그래픽카드',
            'SSD': '저장장치'
        };
        return typeMap[type] || type;
    };

    // 카탈로그 설명을 줄바꿈으로 분리하여 표시
    const formatDescription = (description) => {
        if (!description) return [];
        
        // 슬래시나 세미콜론으로 분리
        const items = description.split(/[/;]/).map(item => item.trim()).filter(item => item.length > 0);
        return items;
    };

    // 사양 아이템을 카테고리별로 그룹화
    const categorizeSpecs = (items) => {
        const categories = {
            power: { title: '⚡ 전원 사양', items: [], icon: '⚡', color: 'bg-yellow-50 border-yellow-200' },
            performance: { title: '🚀 성능 사양', items: [], icon: '🚀', color: 'bg-blue-50 border-blue-200' },
            physical: { title: '📏 물리적 사양', items: [], icon: '📏', color: 'bg-green-50 border-green-200' },
            connectivity: { title: '🔌 연결 사양', items: [], icon: '🔌', color: 'bg-purple-50 border-purple-200' },
            features: { title: '✨ 기능 사양', items: [], icon: '✨', color: 'bg-pink-50 border-pink-200' },
            etc: { title: '📦 기타', items: [], icon: '📦', color: 'bg-gray-50 border-gray-200' }
        };

        items.forEach(item => {
            const lowerItem = item.toLowerCase();
            if (lowerItem.includes('전원') || lowerItem.includes('w') || lowerItem.includes('와트') || lowerItem.includes('정격파워')) {
                categories.power.items.push(item);
            } else if (lowerItem.includes('주파수') || lowerItem.includes('mhz') || lowerItem.includes('ghz') || lowerItem.includes('코어') || lowerItem.includes('스트림') || lowerItem.includes('부스트')) {
                categories.performance.items.push(item);
            } else if (lowerItem.includes('길이') || lowerItem.includes('mm') || lowerItem.includes('두께') || lowerItem.includes('가로') || lowerItem.includes('세로') || lowerItem.includes('크기')) {
                categories.physical.items.push(item);
            } else if (lowerItem.includes('pcie') || lowerItem.includes('포트') || lowerItem.includes('hdmi') || lowerItem.includes('출력단자') || lowerItem.includes('연결')) {
                categories.connectivity.items.push(item);
            } else if (lowerItem.includes('팬') || lowerItem.includes('제로팬') || lowerItem.includes('led') || lowerItem.includes('라이트') || lowerItem.includes('백플레이트') || lowerItem.includes('지원')) {
                categories.features.items.push(item);
            } else {
                categories.etc.items.push(item);
            }
        });

        return Object.values(categories).filter(category => category.items.length > 0);
    };

    return (
        <div>
            {/* 헤더 */}
            <div className="flex items-center gap-4 mb-6">
                <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {getTypeLabel(catalog?.catalogType)}
                </span>
                <span className="text-xs text-muted">
                    등록일: {formatDate(catalog?.createdAt)}
                </span>
            </div>

            {/* 기본 정보 */}
            {(catalog?.manufacturer || catalog?.chipset || catalog?.formFactor || catalog?.socket) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {catalog?.manufacturer && (
                        <div className="bg-muted p-4 rounded-lg">
                            <div className="text-sm font-medium text-secondary mb-1">제조사</div>
                            <div className="text-base font-semibold text-primary">{catalog.manufacturer}</div>
                        </div>
                    )}
                    {catalog?.chipset && (
                        <div className="bg-muted p-4 rounded-lg">
                            <div className="text-sm font-medium text-secondary mb-1">칩셋</div>
                            <div className="text-base font-semibold text-primary">{catalog.chipset}</div>
                        </div>
                    )}
                    {catalog?.formFactor && (
                        <div className="bg-muted p-4 rounded-lg">
                            <div className="text-sm font-medium text-secondary mb-1">폼팩터</div>
                            <div className="text-base font-semibold text-primary">{catalog.formFactor}</div>
                        </div>
                    )}
                    {catalog?.socket && (
                        <div className="bg-muted p-4 rounded-lg">
                            <div className="text-sm font-medium text-secondary mb-1">소켓</div>
                            <div className="text-base font-semibold text-primary">{catalog.socket}</div>
                        </div>
                    )}
                </div>
            )}

            {/* 상세 사양 */}
            {catalog?.catalogDescription && (
                <div>
                    
                    {(() => {
                        const items = formatDescription(catalog.catalogDescription);
                        const categories = categorizeSpecs(items);
                        
                        return (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {categories.map((category, categoryIndex) => (
                                    <div key={categoryIndex} className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg hover:-translate-y-1 ${category.color}`}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-2xl">{category.icon}</span>
                                            <h4 className="text-lg font-semibold text-secondary">
                                                {category.title}
                                            </h4>
                                        </div>
                                        <div className="space-y-4">
                                            {category.items.map((item, itemIndex) => (
                                                <div key={itemIndex} className="flex items-start gap-3 group">
                                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0 transition-transform group-hover:scale-125"></div>
                                                    <span className="text-base text-secondary leading-relaxed group-hover:text-primary transition-colors">
                                                        {item}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()} 
                </div>
            )}
        </div>
    );
};

export default CatalogInfo;