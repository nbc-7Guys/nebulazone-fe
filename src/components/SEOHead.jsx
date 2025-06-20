import { useEffect } from 'react';

export default function SEOHead({
    title = "네불라존 - 중고 PC 부품 거래 플랫폼",
    description = "믿을 수 있는 중고 PC 부품 거래와 커뮤니티. 경매, 직거래, 채팅까지 한번에!",
    keywords = "중고 PC, 컴퓨터 부품, 경매, 직거래, 커뮤니티",
    image = "/og-image.jpg",
    url,
    type = "website"
}) {
    useEffect(() => {
        // 기본 메타 태그
        document.title = title;
        
        // 메타 태그 업데이트 함수
        const updateMetaTag = (name, content, property = false) => {
            const attribute = property ? 'property' : 'name';
            let meta = document.querySelector(`meta[${attribute}="${name}"]`);
            
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(attribute, name);
                document.head.appendChild(meta);
            }
            
            meta.setAttribute('content', content);
        };

        // 기본 메타 태그들
        updateMetaTag('description', description);
        updateMetaTag('keywords', keywords);
        
        // Open Graph 태그들
        updateMetaTag('og:title', title, true);
        updateMetaTag('og:description', description, true);
        updateMetaTag('og:type', type, true);
        updateMetaTag('og:image', image, true);
        updateMetaTag('og:site_name', '네불라존', true);
        
        if (url) {
            updateMetaTag('og:url', url, true);
        }
        
        // Twitter Card 태그들
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', description);
        updateMetaTag('twitter:image', image);

        // 추가 메타 태그들
        updateMetaTag('robots', 'index, follow');
        updateMetaTag('author', '네불라존');
        updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    }, [title, description, keywords, image, url, type]);

    return null; // 렌더링할 JSX 없음
}
