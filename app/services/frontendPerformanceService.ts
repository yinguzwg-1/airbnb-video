import { config } from '@/app/config';

export interface FrontendPerformanceData {
  pageName: string;
  pageTitle: string;
  lcp: number;
  fcp: number;
  ttfb: number;
  cls: number;
  fid: number;
  timestamp: number;
  visitCount: number;
}

export interface FrontendPerformanceSummary {
  pageName: string;
  pageTitle: string;
  averageLcp: number;
  averageFcp: number;
  averageTtfb: number;
  averageCls: number;
  averageFid: number;
  totalVisits: number;
  overallGrade: string;
  latestLcp: number;
  latestFcp: number;
  latestTtfb: number;
  latestCls: number;
  latestFid: number;
  latestTimestamp: number;
}

export interface GlobalPerformanceMetrics {
  averageLcp: number;
  averageFcp: number;
  averageTtfb: number;
  averageCls: number;
  averageFid: number;
  latestLcp: number;
  latestFcp: number;
  latestTtfb: number;
  latestCls: number;
  latestFid: number;
  latestTimestamp: number;
  totalPages: number;
  totalVisits: number;
}

// 获取前端性能数据
export async function getFrontendPerformanceData(): Promise<FrontendPerformanceData[]> {
  try {
    console.log('Fetching frontend performance data from:', `${config.NEXT_PUBLIC_API_URL}/events`);
    
    const response = await fetch(`${config.NEXT_PUBLIC_API_URL}/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw API response:', data);
    console.log('Total events received:', data.data?.events?.length || 0);
    
    // 过滤出包含性能数据的page_view事件
    const performanceEvents = data.data?.events?.filter((event: any) => 
      event.event_id === 'page_view');
    
    console.log('Performance events found:', performanceEvents.length);
    console.log('Sample performance event:', performanceEvents[0]);

    return performanceEvents.map((event: any) => ({
      pageName: event.properties?.page_name || 'unknown',
      pageTitle: event.properties?.page_title || 'Unknown Page',
      lcp: event.properties?.lcp || 0,
      fcp: event.properties?.fcp || 0,
      ttfb: event.properties?.ttfb || 0,
      cls: event.properties?.cls || 0,
      fid: event.properties?.fid || 0,
      timestamp: new Date(event.event_time || event.created_at).getTime(),
      visitCount: 1,
    }));
  } catch (error) {
    console.error('Failed to fetch frontend performance data:', error);
    return [];
  }
}

// 获取前端性能汇总数据
export async function getFrontendPerformanceSummary(): Promise<FrontendPerformanceSummary[]> {
  const data = await getFrontendPerformanceData();
  console.log('Frontend performance data for summary:', data);
  console.log('Data length:', data.length);
  
  // 按页面分组并计算平均值
  const pageGroups = data.reduce((groups: Record<string, FrontendPerformanceData[]>, item) => {
    const key = item.pageName;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
  
  console.log('Page groups:', pageGroups);

  return Object.entries(pageGroups).map(([pageName, items]) => {
    const totalVisits = items.length;
    const averageLcp = items.reduce((sum, item) => sum + item.lcp, 0) / totalVisits;
    const averageFcp = items.reduce((sum, item) => sum + item.fcp, 0) / totalVisits;
    const averageTtfb = items.reduce((sum, item) => sum + item.ttfb, 0) / totalVisits;
    const averageCls = items.reduce((sum, item) => sum + item.cls, 0) / totalVisits;
    const averageFid = items.reduce((sum, item) => sum + item.fid, 0) / totalVisits;

    // 获取最新的指标（按时间戳排序）
    const sortedItems = items.sort((a, b) => b.timestamp - a.timestamp);
    const latestItem = sortedItems[0];

    // 计算整体性能等级
    const grades = [];
    if (averageLcp > 0) {
      if (averageLcp < 2500) grades.push('good');
      else if (averageLcp < 4000) grades.push('needs-improvement');
      else grades.push('poor');
    }
    if (averageFcp > 0) {
      if (averageFcp < 1800) grades.push('good');
      else if (averageFcp < 3000) grades.push('needs-improvement');
      else grades.push('poor');
    }
    if (averageTtfb > 0) {
      if (averageTtfb < 800) grades.push('good');
      else if (averageTtfb < 1800) grades.push('needs-improvement');
      else grades.push('poor');
    }
    if (averageCls > 0) {
      if (averageCls < 0.1) grades.push('good');
      else if (averageCls < 0.25) grades.push('needs-improvement');
      else grades.push('poor');
    }
    if (averageFid > 0) {
      if (averageFid < 100) grades.push('good');
      else if (averageFid < 300) grades.push('needs-improvement');
      else grades.push('poor');
    }

    const overallGrade = grades.length > 0 
      ? grades.filter(g => g === 'good').length / grades.length > 0.6 ? 'good' 
      : grades.filter(g => g === 'poor').length / grades.length > 0.4 ? 'poor' 
      : 'needs-improvement'
      : 'unknown';

    return {
      pageName,
      pageTitle: items[0]?.pageTitle || pageName,
      averageLcp,
      averageFcp,
      averageTtfb,
      averageCls,
      averageFid,
      totalVisits,
      overallGrade,
      latestLcp: latestItem?.lcp || 0,
      latestFcp: latestItem?.fcp || 0,
      latestTtfb: latestItem?.ttfb || 0,
      latestCls: latestItem?.cls || 0,
      latestFid: latestItem?.fid || 0,
      latestTimestamp: latestItem?.timestamp || 0,
    };
  });
}

// 获取全局性能指标平均值
export async function getGlobalPerformanceMetrics(): Promise<GlobalPerformanceMetrics> {
  const data = await getFrontendPerformanceData();
  
  if (data.length === 0) {
    return {
      averageLcp: 0,
      averageFcp: 0,
      averageTtfb: 0,
      averageCls: 0,
      averageFid: 0,
      latestLcp: 0,
      latestFcp: 0,
      latestTtfb: 0,
      latestCls: 0,
      latestFid: 0,
      latestTimestamp: 0,
      totalPages: 0,
      totalVisits: 0,
    };
  }

  // 计算全局平均值
  const totalVisits = data.length;
  const averageLcp = data.reduce((sum, item) => sum + item.lcp, 0) / totalVisits;
  const averageFcp = data.reduce((sum, item) => sum + item.fcp, 0) / totalVisits;
  const averageTtfb = data.reduce((sum, item) => sum + item.ttfb, 0) / totalVisits;
  const averageCls = data.reduce((sum, item) => sum + item.cls, 0) / totalVisits;
  const averageFid = data.reduce((sum, item) => sum + item.fid, 0) / totalVisits;

  // 获取最新的指标
  const sortedData = data.sort((a, b) => b.timestamp - a.timestamp);
  const latestItem = sortedData[0];

  // 计算总页面数
  const uniquePages = new Set(data.map(item => item.pageName)).size;

  return {
    averageLcp,
    averageFcp,
    averageTtfb,
    averageCls,
    averageFid,
    latestLcp: latestItem?.lcp || 0,
    latestFcp: latestItem?.fcp || 0,
    latestTtfb: latestItem?.ttfb || 0,
    latestCls: latestItem?.cls || 0,
    latestFid: latestItem?.fid || 0,
    latestTimestamp: latestItem?.timestamp || 0,
    totalPages: uniquePages,
    totalVisits,
  };
}

// 测试函数：检查API响应
export async function testApiConnection(): Promise<void> {
  try {
    console.log('Testing API connection...');
    const response = await fetch(`${config.NEXT_PUBLIC_API_URL}/events`);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API response structure:', Object.keys(data));
      console.log('Data structure:', data.data ? Object.keys(data.data) : 'No data property');
      console.log('Events count:', data.data?.events?.length || 0);
      
      if (data.data?.events?.length > 0) {
        const sampleEvent = data.data.events[0];
        console.log('Sample event structure:', Object.keys(sampleEvent));
        console.log('Sample event properties:', sampleEvent.properties);
      }
    }
  } catch (error) {
    console.error('API connection test failed:', error);
  }
} 