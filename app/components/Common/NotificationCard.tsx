'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useServerTranslation } from '@/app/hooks/useServerTranslation';

interface NotificationData {
  type: string;
  count: number;
  timestamp: string;
  processedCount?: number;
  requestCount?: number;
  errorCount?: number;
}

interface NotificationCardProps {
  data: NotificationData;
  onClose: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ data, onClose }) => {
  const { t } = useServerTranslation();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 延迟显示，实现滑入动画
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    // 跳转到监控页面
    router.push('/monitoring');
    onClose();
  };

  const getNotificationContent = () => {
    // 确保所有数值都有默认值
    const safeData = {
      count: data.count || 0,
      processedCount: data.processedCount || 0,
      requestCount: data.requestCount || 0,
      errorCount: data.errorCount || 0
    };

    if (data.type === 'syncComplete') {
      return {
        title: t('monitoring.syncComplete'),
        message: `${t('monitoring.syncCompleteMessage')} ${safeData.processedCount} ${t('monitoring.jobs')}, ${safeData.requestCount} ${t('monitoring.requests')}, ${safeData.errorCount} ${t('monitoring.errors')}`,
        icon: '🔄',
        color: 'bg-blue-500'
      };
    } else if (data.type === 'monitorUpdate') {
      return {
        title: t('monitoring.dataUpdate'),
        message: `${t('monitoring.dataUpdateMessage')} ${safeData.count} ${t('monitoring.records')}`,
        icon: '📊',
        color: 'bg-green-500'
      };
    } else {
      return {
        title: t('monitoring.update'),
        message: `${t('monitoring.updateMessage')} ${safeData.count} ${t('monitoring.records')}`,
        icon: '📈',
        color: 'bg-purple-500'
      };
    }
  };

  const content = getNotificationContent();

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`${content.color} text-white rounded-lg shadow-lg p-4 min-w-80 max-w-96 cursor-pointer hover:shadow-xl transition-shadow duration-200`}
        onClick={handleClick}
      >
        <div className="flex items-start space-x-3">
          <div className="text-2xl">{content.icon}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{content.title}</h3>
            <p className="text-xs opacity-90">{content.message}</p>
            <p className="text-xs opacity-70 mt-1">
              {new Date(data.timestamp || new Date()).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-white opacity-70 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}; 