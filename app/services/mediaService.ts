import axios from 'axios';
import { 
  MediaItem, 
  MediaType, 
  FilterParams, 
  PaginationParams, 
  MediaResponse 
} from '@/app/types/media';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const mediaService = {
  // 获取媒体列表
  async getMedia(
    filters: FilterParams = {},
    pagination: PaginationParams = { page: 1, pageSize: 12 }
  ): Promise<MediaResponse> {
    try {
      console.log('发送请求到:', `${API_BASE}/media`);
      console.log('请求参数:', { filters, pagination });
      
      // 构建查询参数
      const queryParams = new URLSearchParams();
      
      // 添加筛选参数
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.year) queryParams.append('year', filters.year.toString());
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.order) queryParams.append('order', filters.order);
      
      // 添加分页参数
      queryParams.append('page', pagination.page.toString());
      queryParams.append('pageSize', pagination.pageSize.toString());
      
      const res = await axios.get(`${API_BASE}/media?${queryParams.toString()}`);
      console.log('响应数据:', res.data);
      
      return res.data;
    } catch (error) {
      console.error('获取媒体列表失败:', error);
      throw error;
    }
  },

  // 搜索媒体
  async searchMedia(
    query: string, 
    pagination: PaginationParams = { page: 1, pageSize: 12 }
  ): Promise<MediaResponse> {
    try {

      const params = {
        q: query,
        page: pagination.page,
        pageSize: pagination.pageSize
      };
      
      const res = await axios.get(`${API_BASE}/media`, { params });
      console.log('搜索响应数据:', res.data);
      
      return res.data;
    } catch (error) {
      console.error('搜索媒体失败:', error);
      if (axios.isAxiosError(error)) {
        console.error('错误详情:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      throw error;
    }
  },

  // 获取单个媒体详情
  async getMediaById(id: string): Promise<MediaItem> {
    try {
      const res = await axios.get(`${API_BASE}/media/${id}`);
      return res.data;
    } catch (error) {
      console.error('获取媒体详情失败:', error);
      throw error;
    }
  },

  // 获取相关推荐
  async getRelatedMedia(id: string, limit: number = 6): Promise<MediaItem[]> {
    try {
      const res = await axios.get(`${API_BASE}/media/${id}/related`, { params: { limit } });
      return res.data;
    } catch (error) {
      console.error('获取相关推荐失败:', error);
      throw error;
    }
  },

  // 获取统计信息
  async getStats() {
    try {
      const res = await axios.get(`${API_BASE}/media/stats`);
      return res.data;
    } catch (error) {
      console.error('获取统计信息失败:', error);
      throw error;
    }
  },

  // 按类型获取媒体
  async getMediaByType(type: MediaType): Promise<MediaItem[]> {
    try {
      const res = await axios.get(`${API_BASE}/media/type/${type}`);
      return res.data;
    } catch (error) {
      console.error('按类型获取媒体失败:', error);
      throw error;
    }
  },

  // 按年份获取媒体
  async getMediaByYear(year: number): Promise<MediaItem[]> {
    try {
      const res = await axios.get(`${API_BASE}/media/year/${year}`);
      return res.data;
    } catch (error) {
      console.error('按年份获取媒体失败:', error);
      throw error;
    }
  },

  // 按状态获取媒体
  async getMediaByStatus(status: string): Promise<MediaItem[]> {
    try {
      const res = await axios.get(`${API_BASE}/media/status/${status}`);
      return res.data;
    } catch (error) {
      console.error('按状态获取媒体失败:', error);
      throw error;
    }
  },

  // 创建媒体
  async createMedia(media: Omit<MediaItem, 'id'>): Promise<MediaItem> {
    try {
      const res = await axios.post(`${API_BASE}/media`, media);
      return res.data;
    } catch (error) {
      console.error('创建媒体失败:', error);
      throw error;
    }
  },

  // 更新媒体
  async updateMedia(id: string, media: Partial<MediaItem>): Promise<MediaItem> {
    try {
      const res = await axios.patch(`${API_BASE}/media/${id}`, media);
      return res.data;
    } catch (error) {
      console.error('更新媒体失败:', error);
      throw error;
    }
  },

  // 删除媒体
  async deleteMedia(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE}/media/${id}`);
    } catch (error) {
      console.error('删除媒体失败:', error);
      throw error;
    }
  }
}; 