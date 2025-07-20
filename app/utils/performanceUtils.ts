/**
 * 性能监控工具
 * 用于收集Web Vitals指标：LCP、FCP、TTFB、CLS
 */

export interface PerformanceMetrics {
  lcp?: number;
  fcp?: number;
  ttfb?: number;
  cls?: number;
  fid?: number;
  timestamp: number;
}

// 性能指标缓存
let performanceMetrics: PerformanceMetrics = {
  timestamp: Date.now()
};

// 初始化性能监控
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  console.log('Initializing performance monitoring...');
  
  // 立即检查FCP，因为它可能在DOMContentLoaded之前就发生了
  setTimeout(() => {
    const fcp = getFCPFromPerformanceAPI();
    if (fcp) {
      performanceMetrics.fcp = fcp;
      console.log('Early FCP collected:', fcp);
    }
  }, 100);
  
  // 确保DOM已经准备好
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initPerformanceMonitoringInternal();
    });
  } else {
    initPerformanceMonitoringInternal();
  }
}

// 内部初始化函数
function initPerformanceMonitoringInternal(): void {
  console.log('Initializing performance monitoring internal...');

  // 监听LCP (Largest Contentful Paint)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          performanceMetrics.lcp = lastEntry.startTime;
          console.log('LCP collected:', performanceMetrics.lcp);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      console.log('LCP observer initialized');
    } catch (e) {
      console.warn('LCP monitoring not supported:', e);
    }

    // 监听FCP (First Contentful Paint)
    try {
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstEntry = entries[0];
        if (firstEntry) {
          performanceMetrics.fcp = firstEntry.startTime;
          console.log('FCP collected:', performanceMetrics.fcp);
        }
      });
      fcpObserver.observe({ entryTypes: ['first-contentful-paint'] });
      console.log('FCP observer initialized');
    } catch (e) {
      console.warn('FCP monitoring not supported:', e);
    }

    // 监听CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const layoutShiftEntry = entry as any;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
        performanceMetrics.cls = clsValue;
        console.log('CLS collected:', performanceMetrics.cls);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      console.log('CLS observer initialized');
    } catch (e) {
      console.warn('CLS monitoring not supported:', e);
    }

    // 监听FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstEntry = entries[0] as any;
        if (firstEntry) {
          performanceMetrics.fid = firstEntry.processingStart - firstEntry.startTime;
          console.log('FID collected:', performanceMetrics.fid);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      console.log('FID observer initialized');
    } catch (e) {
      console.warn('FID monitoring not supported:', e);
    }
  }

  // 获取TTFB (Time to First Byte)
  getTTFB();
  
  console.log('Performance monitoring initialization completed');
}

// 获取TTFB
function getTTFB(): void {
  if (typeof window === 'undefined') return;

  // 使用Navigation Timing API
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      performanceMetrics.ttfb = navigation.responseStart - navigation.requestStart;
      console.log('TTFB:', performanceMetrics.ttfb);
    }
  }
}

// 重新获取TTFB（用于延迟获取）
export function refreshTTFB(): void {
  getTTFB();
}

// 备用方法：从Performance API获取LCP
export function getLCPFromPerformanceAPI(): number | undefined {
  if (typeof window === 'undefined') return undefined;
  
  try {
    const entries = performance.getEntriesByType('largest-contentful-paint');
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      return lastEntry.startTime;
    }
  } catch (e) {
    console.warn('Failed to get LCP from Performance API:', e);
  }
  
  return undefined;
}

// 备用方法：从Performance API获取FCP
export function getFCPFromPerformanceAPI(): number | undefined {
  if (typeof window === 'undefined') return undefined;
  
  try {
    const entries = performance.getEntriesByType('first-contentful-paint');
    if (entries.length > 0) {
      const firstEntry = entries[0];
      console.log('FCP found in Performance API:', firstEntry.startTime);
      return firstEntry.startTime;
    }
    
    // 如果没有first-contentful-paint条目，尝试从paint条目获取
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      console.log('FCP found in paint entries:', fcpEntry.startTime);
      return fcpEntry.startTime;
    }
    
    console.log('No FCP entries found in Performance API');
  } catch (e) {
    console.warn('Failed to get FCP from Performance API:', e);
  }
  
  return undefined;
}

