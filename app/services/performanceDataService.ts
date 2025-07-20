import { burryPointService } from './burryPointService';

export interface PagePerformanceData {
  pageName: string;
  pageTitle: string;
  lcp: number | null;
  fcp: number | null;
  ttfb: number | null;
  cls: number | null;
  fid: number | null;
  timestamp: string;
  performanceGrade: {
    lcp: 'good' | 'needs-improvement' | 'poor' | 'unknown';
    fcp: 'good' | 'needs-improvement' | 'poor' | 'unknown';
    ttfb: 'good' | 'needs-improvement' | 'poor' | 'unknown';
    cls: 'good' | 'needs-improvement' | 'poor' | 'unknown';
    fid: 'good' | 'needs-improvement' | 'poor' | 'unknown';
  };
}

export interface PerformanceSummary {
  pageName: string;
  pageTitle: string;
  averageLcp: number;
  averageFcp: number;
  averageTtfb: number;
  averageCls: number;
  averageFid: number;
  totalVisits: number;
  lastVisit: string;
  overallGrade: 'good' | 'needs-improvement' | 'poor' | 'unknown';
}

// 性能等级评估函数
function getPerformanceGrade(metric: string, value: number | null): 'good' | 'needs-improvement' | 'poor' | 'unknown' {
  if (value === null || value === undefined) return 'unknown';
  
  switch (metric) {
    case 'lcp':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'fcp':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'ttfb':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    case 'cls':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'fid':
      return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
    default:
      return 'unknown';
  }
}

// 计算整体性能等级
function calculateOverallGrade(grades: Array<'good' | 'needs-improvement' | 'poor' | 'unknown'>): 'good' | 'needs-improvement' | 'poor' | 'unknown' {
  const validGrades = grades.filter(grade => grade !== 'unknown');
  if (validGrades.length === 0) return 'unknown';
  
  const goodCount = validGrades.filter(grade => grade === 'good').length;
  const poorCount = validGrades.filter(grade => grade === 'poor').length;
  
  if (poorCount > validGrades.length * 0.3) return 'poor';
  if (goodCount >= validGrades.length * 0.7) return 'good';
  return 'needs-improvement';
}

export class PerformanceDataService {
  // 从埋点数据中提取性能指标
  static async getPagePerformanceData(page: string = '1'): Promise<PerformanceSummary[]> {
    try {
      // 获取埋点数据
      const response = await burryPointService.getTrackerEvents({ page });
      const events = response?.data?.events || [];
      
      // 过滤出page_view事件并提取性能数据
      const performanceEvents = events
        .filter((event: any) => event.eventId === 'page_view')
        .map((event: any) => {
          const properties = event.properties || {};
          return {
            pageName: properties.page_name || 'unknown',
            pageTitle: properties.page_title || 'Unknown Page',
            lcp: properties.lcp ? parseFloat(properties.lcp) : null,
            fcp: properties.fcp ? parseFloat(properties.fcp) : null,
            ttfb: properties.ttfb ? parseFloat(properties.ttfb) : null,
            cls: properties.cls ? parseFloat(properties.cls) : null,
            fid: properties.fid ? parseFloat(properties.fid) : null,
            timestamp: event.timestamp || new Date().toISOString(),
          };
        })
        .filter((event: any) => 
          event.lcp !== null || 
          event.fcp !== null || 
          event.ttfb !== null || 
          event.cls !== null || 
          event.fid !== null
        );

      // 按页面分组并计算平均值
      const pageGroups = new Map<string, any[]>();
      performanceEvents.forEach((event: any) => {
        const key = event.pageName;
        if (!pageGroups.has(key)) {
          pageGroups.set(key, []);
        }
        pageGroups.get(key)!.push(event);
      });

      // 计算每个页面的性能摘要
      const summaries: PerformanceSummary[] = [];
      pageGroups.forEach((events, pageName) => {
        const validLcp = events.filter(e => e.lcp !== null).map(e => e.lcp);
        const validFcp = events.filter(e => e.fcp !== null).map(e => e.fcp);
        const validTtfb = events.filter(e => e.ttfb !== null).map(e => e.ttfb);
        const validCls = events.filter(e => e.cls !== null).map(e => e.cls);
        const validFid = events.filter(e => e.fid !== null).map(e => e.fid);

        const averageLcp = validLcp.length > 0 ? validLcp.reduce((a, b) => a + b, 0) / validLcp.length : 0;
        const averageFcp = validFcp.length > 0 ? validFcp.reduce((a, b) => a + b, 0) / validFcp.length : 0;
        const averageTtfb = validTtfb.length > 0 ? validTtfb.reduce((a, b) => a + b, 0) / validTtfb.length : 0;
        const averageCls = validCls.length > 0 ? validCls.reduce((a, b) => a + b, 0) / validCls.length : 0;
        const averageFid = validFid.length > 0 ? validFid.reduce((a, b) => a + b, 0) / validFid.length : 0;

        const grades = [
          getPerformanceGrade('lcp', averageLcp),
          getPerformanceGrade('fcp', averageFcp),
          getPerformanceGrade('ttfb', averageTtfb),
          getPerformanceGrade('cls', averageCls),
          getPerformanceGrade('fid', averageFid),
        ];

        const lastEvent = events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        summaries.push({
          pageName,
          pageTitle: lastEvent.pageTitle,
          averageLcp,
          averageFcp,
          averageTtfb,
          averageCls,
          averageFid,
          totalVisits: events.length,
          lastVisit: lastEvent.timestamp,
          overallGrade: calculateOverallGrade(grades),
        });
      });

      return summaries.sort((a, b) => b.totalVisits - a.totalVisits);
    } catch (error) {
      console.error('获取性能数据失败:', error);
      return [];
    }
  }

  // 获取特定页面的最新性能数据
  static async getLatestPagePerformance(pageName: string): Promise<PagePerformanceData | null> {
    try {
      const response = await burryPointService.getTrackerEvents({ page: '1' });
      const events = response?.data?.events || [];
      
      const pageEvents = events
        .filter((event: any) => 
          event.eventId === 'page_view' && 
          event.properties?.page_name === pageName
        )
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (pageEvents.length === 0) return null;

      const latestEvent = pageEvents[0];
      const properties = latestEvent.properties || {};

      const lcp = properties.lcp ? properties.lcp : null;
      const fcp = properties.fcp ? properties.fcp : null;
      const ttfb = properties.ttfb ? properties.ttfb : null;
      const cls = properties.cls ? properties.cls : null;
      const fid = properties.fid ? properties.fid : null;

      return {
        pageName: properties.page_name || 'unknown',
        pageTitle: properties.page_title || 'Unknown Page',
        lcp,
        fcp,
        ttfb,
        cls,
        fid,
        timestamp: latestEvent.properties?.performance_timestamp || '',
        performanceGrade: {
          lcp: getPerformanceGrade('lcp', lcp),
          fcp: getPerformanceGrade('fcp', fcp),
          ttfb: getPerformanceGrade('ttfb', ttfb),
          cls: getPerformanceGrade('cls', cls),
          fid: getPerformanceGrade('fid', fid),
        },
      };
    } catch (error) {
      console.error('获取页面性能数据失败:', error);
      return null;
    }
  }
} 