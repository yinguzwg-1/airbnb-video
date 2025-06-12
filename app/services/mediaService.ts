import { mockData } from '@/app/data/mockData';
import { 
  MediaItem, 
  MediaType, 
  FilterParams, 
  PaginationParams, 
  MediaResponse 
} from '@/app/types/media';

export class MediaService {
  private data: MediaItem[] = mockData;

  // 获取所有媒体数据（带筛选和分页）
  async getMedia(
    filters: FilterParams = {},
    pagination: PaginationParams = { page: 1, limit: 12 }
  ): Promise<MediaResponse> {
    let filteredData = [...this.data];

    // 应用筛选条件
    filteredData = this.applyFilters(filteredData, filters);

    // 应用排序
    if (filters.sortBy) {
      filteredData = this.applySorting(filteredData, filters.sortBy, filters.sortOrder);
    }

    // 计算分页
    const total = filteredData.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page: pagination.page,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1
    };
  }

  // 应用筛选条件
  private applyFilters(data: MediaItem[], filters: FilterParams): MediaItem[] {
    let filtered = data;

    // 按媒体类型筛选
    if (filters.type) {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    // 按类型筛选
    if (filters.genre) {
      filtered = filtered.filter(item => 
        item.genres.some(genre => 
          genre.toLowerCase().includes(filters.genre!.toLowerCase())
        )
      );
    }

    // 按年份筛选
    if (filters.year) {
      filtered = filtered.filter(item => item.year === filters.year);
    }

    // 按评分筛选
    if (filters.rating) {
      filtered = filtered.filter(item => item.rating >= filters.rating!);
    }

    // 按状态筛选
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    return filtered;
  }

  // 应用排序
  private applySorting(
    data: MediaItem[], 
    sortBy: string, 
    sortOrder: 'asc' | 'desc' = 'desc'
  ): MediaItem[] {
    return data.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'year':
          aValue = a.year;
          bValue = b.year;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  // 搜索媒体
  async searchMedia(
    query: string, 
    pagination: PaginationParams = { page: 1, limit: 12 }
  ): Promise<MediaResponse> {
    const searchTerm = query.toLowerCase();
    const filtered = this.data.filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.genres.some(genre => genre.toLowerCase().includes(searchTerm)) ||
      (item.type === MediaType.MOVIE && 
        (item.director.toLowerCase().includes(searchTerm) ||
         item.cast.some(actor => actor.toLowerCase().includes(searchTerm)))) ||
      (item.type === MediaType.TV && 
        (item.creator.toLowerCase().includes(searchTerm) ||
         item.cast.some(actor => actor.toLowerCase().includes(searchTerm))))
    );

    // 应用分页
    const total = filtered.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page: pagination.page,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1
    };
  }

  // 根据ID获取单个媒体
  async getMediaById(id: string): Promise<MediaItem | null> {
    return this.data.find(item => item.id === id) || null;
  }

  // 获取相关推荐
  async getRelatedMedia(id: string, limit: number = 6): Promise<MediaItem[]> {
    const currentItem = await this.getMediaById(id);
    if (!currentItem) return [];

    // 根据类型和年份推荐相似内容
    const related = this.data
      .filter(item => 
        item.id !== id && 
        (item.type === currentItem.type ||
         item.genres.some(genre => currentItem.genres.includes(genre)))
      )
      .sort((a, b) => {
        // 按评分和年份排序
        const scoreA = a.rating + (Math.abs(a.year - currentItem.year) < 5 ? 1 : 0);
        const scoreB = b.rating + (Math.abs(b.year - currentItem.year) < 5 ? 1 : 0);
        return scoreB - scoreA;
      })
      .slice(0, limit);

    return related;
  }

  // 获取统计信息
  async getStats() {
    const movieCount = this.data.filter(item => item.type === MediaType.MOVIE).length;
    const tvCount = this.data.filter(item => item.type === MediaType.TV).length;
    const averageRating = this.data.reduce((sum, item) => sum + item.rating, 0) / this.data.length;
    
    return {
      total: this.data.length,
      movies: movieCount,
      tvShows: tvCount,
      averageRating: Math.round(averageRating * 10) / 10
    };
  }
}

// 创建单例实例
export const mediaService = new MediaService(); 