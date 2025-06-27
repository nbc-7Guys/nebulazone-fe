import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HeaderNav from "../components/layout/HeaderNav";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { postApi } from "../services/api";
import { PostType, POST_TYPE_OPTIONS } from "../types/PostType";

export default function PostCreatePage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: PostType.FREE,
        postType: PostType.FREE
    });

    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
            ...(field === 'type' && { postType: value })
        }));
        
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length === 0) return;

        if (selectedImages.length + files.length > 5) {
            alert('이미지는 최대 5개까지 업로드할 수 있습니다.');
            return;
        }

        const maxSize = 5 * 1024 * 1024;
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

    const handleImageRemove = (index) => {
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
        } else if (formData.content.length > 1000) {
            newErrors.content = '내용은 1000자 이하로 입력해주세요.';
        }

        if (!Object.values(PostType).includes(formData.type)) {
            newErrors.type = '올바른 게시판을 선택해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            const postData = {
                title: formData.title.trim(),
                content: formData.content.trim(),
                type: formData.type,
                postType: formData.postType
            };

            const response = await postApi.createPost(postData, selectedImages);
            
            alert('게시글이 성공적으로 작성되었습니다.');
            navigate(`/posts/${response.postId}`);

        } catch (error) {
            console.error('게시글 작성 실패:', error);
            alert(error.message || '게시글 작성에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (formData.title || formData.content || selectedImages.length > 0) {
            if (!window.confirm('작성 중인 내용이 있습니다. 정말로 나가시겠습니까?')) {
                return;
            }
        }
        
        imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        navigate('/posts');
    };

    React.useEffect(() => {
        return () => {
            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <HeaderNav />

            <div style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "40px 20px"
            }}>
                <div style={{ marginBottom: "32px" }}>
                    <h1 style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        color: "#1a202c",
                        marginBottom: "8px"
                    }}>
                        게시글 작성
                    </h1>
                    <p style={{
                        fontSize: "16px",
                        color: "#718096"
                    }}>
                        커뮤니티에 새로운 글을 작성해보세요.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        padding: "32px"
                    }}>
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{
                                display: "block",
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#2d3748",
                                marginBottom: "8px"
                            }}>
                                게시판 선택 *
                            </label>
                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                {POST_TYPE_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleChange('type', option.value)}
                                        style={{
                                            padding: "10px 20px",
                                            borderRadius: "8px",
                                            border: `2px solid ${formData.type === option.value ? '#38d39f' : '#e2e8f0'}`,
                                            backgroundColor: formData.type === option.value ? '#e6fffa' : '#fff',
                                            color: formData.type === option.value ? '#38d39f' : '#4a5568',
                                            cursor: "pointer",
                                            fontWeight: "500",
                                            fontSize: "14px",
                                            transition: "all 0.2s ease"
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
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    border: `2px solid ${errors.title ? '#e53e3e' : '#e2e8f0'}`,
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                    outline: "none",
                                    transition: "border-color 0.2s ease"
                                }}
                                onFocus={(e) => {
                                    if (!errors.title) {
                                        e.target.style.borderColor = '#38d39f';
                                    }
                                }}
                                onBlur={(e) => {
                                    if (!errors.title) {
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
                                    transition: "border-color 0.2s ease"
                                }}
                                onFocus={(e) => {
                                    if (!errors.content) {
                                        e.target.style.borderColor = '#38d39f';
                                    }
                                }}
                                onBlur={(e) => {
                                    if (!errors.content) {
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
                                    {formData.content.length}/1,000
                                </p>
                            </div>
                        </div>

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

                            <input
                                type="file"
                                ref={fileInputRef}
                                multiple
                                accept="image/jpeg,image/jpg,image/png,image/gif"
                                onChange={handleImageSelect}
                                style={{ display: "none" }}
                            />

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={selectedImages.length >= 5}
                                style={{
                                    padding: "12px 24px",
                                    backgroundColor: selectedImages.length >= 5 ? "#f7fafc" : "#e6fffa",
                                    color: selectedImages.length >= 5 ? "#a0aec0" : "#38d39f",
                                    border: `2px dashed ${selectedImages.length >= 5 ? "#e2e8f0" : "#38d39f"}`,
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    cursor: selectedImages.length >= 5 ? "not-allowed" : "pointer",
                                    marginBottom: "16px"
                                }}
                            >
                                📷 이미지 선택 ({selectedImages.length}/5)
                            </button>

                            {selectedImages.length > 0 && (
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
                                                backgroundColor: "#f7fafc"
                                            }}
                                        >
                                            <img
                                                src={url}
                                                alt={`미리보기 ${index + 1}`}
                                                style={{
                                                    width: "100%",
                                                    height: "120px",
                                                    objectFit: "cover"
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleImageRemove(index)}
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
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center"
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "12px"
                        }}>
                            <button
                                type="button"
                                onClick={handleCancel}
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
                                취소
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
                                        작성 중...
                                    </div>
                                ) : (
                                    "게시글 작성"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
