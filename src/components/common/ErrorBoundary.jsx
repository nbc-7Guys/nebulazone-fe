import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        
        // 에러 로깅 (개발 환경에서만)
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    padding: '40px 20px',
                    textAlign: 'center',
                    backgroundColor: '#f8fafc'
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        padding: '40px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        maxWidth: '500px',
                        width: '100%'
                    }}>
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '16px'
                        }}>
                            😵
                        </div>
                        
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#1a202c',
                            marginBottom: '12px'
                        }}>
                            문제가 발생했습니다
                        </h2>
                        
                        <p style={{
                            fontSize: '16px',
                            color: '#4a5568',
                            marginBottom: '24px',
                            lineHeight: '1.5'
                        }}>
                            페이지를 불러오는 중 오류가 발생했습니다. 
                            잠시 후 다시 시도해주세요.
                        </p>

                        {/* 개발 환경에서만 에러 상세 정보 표시 */}
                        {import.meta.env.DEV && this.state.error && (
                            <details style={{
                                marginBottom: '24px',
                                textAlign: 'left',
                                backgroundColor: '#f7fafc',
                                padding: '16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: '#4a5568'
                            }}>
                                <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                                    에러 상세 정보 (개발용)
                                </summary>
                                <pre style={{
                                    marginTop: '12px',
                                    whiteSpace: 'pre-wrap',
                                    fontSize: '12px'
                                }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                        
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={this.handleRetry}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#38d39f',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#2eb888';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#38d39f';
                                }}
                            >
                                다시 시도
                            </button>
                            
                            <button
                                onClick={() => window.location.href = '/'}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#f7fafc',
                                    color: '#4a5568',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#edf2f7';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#f7fafc';
                                }}
                            >
                                홈으로 이동
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
