// 媒体类型枚举
export enum MediaType {
  MOVIE = 'movie',
  TV = 'tv'
}

// 电影/电视剧基础接口
export interface Media {
  id: string;
  title: string;
  description: string;
  poster: string;
  backdrop: string;
  year: number;
  rating: number;
  genres: string[];
  type: MediaType;
  status: 'released' | 'upcoming' | 'ongoing';
  createdAt: Date;
  updatedAt: Date;
}

// 电影扩展接口
export interface Movie extends Media {
  type: MediaType.MOVIE;
  duration: number; // 分钟
  director: string;
  cast: string[];
  boxOffice?: number;
}

// 电视剧扩展接口
export interface TVShow extends Media {
  type: MediaType.TV;
  seasons: number;
  episodes: number;
  creator: string;
  cast: string[];
  network: string;
}

// 联合类型
export type MediaItem = Movie | TVShow;

// 筛选参数
export interface FilterParams {
  type?: MediaType;
  genre?: string;
  year?: number;
  rating?: number;
  status?: string;
  sortBy?: 'year' | 'rating' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// 分页参数
export interface PaginationParams {
  page: number;
  limit: number;
}

// API响应类型
export interface MediaResponse {
  data: MediaItem[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} 