import React from 'react';

const FormInput = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    disabled = false,
    required = false,
    name,
    id,
    autoComplete,
    onKeyPress,
    className = '',
    style = {},
    ...props
}) => {
    const containerStyle = {
        marginBottom: '16px',
        ...style
    };

    const labelStyle = {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '8px',
        color: '#374151'
    };

    const inputStyle = {
        width: '100%',
        fontSize: '16px',
        padding: '12px 16px',
        border: `1px solid ${error ? '#e53e3e' : '#e2e8f0'}`,
        borderRadius: '8px',
        outline: 'none',
        backgroundColor: disabled ? '#f7fafc' : '#fff',
        color: disabled ? '#a0aec0' : '#1a202c',
        transition: 'border-color 0.2s ease',
        boxSizing: 'border-box'
    };

    const errorStyle = {
        color: '#e53e3e',
        fontSize: '12px',
        marginTop: '4px'
    };

    const handleFocus = (e) => {
        if (!disabled && !error) {
            e.target.style.borderColor = '#38d39f';
        }
    };

    const handleBlur = (e) => {
        if (!disabled && !error) {
            e.target.style.borderColor = '#e2e8f0';
        }
    };

    return (
        <div style={containerStyle} className={className}>
            {label && (
                <label htmlFor={id || name} style={labelStyle}>
                    {label}
                    {required && <span style={{ color: '#e53e3e', marginLeft: '4px' }}>*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                name={name}
                id={id || name}
                autoComplete={autoComplete}
                onKeyPress={onKeyPress}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={inputStyle}
                {...props}
            />
            {error && (
                <div style={errorStyle}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default FormInput;