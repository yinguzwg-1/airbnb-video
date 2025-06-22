import { mediaService } from '@/app/services/mediaService';
import { MediaType, MediaStatus, FilterParams } from '@/app/types/media';

export async function getMediaData({page, pageSize, q}: {page: string, pageSize: string, q: string}) {
  // 解析查询参数

  
  // 构建过滤参数
  // const filters: FilterParams = {
  //   type: searchParams.type as MediaType | undefined,
  //   genre: searchParams.genre,
  //   year: searchParams.year ? Number(searchParams.year) : undefined,
  //   rating: searchParams.rating ? Number(searchParams.rating) : undefined,
  //   status: searchParams.status as MediaStatus | undefined,
  //   sortBy: (searchParams.sortBy || 'rating') as 'rating' | 'year',
  //   order: (searchParams.order || 'DESC') as 'ASC' | 'DESC'
  // };

  // 获取媒体数据
  const data = q
    ? await mediaService.searchMedia(q, { page: Number(page), pageSize: Number(pageSize) })
    : await mediaService.getMedia({ page: Number(page), pageSize: Number(pageSize)});

  // 获取可用年份列表
  const availableYears = data?.items 
    ? Array.from(new Set(data.items.map(item => item.year))).sort((a, b) => b - a)
    : [];

  return {
    ...data,
    availableYears
  };
} 