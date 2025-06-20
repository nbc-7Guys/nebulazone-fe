// 게시글 타입 정의
export const PostType = {
    FREE: 'FREE',
    INFO: 'INFO', 
    QUESTION: 'QUESTION'
};

// PostType 검증 함수
export const isValidPostType = (type) => {
    return Object.values(PostType).includes(type);
};

// PostType 한글 변환
export const getPostTypeLabel = (type) => {
    const labels = {
        [PostType.FREE]: '자유게시판',
        [PostType.INFO]: '정보게시판',
        [PostType.QUESTION]: '질문게시판'
    };
    return labels[type] || type;
};

// PostType 옵션 배열 (셀렉트 박스용)
export const POST_TYPE_OPTIONS = [
    { value: PostType.FREE, label: '자유게시판' },
    { value: PostType.INFO, label: '정보게시판' },
    { value: PostType.QUESTION, label: '질문게시판' }
];
