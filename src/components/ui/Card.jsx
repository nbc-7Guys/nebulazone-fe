import React from 'react';

const Card = ({
    children,
    padding = 'medium',
    shadow = 'small',
    borderRadius = 'medium',
    backgroundColor = '#fff',
    className = '',
    style = {},
    onClick,
    hover = false,
    ...props
}) => {
    const paddingMap = {
        small: '16px',
        medium: '24px',
        large: '32px',
        none: '0'
    };

    const shadowMap = {
        none: 'none',
        small: '0 1px 3px rgba(0,0,0,0.1)',
        medium: '0 4px 6px rgba(0,0,0,0.1)',
        large: '0 10px 15px rgba(0,0,0,0.1)'
    };

    const borderRadiusMap = {
        none: '0',
        small: '4px',
        medium: '8px',
        large: '12px',
        xl: '16px'
    };

    const baseStyles = {
        backgroundColor,
        padding: paddingMap[padding],
        boxShadow: shadowMap[shadow],
        borderRadius: borderRadiusMap[borderRadius],
        transition: hover ? 'all 0.2s ease' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style
    };

    const handleMouseEnter = (e) => {
        if (hover && !onClick) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = shadowMap['medium'];
        } else if (onClick) {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = shadowMap['medium'];
        }
    };

    const handleMouseLeave = (e) => {
        if (hover || onClick) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = shadowMap[shadow];
        }
    };

    return (
        <div
            className={className}
            style={baseStyles}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;