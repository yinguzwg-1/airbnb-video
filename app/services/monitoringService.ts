import { get } from '@/app/utils/apiUtils';
import { config as configApi } from '@/app/config';
import { MonitorData } from "../types";
const API_BASE = configApi.NEXT_PUBLIC_API_URL;

export const monitoringService = {

  async getMonitoringDataWithPagination(page: number = 1, limit: number = 20): Promise<{
    data: MonitorData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const response = await get(`${API_BASE}/monitor?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('获取监控数据失败:', error);
      throw error;
    }
  },

  async getMonitoringStats(): Promise<{
    total: number;
    successRate: number;
    errorRate: number;
    averageResponseTime: number;
    statusCodeDistribution: Record<number, number>;
  }> {
    try {
      const response = await get(`${API_BASE}/monitor/stats`);
      return response;
    } catch (error) {
      console.error('获取监控统计数据失败:', error);
      throw error;
    }
  }
}