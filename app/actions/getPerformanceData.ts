import { PerformanceDataService } from '@/app/services/performanceDataService';
import { PerformanceSummary } from '@/app/services/performanceDataService';

export async function getPerformanceData(
  {page}: {page: string}
): Promise<PerformanceSummary[]> {
  try {
    // 获取性能数据
    const data = await PerformanceDataService.getPagePerformanceData(page);
    return data;
  } catch (error) {
    console.error('获取性能数据失败:', error);
    return [];
  }
} 