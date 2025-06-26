import React from 'react';

const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'medium', 
    disabled = false, 
    loading = false,
    onClick,
    type = 'button',
    className = '',
    style = {},
    ...props 
}) => {
    const baseStyles = {
        border: 'none',
        borderRadius: '8px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        outline: 'none',
        ...style
    };

    const variants = {
        primary: {
            backgroundColor: '#38d39f',
            color: '#fff',
            '&:hover': {
                backgroundColor: '#2eb888'
            }
        },
        secondary: {
            backgroundColor: '#f7fafc',
            color: '#4a5568',
            border: '1px solid #e2e8f0',
            '&:hover': {
                backgroundColor: '#edf2f7'
            }
        },
        danger: {
            backgroundColor: '#e53e3e',
            color: '#fff',
            '&:hover': {
                backgroundColor: '#c53030'
            }
        },
        outline: {
            backgroundColor: 'transparent',
            color: '#38d39f',
            border: '1px solid #38d39f',
            '&:hover': {
                backgroundColor: '#e6fffa'
            }
        },
        ghost: {
            backgroundColor: 'transparent',
            color: '#4a5568',
            '&:hover': {
                backgroundColor: '#f7fafc'
            }
        }
    };

    const sizes = {
        small: {
            padding: '6px 12px',
            fontSize: '12px'
        },
        medium: {
            padding: '12px 24px',
            fontSize: '14px'
        },
        large: {
            padding: '16px 32px',
            fontSize: '16px'
        }
    };

    const buttonStyles = {
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
        opacity: disabled || loading ? 0.7 : 1
    };

    const handleMouseEnter = (e) => {
        if (disabled || loading) return;
        
        if (variant === 'primary') {
            e.target.style.backgroundColor = '#2eb888';
        } else if (variant === 'secondary') {
            e.target.style.backgroundColor = '#edf2f7';
        } else if (variant === 'danger') {
            e.target.style.backgroundColor = '#c53030';
        } else if (variant === 'outline') {
            e.target.style.backgroundColor = '#e6fffa';
        } else if (variant === 'ghost') {
            e.target.style.backgroundColor = '#f7fafc';
        }
    };

    const handleMouseLeave = (e) => {
        if (disabled || loading) return;
        
        if (variant === 'primary') {
            e.target.style.backgroundColor = '#38d39f';
        } else if (variant === 'secondary') {
            e.target.style.backgroundColor = '#f7fafc';
        } else if (variant === 'danger') {
            e.target.style.backgroundColor = '#e53e3e';
        } else if (variant === 'outline') {
            e.target.style.backgroundColor = 'transparent';
        } else if (variant === 'ghost') {
            e.target.style.backgroundColor = 'transparent';
        }
    };

    return (
        <button
            type={type}
            style={buttonStyles}
            className={className}
            disabled={disabled || loading}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {loading && (
                <span style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid currentColor',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}>
                </span>
            )}
            {children}
        </button>
    );
};

export default Button;