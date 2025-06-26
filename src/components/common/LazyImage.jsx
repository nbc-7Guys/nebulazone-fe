import React, { useState, useRef, useEffect } from 'react';

export default function LazyImage({
    src,
    alt,
    placeholder = null,
    fallback = null,
    className,
    style,
    ...props
}) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef();

    // Intersection Observer로 뷰포트 감지
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px' // 50px 전에 미리 로딩 시작
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
        setHasError(false);
    };

    const handleError = () => {
        setHasError(true);
        setIsLoaded(false);
    };

    return (
        <div
            ref={imgRef}
            style={{
                position: 'relative',
                overflow: 'hidden',
                ...style
            }}
            className={className}
        >
            {/* 플레이스홀더 (로딩 중이거나 뷰포트에 없을 때) */}
            {(!isInView || !isLoaded) && !hasError && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f7fafc',
                        color: '#a0aec0'
                    }}
                >
                    {placeholder || (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                border: '3px solid #e2e8f0',
                                borderTop: '3px solid #38d39f',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <span style={{ fontSize: '12px' }}>로딩 중...</span>
                        </div>
                    )}
                </div>
            )}

            {/* 에러 상태 */}
            {hasError && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f7fafc',
                        color: '#a0aec0'
                    }}
                >
                    {fallback || (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '32px' }}>🖼️</span>
                            <span style={{ fontSize: '12px' }}>이미지 로딩 실패</span>
                        </div>
                    )}
                </div>
            )}

            {/* 실제 이미지 */}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: isLoaded ? 1 : 0,
                        transition: 'opacity 0.3s ease'
                    }}
                    {...props}
                />
            )}

            {/* 로딩 애니메이션 CSS */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
