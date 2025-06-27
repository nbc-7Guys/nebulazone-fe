import React, { useState } from 'react';

const ExpandableSection = ({ title, children, defaultExpanded = false, icon = "📋" }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="bg-primary rounded-lg shadow border mb-4 overflow-hidden">
            {/* 헤더 */}
            <button
                onClick={toggleExpanded}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleExpanded();
                    }
                }}
                aria-expanded={isExpanded}
                aria-controls={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
                className="w-full p-6 bg-transparent border-none cursor-pointer flex items-center justify-between text-lg font-semibold text-primary transition-fast hover:bg-secondary focus:bg-secondary focus:ring"
            >
                <div className="flex items-center" style={{ gap: "12px" }}>
                    <span className="text-xl">{icon}</span>
                    <span>{title}</span>
                </div>
                
                <div className="flex items-center" style={{ gap: "8px" }}>
                    <span className="text-xs text-muted font-medium">
                        {isExpanded ? "접기" : "펼치기"}
                    </span>
                    <div 
                        className="w-6 h-6 rounded-full bg-muted flex items-center justify-center smooth-transform"
                        style={{
                            width: "24px",
                            height: "24px",
                            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)"
                        }}
                    >
                        <span className="text-sm text-secondary">▼</span>
                    </div>
                </div>
            </button>

            {/* 콘텐츠 */}
            <div
                id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
                className="overflow-hidden smooth-transition"
                style={{
                    maxHeight: isExpanded ? "none" : "0",
                    opacity: isExpanded ? 1 : 0,
                    transform: isExpanded ? "translateY(0)" : "translateY(-10px)"
                }}
            >
                <div className="p-6 pt-0 border-t border-light">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ExpandableSection;