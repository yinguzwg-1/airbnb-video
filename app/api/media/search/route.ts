import { NextRequest, NextResponse } from "next/server";
import { mediaService } from "@/app/services/mediaService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 获取搜索查询
    const query = searchParams.get('q');
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: '搜索关键词不能为空' },
        { status: 400 }
      );
    }
    
    // 检查查询长度
    if (query.length > 100) {
      return NextResponse.json(
        { error: '搜索关键词过长' },
        { status: 400 }
      );
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
    
    // 执行搜索
    const result = await mediaService.searchMedia(query.trim(), { page, limit });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('搜索媒体失败:', error);
    return NextResponse.json(
      { error: '搜索服务暂时不可用' },
      { status: 500 }
    );
  }
} 