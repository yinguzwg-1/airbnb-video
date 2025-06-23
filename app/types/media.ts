// 媒体类型枚举
export enum MediaType {
  MOVIE = 'movie',
  TV = 'tv'
}

export enum MediaStatus {
  RELEASED = 'released',
  ONGOING = 'ongoing',
  UPCOMING = 'upcoming'
}

// 电影/电视剧基础接口
export interface BaseMediaItem {
  id: string;
  title: string;
  description: string;
  poster: string;
  backdrop: string;
  year: number;
  rating: number;
  genres: string[];
  status: MediaStatus;
  type: MediaType;
  cast: string[];
  createdAt: string;
  updatedAt: string;
  title_en: string;
}

// 电影扩展接口
export interface Movie extends BaseMediaItem {
  type: MediaType.MOVIE;
  duration?: number;
  director?: string;
  boxOffice?: number;
}

// 电视剧扩展接口
export interface TVShow extends BaseMediaItem {
  type: MediaType.TV;
  seasons?: number;
  episodes?: number;
  creator?: string;
  network?: string;
}

// 联合类型
export type MediaItem = Movie | TVShow;

// 筛选参数接口
export interface FilterParams {
  type?: MediaType;
  genre?: string;
  year?: number;
  rating?: number;
  status?: MediaStatus;
  sortBy?: 'rating' | 'year' | null;
  order?: 'ASC' | 'DESC' | null;
  page?: number;
  pageSize?: number;
  search?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// API响应类型
export interface MediaResponse {
  items: MediaItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
} 