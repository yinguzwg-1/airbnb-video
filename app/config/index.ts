// 更可靠的环境判断
const isProduction = () => {
  // 检查多个可能的环境变量
  return process.env.NODE_ENV === 'production' || 
         process.env.NEXT_PUBLIC_NODE_ENV === 'production' ||
         typeof window !== 'undefined' && window.location.hostname !== 'localhost';
};


export const config = {
  NEXT_PUBLIC_API_URL: isProduction() ? 'https://zwg.autos/api' : 'http://localhost:3000/api',
  NEXT_PUBLIC_APP_ID: '9527',
}