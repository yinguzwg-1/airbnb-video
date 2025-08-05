import { get } from '@/app/utils/apiUtils';
import { config as configApi } from '@/app/config';
import { Music } from '../types/music';

const API_BASE = configApi.NEXT_PUBLIC_API_URL;

export const musicService = {
  async getMusicList(page: number = 1, limit: number = 20): Promise<{
    musicList: Music[];
  }> {
    try {
      const response = await get(`${API_BASE}/music?page=${page}&limit=${limit}`);
      if (response.code !== 200) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching music list:', error);
      throw error;
    }
    
  }
};