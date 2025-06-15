import { NextRequest, NextResponse } from "next/server";
import { mediaService } from "@/app/services/mediaService";
import { MediaType, MediaStatus, FilterParams } from "@/app/types/media";

export async function GET(request: NextRequest) {
  console.log('API 路由被调用 - /api/media');
  try {
    const { searchParams } = new URL(request.url);
    console.log('请求参数:', Object.fromEntries(searchParams.entries()));
    
    // 解析筛选参数
    const filters: FilterParams = {};
    
    const type = searchParams.get('type');
    if (type && (type === MediaType.MOVIE || type === MediaType.TV)) {
      filters.type = type;
    }
    
    const genre = searchParams.get('genre');
    if (genre) {
      filters.genre = genre;
    }
    
    const year = searchParams.get('year');
    if (year && !isNaN(parseInt(year))) {
      filters.year = parseInt(year);
    }
    
    const rating = searchParams.get('rating');
    if (rating && !isNaN(parseFloat(rating))) {
      filters.rating = parseFloat(rating);
    }
    
    const status = searchParams.get('status');
    if (status && Object.values(MediaStatus).includes(status as MediaStatus)) {
      filters.status = status as MediaStatus;
    }
    
    const sortBy = searchParams.get('sortBy');
    if (sortBy && ['year', 'rating', 'title'].includes(sortBy)) {
      filters.sortBy = sortBy as any;
    }
    
    const sortOrder = searchParams.get('sortOrder');
    if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
      filters.sortOrder = sortOrder as 'asc' | 'desc';
    }
    
    // 解析分页参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    console.log('处理后的筛选参数:', filters);
    console.log('分页参数:', { page, limit });
    
    // 验证分页参数
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: '无效的分页参数' },
        { status: 400 }
      );
    }
    
    // 获取数据
    console.log('开始调用 mediaService.getMedia');
    const result = await mediaService.getMedia(filters, { page, limit });
    console.log('获取到的数据:', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API 路由错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 