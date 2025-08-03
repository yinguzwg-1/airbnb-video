'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NotificationCard } from './NotificationCard';
import { websocketService } from '@/app/services/websocketService';

interface NotificationData {
  id: string;
  type: string;
  count: number;
  timestamp: string;
  processedCount?: number;
  requestCount?: number;
  errorCount?: number;
}

export const NotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const eventHandlersRef = useRef<{
    monitorUpdate: ((data: any) => void) | null;
    syncComplete: ((data: any) => void) | null;
  }>({
    monitorUpdate: null,
    syncComplete: null
  });

  // 防抖机制：记录最近的通知，避免重复
  const recentNotificationsRef = useRef<Set<string>>(new Set());
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addNotification = useCallback((notification: NotificationData) => {
    
    // 确保所有必需字段都有默认值
    const safeNotification: NotificationData = {
      id: notification.id || `notification-${Date.now()}-${Math.random()}`,
      type: notification.type || 'unknown',
      count: notification.count || 0,
      timestamp: notification.timestamp || new Date().toISOString(),
      processedCount: notification.processedCount || 0,
      requestCount: notification.requestCount || 0,
      errorCount: notification.errorCount || 0
    };


    // 检查是否需要显示通知 - 放宽条件
    const shouldShowNotification = () => {
      if (safeNotification.type === 'syncComplete') {
        // 同步完成通知：只有当处理了数据时才显示
        const shouldShow = (safeNotification.processedCount || 0) > 0;
        return shouldShow;
      } else if (safeNotification.type === 'monitorUpdate') {
        // 监控更新通知：只有当有记录时才显示
        const shouldShow = safeNotification.count > 0;
        return shouldShow;
      }
      // 其他类型的通知：只有当有记录时才显示
      const shouldShow = safeNotification.count > 0;
      return shouldShow;
    };

    if (!shouldShowNotification()) {
      return;
    }

    // 创建通知的唯一标识符
    const notificationKey = `${safeNotification.type}-${safeNotification.count}-${safeNotification.processedCount}-${safeNotification.requestCount}-${safeNotification.errorCount}`;
    
    // 检查是否是重复通知（1秒内的相同通知）
    if (recentNotificationsRef.current.has(notificationKey)) {
      return;
    }

    // 添加到最近通知集合
    recentNotificationsRef.current.add(notificationKey);
    
    // 1秒后从最近通知集合中移除
    setTimeout(() => {
      recentNotificationsRef.current.delete(notificationKey);
    }, 1000);

    setNotifications(prev => [...prev, safeNotification]);
    
    // 5秒后自动移除通知
    setTimeout(() => {
      removeNotification(safeNotification.id);
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    
    // 创建事件处理函数
    const handleMonitorUpdate = (data: any) => {
      // 清除之前的防抖定时器
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // 设置新的防抖定时器
      debounceTimeoutRef.current = setTimeout(() => {
        addNotification({
          ...data,
          id: `monitor-${Date.now()}-${Math.random()}`
        });
      }, 100); // 100ms防抖
    };

    const handleSyncComplete = (data: any) => {
      addNotification({
        ...data,
        id: `sync-${Date.now()}-${Math.random()}`
      });
    };

    // 保存引用以便清理
    eventHandlersRef.current.monitorUpdate = handleMonitorUpdate;
    eventHandlersRef.current.syncComplete = handleSyncComplete;

    // 添加事件监听器
    websocketService.on('monitorUpdate', handleMonitorUpdate);
    websocketService.on('syncComplete', handleSyncComplete);


    // 清理函数
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (eventHandlersRef.current.monitorUpdate) {
        websocketService.off('monitorUpdate', eventHandlersRef.current.monitorUpdate);
      }
      if (eventHandlersRef.current.syncComplete) {
        websocketService.off('syncComplete', eventHandlersRef.current.syncComplete);
      }
      // 清空引用
      eventHandlersRef.current.monitorUpdate = null;
      eventHandlersRef.current.syncComplete = null;
    };
  }, [addNotification]);
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            transform: `translateY(${index * 80}px)`,
            zIndex: 1000 - index
          }}
        >
          <NotificationCard
            data={notification}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
}; 