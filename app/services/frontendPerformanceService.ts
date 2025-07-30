import { config } from '@/app/config';
import { get } from '@/app/utils/apiUtils';

export interface FrontendPerformanceData {
  id: number,
  event_id: string,
  event_time: string,
  user_id: string,
  session_id: string,
  properties: {
    fcp: number,
    fid: number,
    url: string,
    ttfb: number,
    lcp: number,
    cls: number,
    language: string,
    referrer: string,
    page_name: string,
    timestamp: string,
    page_title: string,
    user_agent: string,
    screen_width: number,
    screen_height: number,
    viewport_width: number,
    viewport_height: number,
    performance_timestamp: number
  },
  sdk_version: string,
  app_id: string,
  module: string
}
export interface FrontendPerformanceSummary {
  pageName: string,
  pageTitle: string,
  lcp: number,
  fcp: number,
  ttfb: number,
  cls: number,
  fid: number,
  timestamp: number,
  module: string
}

// 获取前端性能数据
export async function getFrontendPerformanceData(): Promise<FrontendPerformanceSummary[]> {
  try {

    const data = await get<FrontendPerformanceData[]>(`${config.NEXT_PUBLIC_API_URL}/events/frontend-performance`);
    // 过滤出包含性能数据的page_view事件
    const performanceData = data.map((event: FrontendPerformanceData) => ({
      pageName: event.properties.page_name || 'unknown',
      pageTitle: event.properties.page_title || 'Unknown Page',
      lcp: event.properties.lcp || 0,
      fcp: event.properties.fcp || 0,
      ttfb: event.properties.ttfb || 0,
      cls: event.properties.cls || 0,
      fid: event.properties.fid || 0,
      timestamp: new Date(event.properties.timestamp).getTime(),
      module: event.module || 'unknown',
    }));

    // 根据module分组，并筛选出每个module的最新数据
    const moduleGroups = performanceData.reduce((groups, item) => {
      const moduleName = item.module;
      if (!groups[moduleName]) {
        groups[moduleName] = [];
      }
      groups[moduleName].push(item);
      return groups;
    }, {} as Record<string, typeof performanceData>);

    // 从每个module组中筛选出timestamp最新的数据
    const latestData = Object.values(moduleGroups).map(group => {
      return group.reduce((latest, current) => {
        return current.timestamp > latest.timestamp ? current : latest;
      });
    });

    return latestData;
  } catch (error) {
    console.error('Failed to fetch frontend performance data:', error);
    return [];
  }
}

