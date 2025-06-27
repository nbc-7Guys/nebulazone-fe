import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({ 
    children, 
    content, 
    position = 'top', 
    delay = 500,
    className = '',
    style = {}
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const timeoutRef = useRef(null);
    const containerRef = useRef(null);
    const tooltipRef = useRef(null);

    const showTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
            if (containerRef.current && tooltipRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const tooltipRect = tooltipRef.current.getBoundingClientRect();
                
                let top, left;
                
                switch (position) {
                    case 'top':
                        top = containerRect.top - tooltipRect.height - 8;
                        left = containerRect.left + (containerRect.width - tooltipRect.width) / 2;
                        break;
                    case 'bottom':
                        top = containerRect.bottom + 8;
                        left = containerRect.left + (containerRect.width - tooltipRect.width) / 2;
                        break;
                    case 'left':
                        top = containerRect.top + (containerRect.height - tooltipRect.height) / 2;
                        left = containerRect.left - tooltipRect.width - 8;
                        break;
                    case 'right':
                        top = containerRect.top + (containerRect.height - tooltipRect.height) / 2;
                        left = containerRect.right + 8;
                        break;
                    default:
                        top = containerRect.top - tooltipRect.height - 8;
                        left = containerRect.left + (containerRect.width - tooltipRect.width) / 2;
                }
                
                // 화면 경계 처리
                const padding = 8;
                const maxLeft = window.innerWidth - tooltipRect.width - padding;
                const maxTop = window.innerHeight - tooltipRect.height - padding;
                
                left = Math.max(padding, Math.min(left, maxLeft));
                top = Math.max(padding, Math.min(top, maxTop));
                
                setTooltipPosition({ top, left });
            }
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    if (!content) return children;

    return (
        <>
            <div
                ref={containerRef}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
                className={`inline-block ${className}`}
                style={style}
            >
                {children}
            </div>
            
            {/* 툴팁 내용 (숨겨진 상태로 렌더링하여 크기 측정) */}
            <div
                ref={tooltipRef}
                style={{
                    position: 'fixed',
                    top: tooltipPosition.top,
                    left: tooltipPosition.left,
                    background: 'rgba(0, 0, 0, 0.9)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    zIndex: 9999,
                    opacity: isVisible ? 1 : 0,
                    visibility: isVisible ? 'visible' : 'hidden',
                    transform: `scale(${isVisible ? 1 : 0.8})`,
                    transition: 'all 0.2s ease-out',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    pointerEvents: 'none',
                    maxWidth: '250px',
                    whiteSpace: 'normal',
                    lineHeight: '1.4'
                }}
            >
                {content}
                
                {/* 화살표 */}
                <div
                    style={{
                        position: 'absolute',
                        width: 0,
                        height: 0,
                        borderStyle: 'solid',
                        ...(position === 'top' && {
                            bottom: '-6px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            borderWidth: '6px 6px 0 6px',
                            borderColor: 'rgba(0, 0, 0, 0.9) transparent transparent transparent'
                        }),
                        ...(position === 'bottom' && {
                            top: '-6px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            borderWidth: '0 6px 6px 6px',
                            borderColor: 'transparent transparent rgba(0, 0, 0, 0.9) transparent'
                        }),
                        ...(position === 'left' && {
                            right: '-6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            borderWidth: '6px 0 6px 6px',
                            borderColor: 'transparent transparent transparent rgba(0, 0, 0, 0.9)'
                        }),
                        ...(position === 'right' && {
                            left: '-6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            borderWidth: '6px 6px 6px 0',
                            borderColor: 'transparent rgba(0, 0, 0, 0.9) transparent transparent'
                        })
                    }}
                />
            </div>
        </>
    );
};

export default Tooltip;