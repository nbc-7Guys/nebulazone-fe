import React from 'react';
import HeaderNav from './HeaderNav';

const PageContainer = ({
    children,
    title,
    description,
    maxWidth = '1200px',
    padding = '40px 20px',
    backgroundColor = '#f8fafc',
    showHeader = true,
    headerContent,
    className = '',
    style = {},
    ...props
}) => {
    const containerStyle = {
        background: backgroundColor,
        minHeight: '100vh',
        ...style
    };

    const contentStyle = {
        maxWidth,
        margin: '0 auto',
        padding
    };

    const headerStyle = {
        marginBottom: '40px'
    };

    const titleStyle = {
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#1a202c'
    };

    const descriptionStyle = {
        fontSize: '16px',
        color: '#718096'
    };

    return (
        <div className={className} style={containerStyle} {...props}>
            {showHeader && <HeaderNav />}
            
            <div style={contentStyle}>
                {(title || description || headerContent) && (
                    <div style={headerStyle}>
                        {headerContent ? (
                            headerContent
                        ) : (
                            <>
                                {title && <h1 style={titleStyle}>{title}</h1>}
                                {description && <p style={descriptionStyle}>{description}</p>}
                            </>
                        )}
                    </div>
                )}
                
                {children}
            </div>
        </div>
    );
};

export default PageContainer;