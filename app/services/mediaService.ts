import axios from 'axios';
import { 
  MediaItem, 
  MediaType, 
  FilterParams, 
  PaginationParams, 
  MediaResponse 
} from '@/app/types/media';

const API_BASE = process.env.NEXT_PUBLIC_LOCAL_HOST

// 默认的空响应
const defaultResponse: MediaResponse = {
  items: [],
  meta: {
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  }
};

export const mediaService = {
  // 获取媒体列表
  async getMedia(
    {page, pageSize, search, sortBy, order}: {page: number, pageSize: number, search?: string, sortBy?: string, order?: string}
  ): Promise<MediaResponse> {
    try {
      // 检查API基础URL是否配置
      if (!API_BASE) {
        console.warn('API_BASE not configured, returning default response');
        return defaultResponse;
      }

      // 构建查询参数
      const queryParams = new URLSearchParams();
      // 添加分页参数
      queryParams.append('page', page.toString());
      queryParams.append('limit', pageSize.toString());
      if (search) {
        queryParams.append('search', search);
      }
      if (sortBy) {
        queryParams.append('sortBy', sortBy);
      }
      if (order) {
        queryParams.append('orderBy', order);
      }
      
      const res = await axios.get(`${API_BASE}/media`, {
        params: queryParams,
        timeout: 5000 // 5秒超时
      });
      return res.data;
    } catch (error) {
      console.error('获取媒体列表失败:', error);
      // 返回默认响应而不是抛出错误，避免服务器端渲染失败
      return defaultResponse;
    }
  },

  // 获取单个媒体详情
  async getMediaById(id: string): Promise<MediaItem | null> {
    try {
      if (!API_BASE) {
        console.warn('API_BASE not configured, returning null');
        return null;
      }
      
      const res = await axios.get(`${API_BASE}/media/${id}`, {
        timeout: 5000
      });
      return res.data;
    } catch (error) {
      console.error('获取媒体详情失败:', error);
      return null;
    }
  },

  // 获取相关推荐
  async getRelatedMedia(id: string, limit: number = 6): Promise<MediaItem[]> {
    try {
      if (!API_BASE) {
        console.warn('API_BASE not configured, returning empty array');
        return [];
      }
      
      const res = await axios.get(`${API_BASE}/media/${id}/related`, { 
        params: { limit },
        timeout: 5000
      });
      return res.data;
    } catch (error) {
      console.error('获取相关推荐失败:', error);
      return [];
    }
  },

  // 获取统计信息
  async getStats() {
    try {
      if (!API_BASE) {
        console.warn('API_BASE not configured, returning default stats');
        return { total: 0, movies: 0, tvShows: 0 };
      }
      
      const res = await axios.get(`${API_BASE}/media/stats`, {
        timeout: 5000
      });
      return res.data;
    } catch (error) {
      console.error('获取统计信息失败:', error);
      return { total: 0, movies: 0, tvShows: 0 };
    }
  },

  // 按类型获取媒体
  async getMediaByType(type: MediaType): Promise<MediaItem[]> {
    try {
      if (!API_BASE) {
        console.warn('API_BASE not configured, returning empty array');
        return [];
      }
      
      const res = await axios.get(`${API_BASE}/media/type/${type}`, {
        timeout: 5000
      });
      return res.data;
    } catch (error) {
      console.error('按类型获取媒体失败:', error);
      return [];
    }
  },

  // 按年份获取媒体
  async getMediaByYear(year: number): Promise<MediaItem[]> {
    try {
      if (!API_BASE) {
        console.warn('API_BASE not configured, returning empty array');
        return [];
      }
      
      const res = await axios.get(`${API_BASE}/media/year/${year}`, {
        timeout: 5000
      });
      return res.data;
    } catch (error) {
      console.error('按年份获取媒体失败:', error);
      return [];
    }
  },

  // 按状态获取媒体
  async getMediaByStatus(status: string): Promise<MediaItem[]> {
    try {
      if (!API_BASE) {
        console.warn('API_BASE not configured, returning empty array');
        return [];
      }
      
      const res = await axios.get(`${API_BASE}/media/status/${status}`, {
        timeout: 5000
      });
      return res.data;
    } catch (error) {
      console.error('按状态获取媒体失败:', error);
      return [];
    }
  },

  // 创建媒体
  async createMedia(media: Omit<MediaItem, 'id'>): Promise<MediaItem | null> {
    try {
      if (!API_BASE) {
        console.warn('API_BASE not configured, returning null');
        return null;
      }
      
      const res = await axios.post(`${API_BASE}/media`, media, {
        timeout: 5000
      });
      return res.data;
    } catch (error) {
      console.error('创建媒体失败:', error);
      return null;
    }
  },

  // 更新媒体
  async updateMedia(id: string, media: Partial<MediaItem>): Promise<MediaItem | null> {
    try {
      if (!API_BASE) {
        console.warn('API_BASE not configured, returning null');
        return null;
      }
      
      const res = await axios.patch(`${API_BASE}/media/${id}`, media, {
        timeout: 5000
      });
      return res.data;
    } catch (error) {
      console.error('更新媒体失败:', error);
      return null;
    }
  },

  // 删除媒体
  async deleteMedia(id: string): Promise<boolean> {
    try {
      if (!API_BASE) {
        console.warn('API_BASE not configured, returning false');
        return false;
      }
      
      await axios.delete(`${API_BASE}/media/${id}`, {
        timeout: 5000
      });
      return true;
    } catch (error) {
      console.error('删除媒体失败:', error);
      return false;
    }
  }
}; 