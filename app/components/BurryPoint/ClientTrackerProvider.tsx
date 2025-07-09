// components/EnhancedTrackerProvider.tsx
'use client';

import { useEffect } from 'react';
import AdvancedTracker, { type TrackerConfig } from './AdvancedTracker';
import { SafeClientWrapper } from '@/app/components';
import { config as configApi } from '@/app/config';

interface Props {
  children: React.ReactNode;
  userId?: string;
  initialEvents?: Array<{
    eventName: string;
    properties?: Record<string, any>;
  }>;
}

const config: TrackerConfig = {
  endpoint: `${configApi.NEXT_PUBLIC_LOCAL_HOST}/events`,
  appId: configApi.NEXT_PUBLIC_APP_ID! || '9527',
  batchSize: 5,
  flushInterval: 15000,
};

function TrackerInitializerContent({
  children,
  userId,
  initialEvents = []
}: Props) {
  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window === 'undefined') {
      return;
    }


    try {
      // 初始化跟踪器
      const tracker = new AdvancedTracker(config);
      window.tracker = tracker;

      // 设置用户ID（如果提供）
      if (userId) {
        tracker.setUserId(userId);
      }
      console.log('initialEvents', initialEvents);
      // 发送初始事件
      initialEvents.forEach(({ eventName, properties }) => {
        tracker.track(eventName, properties);
      });

      // 自动跟踪路由变化
      const handleRouteChange = () => {
        tracker.track('page_view', {
          url: window.location.href,
          referrer: document.referrer,
        });
      };

      window.addEventListener('popstate', handleRouteChange);

      return () => {
        window.removeEventListener('popstate', handleRouteChange);
        tracker.flush();
      };
    } catch (error) {
      console.error('Failed to initialize tracker:', error);
    }
  }, [userId, initialEvents]);

  return children;
}

export function TrackerInitializer(props: Props) {
  return (
    <SafeClientWrapper>
      <TrackerInitializerContent {...props} />
    </SafeClientWrapper>
  );
}