export interface TrackerConfig {
  endpoint: string;
  appId: string;
  batchSize?: number;
  flushInterval?: number;
  maxRetry?: number;
  enableCache?: boolean;
}

interface EventData {
  event_id: string;
  event_time: string;
  user_id: string;
  session_id: string;
  device_fingerprint: string;
  properties: Record<string, any>;
  sdk_version: string;
  app_id: string;
}

interface CommonProperties {
  url: string;
  referrer: string;
  screen_width: number;
  screen_height: number;
  viewport_width: number;
  viewport_height: number;
  language: string;
  user_agent: string;
  [key: string]: any;
}

class AdvancedTracker {
  private config: Required<TrackerConfig>;
  private queue: EventData[];
  private retryCount: number;
  private sessionId: string;
  private userId: string;
  private deviceFingerprint: string;
  private autoFlushTimer: number | null = null;

  constructor(config: TrackerConfig) {
    // 必需配置校验
    if (!config.endpoint) throw new Error('Endpoint is required');
    if (!config.appId) throw new Error('AppId is required');

    // 合并默认配置
    this.config = {
      batchSize: 20,
      flushInterval: 10000,
      maxRetry: 3,
      enableCache: true,
      ...config,
    };

    // 初始化状态
    this.queue = [];
    this.retryCount = 0;
    this.sessionId = this.generateSessionId();
    this.userId = this.getOrCreateUserId();
    this.deviceFingerprint = this.generateDeviceFingerprint();

    // 初始化自动刷新定时器
    this.initAutoFlush();
    // 恢复未发送的缓存事件
    if (this.config.enableCache) this.restoreFromCache();
    
    // 页面卸载时处理
    this.initBeforeUnloadHandler();
  }

  /**
   * 追踪事件
   * @param eventName 事件名称
   * @param properties 事件属性
   */
  public track(eventName: string, properties: Record<string, any> = {}): void {
    const event: EventData = {
      event_id: eventName,
      event_time: new Date().toISOString(),
      user_id: this.userId,
      session_id: this.sessionId,
      device_fingerprint: this.deviceFingerprint,
      properties: this.enrichProperties(properties),
      sdk_version: '1.0.0',
      app_id: this.config.appId,
    };
    console.log('event', event);
    this.queue.push(event);
    
    // 达到批量大小立即发送
    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }
    
    // 本地缓存
    if (this.config.enableCache) {
      this.saveToCache();
    }
  }

  /**
   * 立即上报队列中的所有事件
   */
  public flush(): void {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];
    console.log('eventsToSend', eventsToSend);
    this.sendData(eventsToSend)
      .then(() => {
        this.retryCount = 0; // 重置重试计数器
        if (this.config.enableCache) {
          this.clearCache();
        }
      })
      .catch((error) => {
        console.error('上报失败:', error);
        // 放回队列准备重试
        this.queue.unshift(...eventsToSend);
        
        // 指数退避重试
        this.retryCount++;
        if (this.retryCount <= this.config.maxRetry) {
          const delay = Math.min(1000 * 2 ** this.retryCount, 30000);
          setTimeout(() => this.flush(), delay);
        }
      });
  }

  /**
   * 获取当前用户ID
   */
  public getUserId(): string {
    return this.userId;
  }

  /**
   * 设置自定义用户ID
   * @param userId 用户ID
   */
  public setUserId(userId: string): void {
    this.userId = userId;
    if (this.config.enableCache) {
      localStorage.setItem(this.getUserIdStorageKey(), userId);
    }
  }

  /**
   * 获取当前会话ID
   */
  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * 获取设备指纹
   */
  public getDeviceFingerprint(): string {
    return this.deviceFingerprint;
  }

  // ========== 私有方法 ==========
  
  private async sendData(events: EventData[]): Promise<void> {
    return new Promise((resolve, reject) => {
      // 优先使用sendBeacon，不适合则回退到fetch
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(events)], {
          type: 'application/json',
        });
        const success = navigator.sendBeacon(this.config.endpoint, blob);
        success ? resolve() : reject(new Error('sendBeacon failed'));
      } else {
        console.log('sendData', events);
        fetch(this.config.endpoint, {
          method: 'POST',
          body: JSON.stringify(events),
          headers: {
            'Content-Type': 'application/json',
          },
          keepalive: true, // 确保在页面卸载时也能发送
        })
          .then((res) => (res.ok ? resolve() : reject(res.statusText)))
          .catch(reject);
      }
    });
  }

  private enrichProperties(properties: Record<string, any>): CommonProperties {
    // 自动收集的通用属性
    const commonProps: CommonProperties = {
      url: window.location.href,
      referrer: document.referrer,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      language: navigator.language,
      user_agent: navigator.userAgent,
      ...properties,
    };
    
    return commonProps;
  }

  private generateSessionId(): string {
    // 会话ID: 当前会话有效，通常页面刷新后改变
    return `ses_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
  }

  private getUserIdStorageKey(): string {
    return `_uid_${this.config.appId}`;
  }

  private getOrCreateUserId(): string {
    // 从localStorage获取或生成持久化用户ID
    const key = this.getUserIdStorageKey();
    let uid = localStorage.getItem(key);
    if (!uid) {
      uid = `usr_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
      localStorage.setItem(key, uid);
    }
    return uid;
  }

  private generateDeviceFingerprint(): string {
    // 简易设备指纹生成(实际项目应该更复杂)
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('fingerprint', 2, 15);
      return canvas.toDataURL().substring(22);
    } catch (e) {
      console.error('生成设备指纹失败:', e);
      return '';
    }
  }

  private initAutoFlush(): void {
    this.autoFlushTimer = window.setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  private getEventCacheKey(): string {
    return `_event_cache_${this.config.appId}`;
  }

  private saveToCache(): void {
    try {
      localStorage.setItem(
        this.getEventCacheKey(),
        JSON.stringify(this.queue)
      );
    } catch (e) {
      console.error('保存到缓存失败:', e);
    }
  }

  private restoreFromCache(): void {
    try {
      const cached = localStorage.getItem(this.getEventCacheKey());
      if (cached) {
        const cachedEvents = JSON.parse(cached) as EventData[];
        if (Array.isArray(cachedEvents)) {
          this.queue.push(...cachedEvents);
          this.flush(); // 尝试立即发送缓存的事件
        }
      }
    } catch (e) {
      console.error('恢复缓存事件失败:', e);
    }
  }

  private clearCache(): void {
    localStorage.removeItem(this.getEventCacheKey());
  }

  private initBeforeUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      // 页面卸载时立即发送所有剩余事件
      if (this.queue.length > 0) {
        // 使用同步XHR确保发送完成
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', this.config.endpoint, false);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(JSON.stringify(this.queue));
        } catch (e) {
          console.error('页面卸载时发送失败:', e);
        }
      }
      
      // 清除定时器
      if (this.autoFlushTimer) {
        clearInterval(this.autoFlushTimer);
      }
    });
  }
}

export default AdvancedTracker;