// 备用方法：从Performance API获取FID
export function getFIDFromPerformanceAPI(): number | undefined {
  if (typeof window === 'undefined') return undefined;
  
  try {
    const entries = performance.getEntriesByType('first-input');
    if (entries.length > 0) {
      const firstEntry = entries[0] as any;
      const fid = firstEntry.processingStart - firstEntry.startTime;
      console.log('FID found in Performance API:', fid);
      return fid;
    }
    
    console.log('No FID entries found in Performance API');
  } catch (e) {
    console.warn('Failed to get FID from Performance API:', e);
  }
  
  return undefined;
}

// 备用方法：从Performance API获取CLS
export function getCLSFromPerformanceAPI(): number | undefined {
  if (typeof window === 'undefined') return undefined;
  
  try {
    const entries = performance.getEntriesByType('layout-shift');
    let clsValue = 0;
    
    for (const entry of entries) {
      const layoutShiftEntry = entry as any;
      if (!layoutShiftEntry.hadRecentInput) {
        clsValue += layoutShiftEntry.value;
      }
    }
    
    return clsValue;
  } catch (e) {
    console.warn('Failed to get CLS from Performance API:', e);
  }
  
  return undefined;
}

// 获取当前性能指标
export function getPerformanceMetrics(): PerformanceMetrics {
  console.log('Current performance metrics:', performanceMetrics);
  
  // 如果某些指标没有数据，尝试直接从Performance API获取
  const currentMetrics = { ...performanceMetrics };
  
  if (!currentMetrics.lcp) {
    const lcpFromAPI = getLCPFromPerformanceAPI();
    if (lcpFromAPI) {
      currentMetrics.lcp = lcpFromAPI;
      console.log('LCP retrieved from API in getPerformanceMetrics:', lcpFromAPI);
    }
  }
  
  if (!currentMetrics.fcp) {
    const fcpFromAPI = getFCPFromPerformanceAPI();
    if (fcpFromAPI) {
      currentMetrics.fcp = fcpFromAPI;
      console.log('FCP retrieved from API in getPerformanceMetrics:', fcpFromAPI);
    }
  }
  
  if (!currentMetrics.cls) {
    const clsFromAPI = getCLSFromPerformanceAPI();
    if (clsFromAPI) {
      currentMetrics.cls = clsFromAPI;
      console.log('CLS retrieved from API in getPerformanceMetrics:', clsFromAPI);
    }
  }
  
  return currentMetrics;
}

// 检查性能监控状态
export function checkPerformanceMonitoringStatus(): void {
  if (typeof window === 'undefined') {
    console.log('Performance monitoring: Not available (server-side)');
    return;
  }

  console.log('Performance monitoring status:');
  console.log('- PerformanceObserver supported:', 'PerformanceObserver' in window);
  console.log('- Performance API supported:', 'performance' in window);
  
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    console.log('- Navigation timing available:', !!navigation);
    
    if (navigation) {
      console.log('- Page load time:', performance.now());
      console.log('- Navigation start:', navigation.startTime);
    }
  }
  
  console.log('- Current metrics:', performanceMetrics);
}

// 重置性能指标
export function resetPerformanceMetrics(): void {
  performanceMetrics = {
    timestamp: Date.now()
  };
}

// 格式化性能指标
export function formatPerformanceMetrics(metrics: PerformanceMetrics): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  if (metrics.lcp !== undefined) {
    formatted.lcp = `${metrics.lcp.toFixed(2)}ms`;
  }
  
  if (metrics.fcp !== undefined) {
    formatted.fcp = `${metrics.fcp.toFixed(2)}ms`;
  }
  
  if (metrics.ttfb !== undefined) {
    formatted.ttfb = `${metrics.ttfb.toFixed(2)}ms`;
  }
  
  if (metrics.cls !== undefined) {
    formatted.cls = metrics.cls.toFixed(4);
  }
  
  if (metrics.fid !== undefined) {
    formatted.fid = `${metrics.fid.toFixed(2)}ms`;
  }
  
  return formatted;
}

