import React from "react";
import { POST_TYPE_OPTIONS } from "../../types/PostType";

export default function PostTypeSelector({
    selectedType,
    onTypeChange,
    disabled = false,
    size = 'medium', // 'small', 'medium', 'large'
    variant = 'default' // 'default', 'tabs', 'buttons'
}) {

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    padding: "6px 12px",
                    fontSize: "12px"
                };
            case 'large':
                return {
                    padding: "12px 24px",
                    fontSize: "16px"
                };
            default: // medium
                return {
                    padding: "10px 20px",
                    fontSize: "14px"
                };
        }
    };

    const sizeStyles = getSizeStyles();

    if (variant === 'tabs') {
        return (
            <div style={{
                display: "flex",
                backgroundColor: "#f7fafc",
                borderRadius: "8px",
                padding: "4px",
                gap: "2px"
            }}>
                {POST_TYPE_OPTIONS.map(option => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => !disabled && onTypeChange(option.value)}
                        disabled={disabled}
                        style={{
                            flex: 1,
                            ...sizeStyles,
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: selectedType === option.value ? '#38d39f' : 'transparent',
                            color: selectedType === option.value ? '#fff' : '#4a5568',
                            cursor: disabled ? "not-allowed" : "pointer",
                            fontWeight: selectedType === option.value ? "600" : "500",
                            transition: "all 0.2s ease",
                            opacity: disabled ? 0.6 : 1
                        }}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        );
    }

    if (variant === 'buttons') {
        return (
            <div style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap"
            }}>
                {POST_TYPE_OPTIONS.map(option => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => !disabled && onTypeChange(option.value)}
                        disabled={disabled}
                        style={{
                            ...sizeStyles,
                            borderRadius: "20px",
                            border: `2px solid ${selectedType === option.value ? '#38d39f' : '#e2e8f0'}`,
                            backgroundColor: selectedType === option.value ? '#e6fffa' : '#fff',
                            color: selectedType === option.value ? '#38d39f' : '#4a5568',
                            cursor: disabled ? "not-allowed" : "pointer",
                            fontWeight: "500",
                            transition: "all 0.2s ease",
                            opacity: disabled ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!disabled && selectedType !== option.value) {
                                e.target.style.backgroundColor = '#f7fafc';
                                e.target.style.borderColor = '#cbd5e0';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!disabled && selectedType !== option.value) {
                                e.target.style.backgroundColor = '#fff';
                                e.target.style.borderColor = '#e2e8f0';
                            }
                        }}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        );
    }

    // default variant
    return (
        <div style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap"
        }}>
            {POST_TYPE_OPTIONS.map(option => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => !disabled && onTypeChange(option.value)}
                    disabled={disabled}
                    style={{
                        ...sizeStyles,
                        borderRadius: "8px",
                        border: `2px solid ${selectedType === option.value ? '#38d39f' : '#e2e8f0'}`,
                        backgroundColor: selectedType === option.value ? '#e6fffa' : disabled ? '#f7fafc' : '#fff',
                        color: selectedType === option.value ? '#38d39f' : disabled ? '#a0aec0' : '#4a5568',
                        cursor: disabled ? "not-allowed" : "pointer",
                        fontWeight: "500",
                        transition: "all 0.2s ease",
                        opacity: disabled ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                        if (!disabled && selectedType !== option.value) {
                            e.target.style.borderColor = '#38d39f';
                            e.target.style.backgroundColor = '#f0fff4';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!disabled && selectedType !== option.value) {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.backgroundColor = '#fff';
                        }
                    }}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
