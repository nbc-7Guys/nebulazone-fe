import React, { useState, useRef } from "react";

export default function ChatInput({ onSend, onSendImage, disabled = false }) {
    const [message, setMessage] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (disabled) return;

        try {
            // 이미지가 선택된 경우 이미지 먼저 전송
            if (selectedImage && onSendImage) {
                await onSendImage(selectedImage);
                setSelectedImage(null);
                setImagePreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
            
            // 메시지가 있으면 메시지 전송
            if (message.trim() && onSend) {
                onSend(message.trim());
                setMessage("");
            }
        } catch (error) {
            console.error('전송 실패:', error);
            alert('전송에 실패했습니다.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('이미지 크기는 10MB를 초과할 수 없습니다.');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }
            
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };


    const handleCancelImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {imagePreview && (
                <div style={{
                    padding: "12px",
                    backgroundColor: "#f7fafc",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                }}>
                    <img 
                        src={imagePreview} 
                        alt="미리보기" 
                        style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0"
                        }}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "14px", color: "#4a5568", marginBottom: "4px" }}>
                            {selectedImage?.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#718096" }}>
                            {(selectedImage?.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                    </div>
                </div>
            )}
            
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: "none" }}
                />
                
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    style={{
                        padding: "12px",
                        backgroundColor: disabled ? "#e2e8f0" : "#f7fafc",
                        color: disabled ? "#a0aec0" : "#4a5568",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "18px",
                        cursor: disabled ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        height: "44px",
                        minWidth: "44px",
                    }}
                    onMouseEnter={(e) => {
                        if (!disabled) {
                            e.target.style.backgroundColor = "#edf2f7";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!disabled) {
                            e.target.style.backgroundColor = "#f7fafc";
                        }
                    }}
                >
                    📷
                </button>
                
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={disabled ? "연결 중..." : "메시지를 입력하세요..."}
                    disabled={disabled}
                    style={{
                        flex: 1,
                        minHeight: "44px",
                        maxHeight: "120px",
                        padding: "12px 16px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        resize: "none",
                        fontSize: "15px",
                        fontFamily: "inherit",
                        outline: "none",
                        backgroundColor: disabled ? "#f7fafc" : "#fff",
                        color: disabled ? "#a0aec0" : "#2d3748",
                        transition: "all 0.2s ease",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                    }}
                    onFocus={(e) => {
                        if (!disabled) {
                            e.target.style.borderColor = "#38d39f";
                            e.target.style.boxShadow = "0 0 0 3px rgba(56, 211, 159, 0.1)";
                        }
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow = "none";
                    }}
                />
                <button
                    type="submit"
                    disabled={(!message.trim() && !selectedImage) || disabled}
                    style={{
                        padding: "12px 20px",
                        backgroundColor: ((!message.trim() && !selectedImage) || disabled) ? "#e2e8f0" : "#38d39f",
                        color: ((!message.trim() && !selectedImage) || disabled) ? "#a0aec0" : "#fff",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "15px",
                        fontWeight: "600",
                        cursor: ((!message.trim() && !selectedImage) || disabled) ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        minWidth: "80px",
                        height: "44px",
                    }}
                    onMouseEnter={(e) => {
                        if (!disabled && (message.trim() || selectedImage)) {
                            e.target.style.backgroundColor = "#2eb888";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!disabled && (message.trim() || selectedImage)) {
                            e.target.style.backgroundColor = "#38d39f";
                        }
                    }}
                >
                    전송
                </button>
                {selectedImage && (
                    <button
                        type="button"
                        onClick={handleCancelImage}
                        style={{
                            padding: "12px 16px",
                            backgroundColor: "#e2e8f0",
                            color: "#718096",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "15px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            height: "44px",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#cbd5e0";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#e2e8f0";
                        }}
                    >
                        취소
                    </button>
                )}
            </form>
        </div>
    );
}
