// hooks/useTracker.ts
'use client';

import { useEffect, useState } from 'react';
import AdvancedTracker from '../components/BurryPoint/AdvancedTracker';

declare global {
  interface Window {
    tracker?: AdvancedTracker;
  }
}

// 创建一个默认的 tracker 实例，用于在 tracker 未初始化时提供基本功能
const createDefaultTracker = (): AdvancedTracker => {
  return {
    track: (eventName: string, properties?: Record<string, any>) => {
      // 在开发环境中记录事件，但不发送到服务器
      if (process.env.NODE_ENV === 'development') {
        console.log('Tracker not initialized, event logged locally:', { eventName, properties });
      }
    },
    setUserId: (userId: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Tracker not initialized, userId set locally:', userId);
      }
    },
    flush: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Tracker not initialized, flush called locally');
      }
    }
  } as AdvancedTracker;
};

export function useTracker() {
  const [tracker, setTracker] = useState<AdvancedTracker | null>(null);

  useEffect(() => {
    // 检查 tracker 是否已经初始化
    const checkTracker = () => {
      if (window.tracker) {
        setTracker(window.tracker);
        return true;
      }
      return false;
    };

    // 监听 tracker 初始化事件
    const handleTrackerInitialized = (event: CustomEvent) => {
      setTracker(event.detail);
    };

    // 立即检查一次
    if (!checkTracker()) {
      // 监听 tracker 初始化事件
      window.addEventListener('trackerInitialized', handleTrackerInitialized as EventListener);
      
      // 如果还没有初始化，等待一段时间后再次检查
      const interval = setInterval(() => {
        if (checkTracker()) {
          clearInterval(interval);
        }
      }, 100);

      // 设置超时，避免无限等待
      const timeout = setTimeout(() => {
        clearInterval(interval);
        console.warn('Tracker initialization timeout. Using default tracker.');
        setTracker(createDefaultTracker());
      }, 3000); // 减少超时时间到3秒

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
        window.removeEventListener('trackerInitialized', handleTrackerInitialized as EventListener);
      };
    }
  }, []);

  // 返回 tracker 或默认 tracker
  return tracker || createDefaultTracker();
}