// 环境配置
const getEnvironmentConfig = () => {
  const nodeEnv = process.env.NODE_ENV;
  console.log('nodeEnv-------', nodeEnv);
  switch (nodeEnv) {
    case 'production':
      return {
        NEXT_PUBLIC_LOCAL_HOST: process.env.NEXT_PUBLIC_LOCAL_HOST || 'http://localhost:3000',
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://223.4.248.176:3001',
        NEXT_PUBLIC_APP_ID: process.env.NEXT_PUBLIC_APP_ID || '9527',
      };
    case 'development':
    default:
      return {
        NEXT_PUBLIC_LOCAL_HOST: process.env.NEXT_PUBLIC_LOCAL_HOST || 'http://localhost:3000',
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://223.4.248.176:3001',
        NEXT_PUBLIC_APP_ID: process.env.NEXT_PUBLIC_APP_ID || '9527',
      };
  }
};

export const config = getEnvironmentConfig();

// 导出环境信息，方便调试
export const envInfo = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_URL: config.NEXT_PUBLIC_API_URL,
  LOCAL_HOST: config.NEXT_PUBLIC_LOCAL_HOST,
};