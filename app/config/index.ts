// 更可靠的环境判断
const isProduction = () => {
  // 检查多个可能的环境变量
  return process.env.NODE_ENV === 'production' || 
         process.env.NEXT_PUBLIC_NODE_ENV === 'production' ||
         typeof window !== 'undefined' && window.location.hostname !== 'localhost';
};

// 调试环境变量
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  isProduction: isProduction(),
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
});

export const config = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (isProduction() ? 'https://223.4.248.176:3001' : 'http://localhost:3001'),
  NEXT_PUBLIC_APP_ID: '9527',
}