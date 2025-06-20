import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = ({
    fetchMore,
    hasNextPage = false,
    threshold = 100 // 하단에서 얼마나 떨어진 지점에서 로딩을 시작할지 (px)
}) => {
    const [isFetching, setIsFetching] = useState(false);
    const observerTarget = useRef(null);

    // Intersection Observer를 사용한 무한 스크롤
    useEffect(() => {
        if (!observerTarget.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasNextPage && !isFetching) {
                    setIsFetching(true);
                }
            },
            {
                rootMargin: `0px 0px ${threshold}px 0px`,
                threshold: 0
            }
        );

        observer.observe(observerTarget.current);

        return () => {
            observer.disconnect();
        };
    }, [hasNextPage, isFetching, threshold]);

    // 데이터 로딩
    useEffect(() => {
        if (!isFetching) return;

        const loadMore = async () => {
            try {
                await fetchMore();
            } catch (error) {
                console.error('Failed to fetch more data:', error);
            } finally {
                setIsFetching(false);
            }
        };

        loadMore();
    }, [isFetching, fetchMore]);

    // 스크롤 기반 무한 스크롤 (fallback)
    const handleScroll = useCallback(() => {
        if (
            window.innerHeight + document.documentElement.scrollTop
            >= document.documentElement.offsetHeight - threshold
        ) {
            if (hasNextPage && !isFetching) {
                setIsFetching(true);
            }
        }
    }, [hasNextPage, isFetching, threshold]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // 강제로 더 로딩하기
    const loadMore = useCallback(() => {
        if (hasNextPage && !isFetching) {
            setIsFetching(true);
        }
    }, [hasNextPage, isFetching]);

    return {
        isFetching,
        observerTarget,
        loadMore,
        setIsFetching
    };
};

export default useInfiniteScroll;
