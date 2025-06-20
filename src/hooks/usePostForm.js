import { useState, useCallback, useEffect, useRef } from 'react';
import { PostType } from '../types/PostType';

export const usePostForm = (initialData = {}) => {
    // 폼 데이터 상태
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: PostType.FREE,
        remainImageUrls: [],
        ...initialData
    });

    // 이미지 관련 상태
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
    
    // 폼 상태
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 초기 데이터 참조 (변경 감지용)
    const initialDataRef = useRef(initialData);

    // 폼 데이터 변경 핸들러
    const updateField = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        setIsDirty(true);
        
        // 해당 필드 에러 클리어
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [errors]);

    // 다중 필드 업데이트
    const updateFields = useCallback((updates) => {
        setFormData(prev => ({ ...prev, ...updates }));
        setIsDirty(true);
        
        // 업데이트된 필드들의 에러 클리어
        const updatedFields = Object.keys(updates);
        if (updatedFields.some(field => errors[field])) {
            setErrors(prev => {
                const newErrors = { ...prev };
                updatedFields.forEach(field => {
                    delete newErrors[field];
                });
                return newErrors;
            });
        }
    }, [errors]);

    // 이미지 관련 함수들
    const addImages = useCallback((newImages) => {
        const totalImages = formData.remainImageUrls.length + selectedImages.length + newImages.length;
        
        if (totalImages > 5) {
            throw new Error('이미지는 최대 5개까지 업로드할 수 있습니다.');
        }

        // 파일 검증
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        
        for (const file of newImages) {
            if (file.size > maxSize) {
                throw new Error('이미지 파일은 5MB 이하만 업로드할 수 있습니다.');
            }
            if (!allowedTypes.includes(file.type)) {
                throw new Error('JPG, PNG, GIF 파일만 업로드할 수 있습니다.');
            }
        }

        // 새 이미지 추가
        const newSelectedImages = [...selectedImages, ...newImages];
        const newPreviewUrls = [...imagePreviewUrls];

        newImages.forEach(file => {
            const previewUrl = URL.createObjectURL(file);
            newPreviewUrls.push(previewUrl);
        });

        setSelectedImages(newSelectedImages);
        setImagePreviewUrls(newPreviewUrls);
        setIsDirty(true);
    }, [formData.remainImageUrls.length, selectedImages, imagePreviewUrls]);

    const removeImage = useCallback((index) => {
        if (index < 0 || index >= selectedImages.length) return;
        
        // 미리보기 URL 정리
        URL.revokeObjectURL(imagePreviewUrls[index]);
        
        const newImages = selectedImages.filter((_, i) => i !== index);
        const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
        
        setSelectedImages(newImages);
        setImagePreviewUrls(newPreviewUrls);
        setIsDirty(true);
    }, [selectedImages, imagePreviewUrls]);

    const removeExistingImage = useCallback((imageUrl) => {
        setFormData(prev => ({
            ...prev,
            remainImageUrls: prev.remainImageUrls.filter(url => url !== imageUrl)
        }));
        setIsDirty(true);
    }, []);

    // 폼 검증
    const validateForm = useCallback(() => {
        const newErrors = {};

        // 제목 검증
        if (!formData.title.trim()) {
            newErrors.title = '제목을 입력해주세요.';
        } else if (formData.title.length > 100) {
            newErrors.title = '제목은 100자 이하로 입력해주세요.';
        }

        // 내용 검증
        if (!formData.content.trim()) {
            newErrors.content = '내용을 입력해주세요.';
        } else if (formData.content.length > 5000) {
            newErrors.content = '내용은 5000자 이하로 입력해주세요.';
        }

        // 게시판 타입 검증
        if (!Object.values(PostType).includes(formData.type)) {
            newErrors.type = '올바른 게시판을 선택해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // 특정 필드 검증
    const validateField = useCallback((field) => {
        const fieldErrors = {};

        switch (field) {
            case 'title':
                if (!formData.title.trim()) {
                    fieldErrors.title = '제목을 입력해주세요.';
                } else if (formData.title.length > 100) {
                    fieldErrors.title = '제목은 100자 이하로 입력해주세요.';
                }
                break;
            case 'content':
                if (!formData.content.trim()) {
                    fieldErrors.content = '내용을 입력해주세요.';
                } else if (formData.content.length > 5000) {
                    fieldErrors.content = '내용은 5000자 이하로 입력해주세요.';
                }
                break;
            case 'type':
                if (!Object.values(PostType).includes(formData.type)) {
                    fieldErrors.type = '올바른 게시판을 선택해주세요.';
                }
                break;
        }

        setErrors(prev => ({
            ...prev,
            ...fieldErrors
        }));

        return Object.keys(fieldErrors).length === 0;
    }, [formData]);

    // 폼 제출 데이터 준비
    const getSubmitData = useCallback(() => {
        if (!validateForm()) {
            throw new Error('폼 검증에 실패했습니다.');
        }

        return {
            formData: {
                title: formData.title.trim(),
                content: formData.content.trim(),
                type: formData.type,
                ...(formData.remainImageUrls && { remainImageUrls: formData.remainImageUrls })
            },
            selectedImages
        };
    }, [formData, selectedImages, validateForm]);

    // 폼 리셋
    const resetForm = useCallback((newInitialData = {}) => {
        const resetData = {
            title: '',
            content: '',
            type: PostType.FREE,
            remainImageUrls: [],
            ...newInitialData
        };

        setFormData(resetData);
        
        // 이미지 관련 상태 초기화
        imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        setSelectedImages([]);
        setImagePreviewUrls([]);
        
        // 기타 상태 초기화
        setErrors({});
        setIsDirty(false);
        setIsSubmitting(false);
        
        initialDataRef.current = resetData;
    }, [imagePreviewUrls]);

    // 변경사항 확인
    const hasChanges = useCallback(() => {
        const initial = initialDataRef.current;
        
        return (
            formData.title !== (initial.title || '') ||
            formData.content !== (initial.content || '') ||
            formData.type !== (initial.type || PostType.FREE) ||
            formData.remainImageUrls.length !== (initial.remainImageUrls?.length || 0) ||
            selectedImages.length > 0 ||
            isDirty
        );
    }, [formData, selectedImages, isDirty]);

    // 에러 클리어
    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    const clearError = useCallback((field) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    // 제출 상태 관리
    const setSubmitting = useCallback((submitting) => {
        setIsSubmitting(submitting);
    }, []);

    // 초기 데이터가 변경되면 폼 업데이트
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            const newFormData = {
                title: '',
                content: '',
                type: PostType.FREE,
                remainImageUrls: [],
                ...initialData
            };
            
            setFormData(newFormData);
            initialDataRef.current = newFormData;
            setIsDirty(false);
        }
    }, [initialData]);

    // 컴포넌트 언마운트 시 미리보기 URL 정리
    useEffect(() => {
        return () => {
            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviewUrls]);

    return {
        // 폼 데이터
        formData,
        selectedImages,
        imagePreviewUrls,
        
        // 상태
        errors,
        isDirty,
        isSubmitting,
        
        // 액션
        updateField,
        updateFields,
        addImages,
        removeImage,
        removeExistingImage,
        
        // 검증
        validateForm,
        validateField,
        clearError,
        clearErrors,
        
        // 유틸리티
        getSubmitData,
        resetForm,
        hasChanges,
        setSubmitting,
        
        // 계산된 값
        isValid: Object.keys(errors).length === 0,
        totalImageCount: formData.remainImageUrls.length + selectedImages.length,
        canAddMoreImages: formData.remainImageUrls.length + selectedImages.length < 5,
        titleLength: formData.title.length,
        contentLength: formData.content.length
    };
};

export default usePostForm;
