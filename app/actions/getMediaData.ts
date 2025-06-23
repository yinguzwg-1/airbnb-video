import { mediaService } from '@/app/services/mediaService';

export async function getMediaData({page, pageSize, q, sortBy, order}: {page: string, pageSize: string, q: string, sortBy: string, order: string}) {

  // 获取媒体数据
  const data = await mediaService.getMedia({ page: Number(page), pageSize: Number(pageSize), search: q, sortBy: sortBy, order: order});
  // 获取可用年份列表
  const availableYears = data?.items 
    ? Array.from(new Set(data.items.map(item => item.year))).sort((a, b) => b - a)
    : [];

  return {
    ...data,
    availableYears
  };
} 