export const APP_VERSION = {
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
  commitHash: process.env.NEXT_PUBLIC_COMMIT_HASH || 'unknown',
  environment: process.env.NODE_ENV || 'development'
};

export const getVersionInfo = () => {
  return {
    ...APP_VERSION,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    timestamp: new Date().toISOString()
  };
};