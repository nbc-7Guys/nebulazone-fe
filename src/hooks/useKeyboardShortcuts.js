import { useEffect, useRef } from 'react';

const useKeyboardShortcuts = (shortcuts = {}) => {
    const shortcutsRef = useRef(shortcuts);
    
    // shortcuts 업데이트
    useEffect(() => {
        shortcutsRef.current = shortcuts;
    }, [shortcuts]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const { key, ctrlKey, metaKey, altKey, shiftKey, target } = event;
            
            // 입력 필드에서는 일부 단축키 비활성화
            const isInputElement = target.tagName === 'INPUT' || 
                                  target.tagName === 'TEXTAREA' || 
                                  target.contentEditable === 'true';

            // Skip to main content 기능 (Alt + S)
            if (altKey && key.toLowerCase() === 's') {
                event.preventDefault();
                const mainContent = document.querySelector('[role="main"], main, #main-content');
                if (mainContent) {
                    mainContent.focus();
                    mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                return;
            }

            // Tab 키 트래핑 개선 (모달이나 특정 영역에서)
            if (key === 'Tab') {
                const focusableElements = document.querySelectorAll(
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                
                // 현재 포커스된 요소가 마지막 요소인 경우 첫 번째로 이동
                if (!shiftKey && target === focusableElements[focusableElements.length - 1]) {
                    const firstElement = focusableElements[0];
                    if (firstElement && firstElement !== target) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
                // 현재 포커스된 요소가 첫 번째 요소인 경우 마지막으로 이동
                else if (shiftKey && target === focusableElements[0]) {
                    const lastElement = focusableElements[focusableElements.length - 1];
                    if (lastElement && lastElement !== target) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                }
            }

            // 단축키 조합 생성
            const combination = [
                ctrlKey && 'ctrl',
                metaKey && 'meta', // Mac Cmd key
                altKey && 'alt',
                shiftKey && 'shift',
                key.toLowerCase()
            ].filter(Boolean).join('+');

            // 단축키 실행
            Object.entries(shortcutsRef.current).forEach(([shortcut, handler]) => {
                if (shortcut === combination) {
                    // 입력 필드에서 제한된 단축키만 허용
                    if (isInputElement && !['escape', 'ctrl+a', 'ctrl+c', 'ctrl+v', 'ctrl+x'].includes(shortcut)) {
                        return;
                    }
                    
                    event.preventDefault();
                    handler(event);
                }
            });
        };

        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return null;
};

export default useKeyboardShortcuts;