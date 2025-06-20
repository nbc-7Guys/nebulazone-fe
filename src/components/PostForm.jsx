import React, { useState, useRef } from "react";
import { PostType, POST_TYPE_OPTIONS } from "../types/PostType";
import LoadingSpinner from "./LoadingSpinner";

export default function PostForm({
    initialData = {
        title: '',
        content: '',
        type: PostType.FREE,
        remainImageUrls: []
    },
    onSubmit,
    onCancel,
    loading = false,
    mode = 'create', // 'create' or 'edit'
    submitText = '게시글 작성',
    cancelText = '취소'
}) {
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: initialData.title || '',
        content: initialData.content || '',
        type: initialData.type || PostType.FREE,
        remainImageUrls: initialData.remainImageUrls || []
    });

    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // 에러 클리어
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // 기존 이미지 제거 (수정 모드에서만)
    const handleExistingImageRemove = (imageUrl) => {
        setFormData(prev => ({
            ...prev,
            remainImageUrls: prev.remainImageUrls.filter(url => url !== imageUrl)
        }));
    };

    // 새 이미지 선택
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length === 0) return;

        const totalImages = formData.remainImageUrls.length + selectedImages.length + files.length;
        if (totalImages > 5) {
            alert('이미지는 최대 5개까지 업로드할 수 있습니다.');
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        
        for (const file of files) {
            if (file.size > maxSize) {
                alert('이미지 파일은 5MB 이하만 업로드할 수 있습니다.');
                return;
            }
            if (!allowedTypes.includes(file.type)) {
                alert('JPG, PNG, GIF 파일만 업로드할 수 있습니다.');
                return;
            }
        }

        const newImages = [...selectedImages, ...files];
        const newPreviewUrls = [...imagePreviewUrls];

        files.forEach(file => {
            const previewUrl = URL.createObjectURL(file);
            newPreviewUrls.push(previewUrl);
        });

        setSelectedImages(newImages);
        setImagePreviewUrls(newPreviewUrls);
    };

    // 새로 추가한 이미지 제거
    const handleNewImageRemove = (index) => {
        URL.revokeObjectURL(imagePreviewUrls[index]);
        
        const newImages = selectedImages.filter((_, i) => i !== index);
        const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
        
        setSelectedImages(newImages);
        setImagePreviewUrls(newPreviewUrls);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = '제목을 입력해주세요.';
        } else if (formData.title.length > 100) {
            newErrors.title = '제목은 100자 이하로 입력해주세요.';
        }

        if (!formData.content.trim()) {
            newErrors.content = '내용을 입력해주세요.';
        } else if (formData.content.length > 5000) {
            newErrors.content = '내용은 5000자 이하로 입력해주세요.';
        }

        if (!Object.values(PostType).includes(formData.type)) {
            newErrors.type = '올바른 게시판을 선택해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submitData = {
            formData: {
                title: formData.title.trim(),
                content: formData.content.trim(),
                type: formData.type,
                ...(mode === 'edit' && { remainImageUrls: formData.remainImageUrls })
            },
            selectedImages
        };

        onSubmit(submitData);
    };

    // 컴포넌트 언마운트 시 미리보기 URL 정리
    React.useEffect(() => {
        return () => {
            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviewUrls]);

    return (
        <form onSubmit={handleSubmit}>
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                padding: "32px"
            }}>
                {/* 게시판 선택 */}
                <div style={{ marginBottom: "24px" }}>
                    <label style={{
                        display: "block",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#2d3748",
                        marginBottom: "8px"
                    }}>
                        게시판 선택 *
                        {mode === 'edit' && (
                            <span style={{ 
                                fontSize: "12px", 
                                fontWeight: "normal", 
                                color: "#718096",
                                marginLeft: "8px"
                            }}>
                                (수정 불가)
                            </span>
                        )}
                    </label>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        {POST_TYPE_OPTIONS.map(option => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => mode === 'create' && handleChange('type', option.value)}
                                disabled={mode === 'edit'}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    border: `2px solid ${formData.type === option.value ? '#38d39f' : '#e2e8f0'}`,
                                    backgroundColor: formData.type === option.value ? '#e6fffa' : mode === 'edit' ? '#f7fafc' : '#fff',
                                    color: formData.type === option.value ? '#38d39f' : mode === 'edit' ? '#a0aec0' : '#4a5568',
                                    cursor: mode === 'edit' ? "not-allowed" : "pointer",
                                    fontWeight: "500",
                                    fontSize: "14px",
                                    transition: "all 0.2s ease",
                                    opacity: mode === 'edit' ? 0.6 : 1
                                }}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    {errors.type && (
                        <p style={{ color: "#e53e3e", fontSize: "14px", marginTop: "4px" }}>
                            {errors.type}
                        </p>
                    )}
                </div>

                {/* 제목 입력 */}
                <div style={{ marginBottom: "24px" }}>
                    <label style={{
                        display: "block",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#2d3748",
                        marginBottom: "8px"
                    }}>
                        제목 *
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="제목을 입력해주세요"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: `2px solid ${errors.title ? '#e53e3e' : '#e2e8f0'}`,
                            borderRadius: "8px",
                            fontSize: "16px",
                            outline: "none",
                            transition: "border-color 0.2s ease",
                            backgroundColor: loading ? "#f7fafc" : "#fff"
                        }}
                        onFocus={(e) => {
                            if (!errors.title && !loading) {
                                e.target.style.borderColor = '#38d39f';
                            }
                        }}
                        onBlur={(e) => {
                            if (!errors.title && !loading) {
                                e.target.style.borderColor = '#e2e8f0';
                            }
                        }}
                    />
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "4px"
                    }}>
                        {errors.title && (
                            <p style={{ color: "#e53e3e", fontSize: "14px" }}>
                                {errors.title}
                            </p>
                        )}
                        <p style={{
                            color: "#718096",
                            fontSize: "12px",
                            marginLeft: "auto"
                        }}>
                            {formData.title.length}/100
                        </p>
                    </div>
                </div>

                {/* 내용 입력 */}
                <div style={{ marginBottom: "24px" }}>
                    <label style={{
                        display: "block",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#2d3748",
                        marginBottom: "8px"
                    }}>
                        내용 *
                    </label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => handleChange('content', e.target.value)}
                        placeholder="내용을 입력해주세요"
                        rows={15}
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "16px",
                            border: `2px solid ${errors.content ? '#e53e3e' : '#e2e8f0'}`,
                            borderRadius: "8px",
                            fontSize: "16px",
                            outline: "none",
                            resize: "vertical",
                            minHeight: "200px",
                            lineHeight: "1.6",
                            transition: "border-color 0.2s ease",
                            backgroundColor: loading ? "#f7fafc" : "#fff"
                        }}
                        onFocus={(e) => {
                            if (!errors.content && !loading) {
                                e.target.style.borderColor = '#38d39f';
                            }
                        }}
                        onBlur={(e) => {
                            if (!errors.content && !loading) {
                                e.target.style.borderColor = '#e2e8f0';
                            }
                        }}
                    />
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "4px"
                    }}>
                        {errors.content && (
                            <p style={{ color: "#e53e3e", fontSize: "14px" }}>
                                {errors.content}
                            </p>
                        )}
                        <p style={{
                            color: "#718096",
                            fontSize: "12px",
                            marginLeft: "auto"
                        }}>
                            {formData.content.length}/5000
                        </p>
                    </div>
                </div>

                {/* 이미지 관리 */}
                <div style={{ marginBottom: "32px" }}>
                    <label style={{
                        display: "block",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#2d3748",
                        marginBottom: "8px"
                    }}>
                        이미지 첨부 (선택사항)
                    </label>
                    <p style={{
                        fontSize: "14px",
                        color: "#718096",
                        marginBottom: "12px"
                    }}>
                        최대 5개, 파일당 5MB 이하, JPG/PNG/GIF 형식만 가능
                    </p>

                    {/* 기존 이미지들 (수정 모드에서만) */}
                    {mode === 'edit' && formData.remainImageUrls.length > 0 && (
                        <div style={{ marginBottom: "16px" }}>
                            <h4 style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#4a5568",
                                marginBottom: "8px"
                            }}>
                                기존 이미지 ({formData.remainImageUrls.length}개)
                            </h4>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                                gap: "12px",
                                marginBottom: "16px"
                            }}>
                                {formData.remainImageUrls.map((imageUrl, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            position: "relative",
                                            borderRadius: "8px",
                                            overflow: "hidden",
                                            backgroundColor: "#f7fafc",
                                            border: "2px solid #e6fffa"
                                        }}
                                    >
                                        <img
                                            src={imageUrl}
                                            alt={`기존 이미지 ${index + 1}`}
                                            style={{
                                                width: "100%",
                                                height: "120px",
                                                objectFit: "cover"
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleExistingImageRemove(imageUrl)}
                                            disabled={loading}
                                            style={{
                                                position: "absolute",
                                                top: "4px",
                                                right: "4px",
                                                width: "24px",
                                                height: "24px",
                                                backgroundColor: "#e53e3e",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "50%",
                                                fontSize: "12px",
                                                cursor: loading ? "not-allowed" : "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                opacity: loading ? 0.5 : 1
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 새 이미지 추가 */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={handleImageSelect}
                        disabled={loading}
                        style={{ display: "none" }}
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading || formData.remainImageUrls.length + selectedImages.length >= 5}
                        style={{
                            padding: "12px 24px",
                            backgroundColor: loading || formData.remainImageUrls.length + selectedImages.length >= 5 ? "#f7fafc" : "#e6fffa",
                            color: loading || formData.remainImageUrls.length + selectedImages.length >= 5 ? "#a0aec0" : "#38d39f",
                            border: `2px dashed ${loading || formData.remainImageUrls.length + selectedImages.length >= 5 ? "#e2e8f0" : "#38d39f"}`,
                            borderRadius: "8px",
                            fontSize: "14px",
                            cursor: loading || formData.remainImageUrls.length + selectedImages.length >= 5 ? "not-allowed" : "pointer",
                            marginBottom: "16px"
                        }}
                    >
                        📷 이미지 선택 ({formData.remainImageUrls.length + selectedImages.length}/5)
                    </button>

                    {/* 새로 추가한 이미지들 */}
                    {selectedImages.length > 0 && (
                        <div>
                            <h4 style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#4a5568",
                                marginBottom: "8px"
                            }}>
                                새로 추가한 이미지 ({selectedImages.length}개)
                            </h4>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                                gap: "12px"
                            }}>
                                {imagePreviewUrls.map((url, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            position: "relative",
                                            borderRadius: "8px",
                                            overflow: "hidden",
                                            backgroundColor: "#f7fafc",
                                            border: "2px solid #fed7e2"
                                        }}
                                    >
                                        <img
                                            src={url}
                                            alt={`새 이미지 ${index + 1}`}
                                            style={{
                                                width: "100%",
                                                height: "120px",
                                                objectFit: "cover"
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleNewImageRemove(index)}
                                            disabled={loading}
                                            style={{
                                                position: "absolute",
                                                top: "4px",
                                                right: "4px",
                                                width: "24px",
                                                height: "24px",
                                                backgroundColor: "#e53e3e",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "50%",
                                                fontSize: "12px",
                                                cursor: loading ? "not-allowed" : "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                opacity: loading ? 0.5 : 1
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 버튼들 */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px"
                }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        style={{
                            padding: "14px 28px",
                            backgroundColor: "#f7fafc",
                            color: "#4a5568",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontSize: "16px",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: "14px 28px",
                            backgroundColor: loading ? "#a0aec0" : "#38d39f",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: loading ? "not-allowed" : "pointer",
                            minWidth: "120px"
                        }}
                    >
                        {loading ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <LoadingSpinner size="small" />
                                처리 중...
                            </div>
                        ) : (
                            submitText
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
