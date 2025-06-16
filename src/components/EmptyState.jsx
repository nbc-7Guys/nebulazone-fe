import React from 'react';

export default function EmptyState({ 
    icon = '📭', 
    title = '데이터가 없습니다', 
    description,
    actionButton 
}) {
    return (
        <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            margin: '20px 0'
        }}>
            <div style={{
                fontSize: '48px',
                marginBottom: '16px'
            }}>
                {icon}
            </div>
            
            <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '8px',
                margin: '0 0 8px 0'
            }}>
                {title}
            </h3>
            
            {description && (
                <p style={{
                    fontSize: '14px',
                    color: '#718096',
                    marginBottom: actionButton ? '20px' : '0',
                    margin: actionButton ? '0 0 20px 0' : '0'
                }}>
                    {description}
                </p>
            )}
            
            {actionButton && actionButton}
        </div>
    );
}
