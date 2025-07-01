// 환경변수 관리 유틸리티

export const ENV = {
    // API 관련
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 
                  (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:8080'),
    
    // 환경 정보
    NODE_ENV: import.meta.env.MODE,
    IS_DEVELOPMENT: import.meta.env.MODE === 'development',
    IS_PRODUCTION: import.meta.env.MODE === 'production',
    
    // 기타 설정
    APP_ENV: import.meta.env.VITE_ENV || 'development',
};

// 환경변수 유효성 검사
export const validateEnv = () => {
    const requiredEnvs = ['VITE_API_BASE_URL'];
    
    const missingEnvs = requiredEnvs.filter(env => !import.meta.env[env]);
    
    if (missingEnvs.length > 0) {
        console.warn('Missing environment variables:', missingEnvs);
        console.warn('Please check your .env file');
    }
    
    return missingEnvs.length === 0;
};

// 개발환경에서 환경변수 정보 출력
if (ENV.IS_DEVELOPMENT) {
    console.log('🌍 Environment Config:', {
        NODE_ENV: ENV.NODE_ENV,
        API_BASE_URL: ENV.API_BASE_URL,
        APP_ENV: ENV.APP_ENV
    });
    
    validateEnv();
}

export default ENV;
