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
            padding: '3rem 2rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            margin: '1.5rem 0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
            <div style={{
                fontSize: '3rem',
                marginBottom: '1.5rem',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
            }}>
                {icon}
            </div>
            
            <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '0.75rem',
                margin: '0 0 0.75rem 0'
            }}>
                {title}
            </h3>
            
            {description && (
                <p style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    marginBottom: actionButton ? '2rem' : '0',
                    margin: actionButton ? '0 0 2rem 0' : '0',
                    fontWeight: '500',
                    maxWidth: '400px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    lineHeight: '1.6'
                }}>
                    {description}
                </p>
            )}
            
            {actionButton && actionButton}
        </div>
    );
}
