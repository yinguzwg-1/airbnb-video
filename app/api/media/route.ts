import { NextRequest, NextResponse } from "next/server";
import { mediaService } from "@/app/services/mediaService";
import { MediaType, MediaStatus, FilterParams } from "@/app/types/media";

export async function GET(request: NextRequest) {
  console.log('API 路由被调用 - /api/media');
  try {
    const { searchParams } = new URL(request.url);
    console.log('请求参数:', Object.fromEntries(searchParams.entries()));
    
    // 解析查询参数
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 12;
    // const type = searchParams.get('type') as MediaType | undefined;
    // const genre = searchParams.get('genre');
    // const year = searchParams.get('year') ? Number(searchParams.get('year')) : undefined;
    // const rating = searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined;
    // const status = searchParams.get('status') as MediaStatus | undefined;
    // const sortBy = (searchParams.get('sortBy') || 'rating') as 'rating' | 'year';
    // const order = (searchParams.get('order') || 'DESC') as 'ASC' | 'DESC';
    const q = searchParams.get('q');

    
    // 验证分页参数
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: '无效的分页参数' },
        { status: 400 }
      );
    }
    
    // 获取数据
    console.log('开始调用 mediaService.getMedia');
    const data = q
      ? await mediaService.searchMedia(q, { page, pageSize })
      : await mediaService.getMedia({ page, pageSize });
    console.log('获取到的数据:', data);
    
    // 获取可用年份列表
    const availableYears = data?.items 
      ? Array.from(new Set(data.items.map(item => item.year))).sort((a, b) => b - a)
      : [];

    return NextResponse.json({
      ...data,
      availableYears
    });
  } catch (error) {
    console.error('API 路由错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 