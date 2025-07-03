/**
 * 날짜 관련 유틸리티 함수들
 */

/**
 * 백엔드에서 오는 날짜 문자열을 JavaScript Date 객체로 변환
 * @param {string} dateString - "2025-07-02 01:52:48" 형식의 날짜 문자열
 * @returns {Date|null} - 변환된 Date 객체 또는 null
 */
export function parseBackendDate(dateString) {
    if (!dateString) return null;
    
    try {
        // "2025-07-02 01:52:48" 형식을 "2025-07-02T01:52:48" ISO 형식으로 변환
        const isoString = dateString.replace(' ', 'T');
        const date = new Date(isoString);
        
        // 유효한 날짜인지 확인
        if (isNaN(date.getTime())) {
            console.warn('Invalid date string:', dateString);
            return null;
        }
        
        return date;
    } catch (error) {
        console.error('Error parsing date:', error);
        return null;
    }
}

/**
 * 날짜를 상대적 시간으로 표시 (예: "2시간 전", "3일 전")
 * @param {string|Date} date - 날짜 문자열 또는 Date 객체
 * @returns {string} - 상대적 시간 문자열
 */
export function formatRelativeTime(date) {
    const parsedDate = typeof date === 'string' ? parseBackendDate(date) : date;
    
    if (!parsedDate) return '알 수 없음';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - parsedDate) / 1000);
    
    if (diffInSeconds < 60) {
        return '방금 전';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}분 전`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}시간 전`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays}일 전`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks}주 전`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths}개월 전`;
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}년 전`;
}

/**
 * 날짜를 한국어 형식으로 포맷 (예: "2025년 7월 2일")
 * @param {string|Date} date - 날짜 문자열 또는 Date 객체
 * @param {boolean} includeTime - 시간 포함 여부
 * @returns {string} - 포맷된 날짜 문자열
 */
export function formatKoreanDate(date, includeTime = false) {
    const parsedDate = typeof date === 'string' ? parseBackendDate(date) : date;
    
    if (!parsedDate) return '날짜 없음';
    
    const year = parsedDate.getFullYear();
    const month = parsedDate.getMonth() + 1;
    const day = parsedDate.getDate();
    
    let result = `${year}년 ${month}월 ${day}일`;
    
    if (includeTime) {
        const hours = parsedDate.getHours().toString().padStart(2, '0');
        const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
        result += ` ${hours}:${minutes}`;
    }
    
    return result;
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 * @param {string|Date} date - 날짜 문자열 또는 Date 객체
 * @returns {string} - YYYY-MM-DD 형식의 날짜 문자열
 */
export function formatDateString(date) {
    const parsedDate = typeof date === 'string' ? parseBackendDate(date) : date;
    
    if (!parsedDate) return '';
    
    const year = parsedDate.getFullYear();
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = parsedDate.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * 날짜를 YYYY-MM-DD HH:mm 형식으로 포맷
 * @param {string|Date} date - 날짜 문자열 또는 Date 객체
 * @returns {string} - YYYY-MM-DD HH:mm 형식의 날짜 문자열
 */
export function formatDateTime(date) {
    const parsedDate = typeof date === 'string' ? parseBackendDate(date) : date;
    
    if (!parsedDate) return '';
    
    const year = parsedDate.getFullYear();
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const hours = parsedDate.getHours().toString().padStart(2, '0');
    const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 오늘인지 확인
 * @param {string|Date} date - 날짜 문자열 또는 Date 객체
 * @returns {boolean} - 오늘인지 여부
 */
export function isToday(date) {
    const parsedDate = typeof date === 'string' ? parseBackendDate(date) : date;
    
    if (!parsedDate) return false;
    
    const today = new Date();
    return parsedDate.toDateString() === today.toDateString();
}

/**
 * 어제인지 확인
 * @param {string|Date} date - 날짜 문자열 또는 Date 객체
 * @returns {boolean} - 어제인지 여부
 */
export function isYesterday(date) {
    const parsedDate = typeof date === 'string' ? parseBackendDate(date) : date;
    
    if (!parsedDate) return false;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return parsedDate.toDateString() === yesterday.toDateString();
}

/**
 * 스마트 날짜 포맷 (오늘: 시간만, 어제: "어제", 그 외: 날짜)
 * @param {string|Date} date - 날짜 문자열 또는 Date 객체
 * @returns {string} - 스마트 포맷된 날짜 문자열
 */
export function formatSmartDate(date) {
    const parsedDate = typeof date === 'string' ? parseBackendDate(date) : date;
    
    if (!parsedDate) return '날짜 없음';
    
    if (isToday(parsedDate)) {
        const hours = parsedDate.getHours().toString().padStart(2, '0');
        const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    if (isYesterday(parsedDate)) {
        return '어제';
    }
    
    return formatKoreanDate(parsedDate);
}