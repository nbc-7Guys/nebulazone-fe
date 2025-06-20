import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderNav from "../components/HeaderNav";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { postApi, userApi } from "../services/api";
import { PostType, POST_TYPE_OPTIONS } from "../types/PostType";
import { getMyUserIdFromJwt } from "../utils/auth";

export default function PostEditPage() {
    const navigate = useNavigate();
    const { postId } = useParams();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: PostType.FREE,
        remainImageUrls: []
    });

    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingPost, setLoadingPost] = useState(true);
    const [errors, setErrors] = useState({});
    const [originalPost, setOriginalPost] = useState(null);
    const [currentUserNickname, setCurrentUserNickname] = useState(null);

    const currentUserId = getMyUserIdFromJwt();

    // 현재 사용자 정보 로드
    useEffect(() => {
        const loadUserInfo = async () => {
            if (currentUserId) {
                try {
                    const userInfo = await userApi.getMyProfile();
                    setCurrentUserNickname(userInfo.nickname);
                } catch (error) {
                    console.error('사용자 정보 로드 실패:', error);
                }
            }
        };

        loadUserInfo();
    }, [currentUserId]);

    // 기존 게시글 로드
    useEffect(() => {
        const loadPost = async () => {
            try {
                setLoadingPost(true);
                const response = await postApi.getPost(postId);
                
                console.log('[PostEditPage] 게시글 정보:', response);
                console.log('[PostEditPage] 현재 사용자:', { currentUserId, currentUserNickname });
                
                // 작성자 확인 - userId가 있으면 userId로, 없으면 닉네임으로 비교
                const isAuthor = currentUserId && (
                    (response.userId && currentUserId === response.userId) ||
                    (currentUserNickname && currentUserNickname === response.author)
                );
                
                if (!isAuthor) {
                    alert('수정 권한이 없습니다.');
                    navigate(`/posts/${postId}`);
                    return;
                }

                setOriginalPost(response);
                setFormData({
                    title: response.title,
                    content: response.content,
                    type: response.type,
                    remainImageUrls: response.imageUrls || []
                });

            } catch (error) {
                console.error('게시글 로드 실패:', error);
                alert('게시글을 불러오는데 실패했습니다.');
                navigate('/posts');
            } finally {
                setLoadingPost(false);
            }
        };

        // 현재 사용자 닉네임이 로드된 후에 게시글을 로드
        if (postId && (currentUserNickname !== null || !currentUserId)) {
            loadPost();
        }
    }, [postId, currentUserId, currentUserNickname, navigate]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // 기존 이미지 제거
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
        } else if (formData.content.length > 1000) {
            newErrors.content = '내용은 1000자 이하로 입력해주세요.';
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
                remainImageUrls: formData.remainImageUrls
            };

            const response = await postApi.updatePost(postId, postData, selectedImages);
            
            alert('게시글이 성공적으로 수정되었습니다.');
            navigate(`/posts/${postId}`);

        } catch (error) {
            console.error('게시글 수정 실패:', error);
            alert(error.message || '게시글 수정에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        const hasChanges = 
            formData.title !== originalPost?.title ||
            formData.content !== originalPost?.content ||
            formData.remainImageUrls.length !== (originalPost?.imageUrls?.length || 0) ||
            selectedImages.length > 0;

        if (hasChanges) {
            if (!window.confirm('수정 중인 내용이 있습니다. 정말로 나가시겠습니까?')) {
                return;
            }
        }
        
        imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        navigate(`/posts/${postId}`);
    };

    // 컴포넌트 언마운트 시 미리보기 URL 정리
    useEffect(() => {
        return () => {
            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviewUrls]);

    if (loadingPost) {
        return (
            <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
                <HeaderNav />
                <div style={{
                    maxWidth: "800px",
                    margin: "0 auto",
                    padding: "40px 20px"
                }}>
                    <LoadingSpinner size="large" message="게시글을 불러오는 중..." />
                </div>
            </div>
        );
    }

    if (!originalPost) {
        return (
            <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
                <HeaderNav />
                <div style={{
                    maxWidth: "800px",
                    margin: "0 auto",
                    padding: "40px 20px"
                }}>
                    <ErrorMessage
                        message="게시글을 찾을 수 없습니다."
                        onRetry={() => navigate('/posts')}
                        retryText="목록으로 돌아가기"
                    />
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <HeaderNav />

            <div style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "40px 20px"
            }}>
                {/* 헤더 */}
                <div style={{ marginBottom: "32px" }}>
                    <h1 style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        color: "#1a202c",
                        marginBottom: "8px"
                    }}>
                        게시글 수정
                    </h1>
                    <p style={{
                        fontSize: "16px",
                        color: "#718096"
                    }}>
                        게시글 내용을 수정해보세요.
                    </p>
                </div>

                {/* 수정 폼 */}
                <form onSubmit={handleSubmit}>
                    <div style={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        padding: "32px"
                    }}>
                        {/* 게시판 선택 - 수정 시에는 비활성화 */}
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{
                                display: "block",
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#2d3748",
                                marginBottom: "8px"
                            }}>
                                게시판 (수정 불가)
                            </label>
                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                {POST_TYPE_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        disabled={true}
                                        style={{
                                            padding: "10px 20px",
                                            borderRadius: "8px",
                                            border: `2px solid ${formData.type === option.value ? '#38d39f' : '#e2e8f0'}`,
                                            backgroundColor: formData.type === option.value ? '#e6fffa' : '#f7fafc',
                                            color: formData.type === option.value ? '#38d39f' : '#a0aec0',
                                            cursor: "not-allowed",
                                            fontWeight: "500",
                                            fontSize: "14px",
                                            opacity: 0.6
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <p style={{
                                fontSize: "12px",
                                color: "#718096",
                                marginTop: "4px"
                            }}>
                                게시판 타입은 수정할 수 없습니다.
                            </p>
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

                        {/* 이미지 관리 */}
                        <div style={{ marginBottom: "32px" }}>
                            <label style={{
                                display: "block",
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#2d3748",
                                marginBottom: "8px"
                            }}>
                                이미지 관리
                            </label>
                            <p style={{
                                fontSize: "14px",
                                color: "#718096",
                                marginBottom: "12px"
                            }}>
                                최대 5개, 파일당 5MB 이하, JPG/PNG/GIF 형식만 가능
                            </p>

                            {/* 기존 이미지들 */}
                            {formData.remainImageUrls.length > 0 && (
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
                                </div>
                            )}

                            {/* 새 이미지 추가 */}
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
                                disabled={formData.remainImageUrls.length + selectedImages.length >= 5}
                                style={{
                                    padding: "12px 24px",
                                    backgroundColor: formData.remainImageUrls.length + selectedImages.length >= 5 ? "#f7fafc" : "#e6fffa",
                                    color: formData.remainImageUrls.length + selectedImages.length >= 5 ? "#a0aec0" : "#38d39f",
                                    border: `2px dashed ${formData.remainImageUrls.length + selectedImages.length >= 5 ? "#e2e8f0" : "#38d39f"}`,
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    cursor: formData.remainImageUrls.length + selectedImages.length >= 5 ? "not-allowed" : "pointer",
                                    marginBottom: "16px"
                                }}
                            >
                                📷 새 이미지 추가 ({formData.remainImageUrls.length + selectedImages.length}/5)
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
                                        수정 중...
                                    </div>
                                ) : (
                                    "게시글 수정"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
