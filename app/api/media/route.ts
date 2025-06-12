import { NextRequest, NextResponse } from "next/server";
import { mediaService } from "@/app/services/mediaService";
import { MediaType, FilterParams } from "@/app/types/media";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
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
    if (status) {
      filters.status = status;
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
    
    // 验证分页参数
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: '无效的分页参数' },
        { status: 400 }
      );
    }
    
    // 获取数据
    const result = await mediaService.getMedia(filters, { page, limit });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('获取媒体数据失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 