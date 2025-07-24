// components/EnhancedTrackerProvider.tsx
'use client';

import { useEffect } from 'react';
import AdvancedTracker, { type TrackerConfig } from './AdvancedTracker';
import { config as configApi } from '@/app/config';
import { initPerformanceMonitoring, checkPerformanceMonitoringStatus, forceCollectAllMetrics } from '@/app/utils/performanceUtils';

interface Props {
  children: React.ReactNode;
  userId?: string;
  initialEvents?: Array<{
    eventName: string;
    properties?: Record<string, any>;
  }>;
}

const config: TrackerConfig = {
  endpoint: `${configApi.NEXT_PUBLIC_API_URL}/events/batch`,
  appId: configApi.NEXT_PUBLIC_APP_ID! || '9527',
  batchSize: 5,
  flushInterval: 15000,
};

export default function TrackerInitializer({
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
      // 立即初始化性能监控，不等待useEffect
      checkPerformanceMonitoringStatus();
      initPerformanceMonitoring();
      
      // 初始化跟踪器
      const tracker = new AdvancedTracker(config);
      window.tracker = tracker;
      
      // 立即设置用户ID（如果提供）
      if (userId) {
        tracker.setUserId(userId);
      }
      
      // 触发一个自定义事件，通知其他组件 tracker 已经初始化
      window.dispatchEvent(new CustomEvent('trackerInitialized', { detail: tracker }));

      // 设置用户ID（如果提供）
      if (userId) {
        tracker.setUserId(userId);
      }
      // 发送初始事件
      initialEvents.forEach(({ eventName, properties }) => {
        tracker.track(eventName, properties);
      });

      // 通用的性能数据收集函数
      const collectPerformanceData = () => {
        // 延迟获取性能指标，确保页面加载完成
        setTimeout(() => {
          
          // 强制收集所有性能指标
          const performanceMetrics = forceCollectAllMetrics();
          
          // 根据URL识别页面信息
          const pathname = window.location.pathname;
          let pageName = '';
          let pageTitle = '';
          if (pathname.includes('/blog')) {
            pageName = 'blog';
            pageTitle = 'Blog';
          } else if (pathname.includes('/media')) {
            pageName = 'media';
            pageTitle = 'Media';
          } else if (pathname.includes('/monitoring')) {
            pageName = 'monitoring';
            pageTitle = 'Performance Monitoring';
          } else if (pathname.includes('/about')) {
            pageName = 'about';
            pageTitle = 'About Us';
          } else if (pathname.includes('/burrypoint')) {
            pageName = 'burrypoint';
            pageTitle = 'Data Analytics';
          } else {
            pageName = 'home';
            pageTitle = 'Home';
          }
          
      
          // 构建事件属性，确保所有性能指标都被包含
          const eventProperties = {
            url: window.location.href,
            referrer: document.referrer,
            page_name: pageName,
            page_title: pageTitle,
            language: pathname.split('/')[1] || 'en',
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            // 添加性能指标到properties
            lcp: performanceMetrics.lcp,
            fcp: performanceMetrics.fcp,
            ttfb: performanceMetrics.ttfb,
            cls: performanceMetrics.cls,
            fid: performanceMetrics.fid,
            performance_timestamp: performanceMetrics.timestamp,
          };
          
          tracker.track('page_view', eventProperties, pageName);
        }, 3000); // 延迟3秒获取性能指标，给FCP和FID更多时间
      };

      // 自动跟踪路由变化
      const handleRouteChange = collectPerformanceData;

      // 页面加载时也触发性能数据收集
      const handlePageLoad = collectPerformanceData;

      // 监听路由变化和页面加载
      window.addEventListener('popstate', handleRouteChange);
      window.addEventListener('load', handlePageLoad);
      
      // 如果页面已经加载完成，立即触发一次
      if (document.readyState === 'complete') {
        handlePageLoad();
      }

      return () => {
        window.removeEventListener('popstate', handleRouteChange);
        window.removeEventListener('load', handlePageLoad);
        tracker.flush();
      };
    } catch (error) {
      console.error('Failed to initialize tracker:', error);
    }
  }, [userId, initialEvents]);

  return children;
}