// 获取性能等级
export function getPerformanceGrade(metrics: PerformanceMetrics): Record<string, string> {
  const grades: Record<string, string> = {};
  
  // LCP等级
  if (metrics.lcp !== undefined) {
    if (metrics.lcp < 2500) grades.lcp = 'good';
    else if (metrics.lcp < 4000) grades.lcp = 'needs-improvement';
    else grades.lcp = 'poor';
  }
  
  // FCP等级
  if (metrics.fcp !== undefined) {
    if (metrics.fcp < 1800) grades.fcp = 'good';
    else if (metrics.fcp < 3000) grades.fcp = 'needs-improvement';
    else grades.fcp = 'poor';
  }
  
  // TTFB等级
  if (metrics.ttfb !== undefined) {
    if (metrics.ttfb < 800) grades.ttfb = 'good';
    else if (metrics.ttfb < 1800) grades.ttfb = 'needs-improvement';
    else grades.ttfb = 'poor';
  }
  
  // CLS等级
  if (metrics.cls !== undefined) {
    if (metrics.cls < 0.1) grades.cls = 'good';
    else if (metrics.cls < 0.25) grades.cls = 'needs-improvement';
    else grades.cls = 'poor';
  }
  
  // FID等级
  if (metrics.fid !== undefined) {
    if (metrics.fid < 100) grades.fid = 'good';
    else if (metrics.fid < 300) grades.fid = 'needs-improvement';
    else grades.fid = 'poor';
  }
  
  return grades;
}

// 获取等级颜色
export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'good':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    case 'needs-improvement':
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    case 'poor':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
  }
}

// 手动触发FID收集（通过模拟点击）
function triggerFIDCollection(): void {
  if (typeof window === 'undefined') return;
  
  // 创建一个隐藏的按钮来触发FID
  const button = document.createElement('button');
  button.style.position = 'absolute';
  button.style.left = '-9999px';
  button.style.top = '-9999px';
  button.style.opacity = '0';
  button.style.pointerEvents = 'none';
  button.textContent = 'FID Trigger';
  
  document.body.appendChild(button);
  
  // 模拟点击
  setTimeout(() => {
    button.click();
    document.body.removeChild(button);
  }, 100);
}

// 强制收集所有性能指标
export function forceCollectAllMetrics(): PerformanceMetrics {
  console.log('Force collecting all performance metrics...');
  
  // 首先获取已经收集到的指标
  const currentMetrics = { ...performanceMetrics };
  
  const metrics: PerformanceMetrics = {
    timestamp: Date.now()
  };
  
  // 强制获取TTFB
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.ttfb = navigation.responseStart - navigation.requestStart;
    }
  }
  
  // 优先使用已收集的LCP，如果没有则从API获取
  if (currentMetrics.lcp) {
    metrics.lcp = currentMetrics.lcp;
  } else {
    const lcp = getLCPFromPerformanceAPI();
    if (lcp) {
      metrics.lcp = lcp;
    }
  }
  
  // 优先使用已收集的FCP，如果没有则从API获取
  if (currentMetrics.fcp) {
    metrics.fcp = currentMetrics.fcp;
  } else {
    const fcp = getFCPFromPerformanceAPI();
    if (fcp) {
      metrics.fcp = fcp;
    }
  }
  
  // 优先使用已收集的CLS，如果没有则从API获取
  if (currentMetrics.cls) {
    metrics.cls = currentMetrics.cls;
    console.log('CLS from cache:', metrics.cls);
  } else {
    const cls = getCLSFromPerformanceAPI();
    if (cls) {
      metrics.cls = cls;
      console.log('CLS from API:', metrics.cls);
    }
  }
  
  // 优先使用已收集的FID，如果没有则从API获取
  if (currentMetrics.fid) {
    metrics.fid = currentMetrics.fid;
    console.log('FID from cache:', metrics.fid);
  } else {
    // 尝试触发FID收集
    triggerFIDCollection();
    
    // 等待一下再检查
    setTimeout(() => {
      const fid = getFIDFromPerformanceAPI();
      if (fid) {
        metrics.fid = fid;
        console.log('FID from API after trigger:', fid);
      }
    }, 200);
    
    const fid = getFIDFromPerformanceAPI();
    if (fid) {
      metrics.fid = fid;
      console.log('FID from API:', fid);
    }
  }
  
  // 更新全局缓存
  performanceMetrics = { ...performanceMetrics, ...metrics };
  
  console.log('All metrics collected:', metrics);
  return metrics;
} 