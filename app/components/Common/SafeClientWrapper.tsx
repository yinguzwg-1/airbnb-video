'use client';

import { useEffect, useState } from 'react';

interface SafeClientWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SafeClientWrapper({ children, fallback }: SafeClientWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // 设置全局错误处理器
    const handleError = (event: ErrorEvent) => {
      // 忽略来自外部脚本的错误
      if (event.filename && event.filename.includes('content_scripts')) {
        event.preventDefault();
        return false;
      }
      
      if (event.message && (
        event.message.includes('shadowRoot') ||
        event.message.includes('getShadowDomById')
      )) {
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.message && (
        event.reason.message.includes('shadowRoot') ||
        event.reason.message.includes('getShadowDomById')
      )) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // 如果还在服务器端渲染，显示fallback
  if (!isClient) {
    return fallback || <div>Loading...</div>;
  }

  // 如果有错误，显示fallback
  if (hasError) {
    return fallback || <div>Something went wrong</div>;
  }

  return <>{children}</>;
} 