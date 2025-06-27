// 날짜 포맷팅 유틸리티

export const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch {
        return '';
    }
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return '';
    }
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch {
        return '';
    }
};

export const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 1) return '방금 전';
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        
        return formatDate(dateString);
    } catch {
        return '';
    }
};

export const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    
    try {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    } catch {
        return false;
    }
};

export const isToday = (dateString) => {
    return isSameDay(dateString, new Date());
};

export const formatChatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        
        if (isSameDay(date, now)) {
            return formatTime(dateString);
        } else {
            return formatDate(dateString);
        }
    } catch {
        return '';
    }
};
