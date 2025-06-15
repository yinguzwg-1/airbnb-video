import { MediaItem, Movie, TVShow, MediaType } from '@/app/types/media';

// 只保留类型定义，mock数据全部清空
export const mockMovies: Movie[] = [];
export const mockTVShows: TVShow[] = [];
export const mockData: MediaItem[] = [];
export const allGenres: string[] = [];
export const yearRange = { min: 0, max: 0 }; 