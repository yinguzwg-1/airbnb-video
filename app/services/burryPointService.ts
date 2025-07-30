import { get } from '@/app/utils/apiUtils';
import {
  TrackerEvent,
  CreateTrackerEvent,
  UpdateTrackerEvent,
  TrackerFilterParams,
  TrackerPaginationParams,
  TrackerResponse,
  TrackerStats,
  UserEventsResponse,
  ApiResponse
} from '@/app/types/tracker';
import { config as configApi } from '@/app/config';

// 默认的空响应
const defaultResponse: TrackerResponse = {
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  }
};

const API_BASE = configApi.NEXT_PUBLIC_API_URL;

export const burryPointService = {
  // 获取埋点事件列表
  async getTrackerEvents(
    {page = '1', limit = '10'}: {page?: string, limit?: string}
  ): Promise<ApiResponse<UserEventsResponse>> {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      
      const res = await get(`${API_BASE}/events?${params.toString()}`);
      return res;
    } catch (error) {
      console.error('获取埋点事件列表失败:', error);
      // 返回默认响应而不是抛出错误，避免服务器端渲染失败
      return {
        success: false,
        message: '获取数据失败',
        data: {
          events: [],
          total: 0,
          hasMore: false,
          stats: {
            totalEvents: 0,
            uniqueSessions: 0,
            todayEvents: 0,
            moduleStats: [],
            deviceStats: { web: 0, mobile: 0, unknown: 0 },
            uniqueUsers: 0
          }
        }
      };
    }
  },

  
}; 