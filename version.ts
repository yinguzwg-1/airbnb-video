export const APP_VERSION = {
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  // 直接设置为 UTC+8 时间
  buildTime: process.env.NEXT_PUBLIC_BUILD_TIME ||
    new Date(Date.now() + (8 * 60 * 60 * 1000)).toISOString(),
  commitHash: process.env.NEXT_PUBLIC_COMMIT_HASH || 'unknown',
  environment: process.env.NODE_ENV || 'development'
};

export const getVersionInfo = () => {
  return {
    ...APP_VERSION,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    timestamp: new Date().toISOString(),
    // 提供本地时间格式化方法
    getLocalBuildTime: () => {
      try {
        const date = new Date(APP_VERSION.buildTime);
        return date.toLocaleString('zh-CN', {
          timeZone: 'Asia/Shanghai',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      } catch (error) {
        return APP_VERSION.buildTime;
      }
    }
  };
};