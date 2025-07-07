import React, { useRef, useState, useEffect } from "react";

export default function ImageUploader({
    onImagesChange,
    maxImages = 5,
    maxFileSize = 2 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    existingImages = [],
    onExistingImageRemove,
    disabled = false,
    showPreview = true,
    compact = false
}) {
    const fileInputRef = useRef(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
    const [dragOver, setDragOver] = useState(false);

    // 이미지 선택 핸들러
    const handleImageSelect = (files) => {
        const fileArray = Array.from(files);
        
        if (fileArray.length === 0) return;

        const totalImages = existingImages.length + selectedImages.length + fileArray.length;
        if (totalImages > maxImages) {
            alert(`이미지는 최대 ${maxImages}개까지 업로드할 수 있습니다.`);
            return;
        }

        // 파일 검증
        for (const file of fileArray) {
            if (file.size > maxFileSize) {
                const sizeMB = Math.round(maxFileSize / (1024 * 1024));
                alert(`이미지 파일은 ${sizeMB}MB 이하만 업로드할 수 있습니다.`);
                return;
            }
            if (!allowedTypes.includes(file.type)) {
                const typeStr = allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ');
                alert(`${typeStr} 파일만 업로드할 수 있습니다.`);
                return;
            }
        }

        const newImages = [...selectedImages, ...fileArray];
        const newPreviewUrls = [...imagePreviewUrls];

        fileArray.forEach(file => {
            const previewUrl = URL.createObjectURL(file);
            newPreviewUrls.push(previewUrl);
        });

        setSelectedImages(newImages);
        setImagePreviewUrls(newPreviewUrls);

        if (onImagesChange) {
            onImagesChange(newImages);
        }
    };

    // 파일 입력 변경
    const handleFileInputChange = (e) => {
        handleImageSelect(e.target.files);
    };

    // 드래그 앤 드롭
    const handleDragOver = (e) => {
        e.preventDefault();
        if (!disabled) {
            setDragOver(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        
        if (!disabled) {
            const files = e.dataTransfer.files;
            handleImageSelect(files);
        }
    };

    // 이미지 제거
    const handleImageRemove = (index) => {
        URL.revokeObjectURL(imagePreviewUrls[index]);
        
        const newImages = selectedImages.filter((_, i) => i !== index);
        const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
        
        setSelectedImages(newImages);
        setImagePreviewUrls(newPreviewUrls);

        if (onImagesChange) {
            onImagesChange(newImages);
        }
    };

    // 컴포넌트 언마운트 시 URL 정리
    useEffect(() => {
        return () => {
            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviewUrls]);

    const currentImageCount = existingImages.length + selectedImages.length;
    const canAddMore = currentImageCount < maxImages && !disabled;

    return (
        <div style={{ width: "100%" }}>
            {/* 업로드 영역 */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => canAddMore && fileInputRef.current?.click()}
                style={{
                    border: `2px dashed ${dragOver ? '#38d39f' : canAddMore ? '#cbd5e0' : '#e2e8f0'}`,
                    borderRadius: "8px",
                    padding: compact ? "16px" : "24px",
                    textAlign: "center",
                    backgroundColor: dragOver ? '#f0fff4' : canAddMore ? '#fafafa' : '#f7fafc',
                    cursor: canAddMore ? "pointer" : "not-allowed",
                    transition: "all 0.2s ease",
                    marginBottom: showPreview && (existingImages.length > 0 || selectedImages.length > 0) ? "16px" : "0"
                }}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept={allowedTypes.join(',')}
                    onChange={handleFileInputChange}
                    disabled={disabled}
                    style={{ display: "none" }}
                />

                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px"
                }}>
                    <div style={{
                        fontSize: compact ? "24px" : "32px",
                        color: canAddMore ? "#38d39f" : "#a0aec0"
                    }}>
                        📷
                    </div>
                    
                    <div>
                        <p style={{
                            fontSize: compact ? "14px" : "16px",
                            fontWeight: "500",
                            color: canAddMore ? "#2d3748" : "#a0aec0",
                            margin: "0 0 4px 0"
                        }}>
                            {canAddMore ? "이미지를 클릭하거나 드래그해서 업로드" : "이미지 업로드 불가"}
                        </p>
                        
                        <p style={{
                            fontSize: compact ? "12px" : "14px",
                            color: "#718096",
                            margin: 0
                        }}>
                            {currentImageCount}/{maxImages} • 최대 {Math.round(maxFileSize / (1024 * 1024))}MB • {allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
                        </p>
                    </div>
                </div>
            </div>

            {/* 이미지 미리보기 */}
            {showPreview && (
                <>
                    {/* 기존 이미지들 */}
                    {existingImages.length > 0 && (
                        <div style={{ marginBottom: selectedImages.length > 0 ? "16px" : "0" }}>
                            <h4 style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#4a5568",
                                marginBottom: "8px"
                            }}>
                                기존 이미지 ({existingImages.length}개)
                            </h4>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                                gap: "12px"
                            }}>
                                {existingImages.map((imageUrl, index) => (
                                    <div
                                        key={`existing-${index}`}
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
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            display: "none",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "#f0f0f0",
                                            color: "#999",
                                            fontSize: "24px"
                                        }}>
                                            ❌
                                        </div>
                                        {onExistingImageRemove && (
                                            <button
                                                type="button"
                                                onClick={() => onExistingImageRemove(imageUrl, index)}
                                                disabled={disabled}
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
                                                    cursor: disabled ? "not-allowed" : "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    opacity: disabled ? 0.5 : 1
                                                }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 새로 선택한 이미지들 */}
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
                                        key={`new-${index}`}
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
                                            onClick={() => handleImageRemove(index)}
                                            disabled={disabled}
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
                                                cursor: disabled ? "not-allowed" : "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                opacity: disabled ? 0.5 : 1
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
