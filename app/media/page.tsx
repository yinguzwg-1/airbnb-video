"use client";

import { useState, useEffect } from "react";
import { MediaItem, MediaType, FilterParams, MediaResponse } from "@/app/types/media";
import { allGenres } from "@/app/data/mockData";
import Header from "@/app/components/media/Header";
import FilterBar from "@/app/components/media/FilterBar";
import MediaGrid from "@/app/components/media/MediaGrid";
import Pagination from "@/app/components/media/Pagination";
import LoadingSpinner from "@/app/components/media/LoadingSpinner";

export default function MediaPage() {
  const [mediaData, setMediaData] = useState<MediaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 筛选和分页状态
  const [filters, setFilters] = useState<FilterParams>({
    sortBy: 'year',
    sortOrder: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // 获取媒体数据
  const fetchMediaData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      // 添加筛选参数
      if (filters.type) params.append('type', filters.type);
      if (filters.genre) params.append('genre', filters.genre);
      if (filters.year) params.append('year', filters.year.toString());
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      // 添加分页参数
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const url = searchQuery 
        ? `/api/media/search?q=${encodeURIComponent(searchQuery)}&${params.toString()}`
        : `/api/media?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('获取数据失败');
      }

      const data: MediaResponse = await response.json();
      setMediaData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
      console.error('获取媒体数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 处理筛选变化
  const handleFilterChange = (newFilters: Partial<FilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // 重置到第一页
  };

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 清除筛选
  const handleClearFilters = () => {
    setFilters({
      sortBy: 'year',
      sortOrder: 'desc'
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  // 监听筛选和分页变化
  useEffect(() => {
    fetchMediaData();
  }, [filters, currentPage, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <Header 
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-8">
        {/* 筛选栏 */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          genres={allGenres}
          resultCount={mediaData?.total || 0}
          loading={loading}
        />

        {/* 内容区域 */}
        <div className="mt-8">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-lg mb-2">❌ {error}</div>
              <button
                onClick={fetchMediaData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                重试
              </button>
            </div>
          ) : mediaData && mediaData.data.length > 0 ? (
            <>
              {/* 媒体网格 */}
              <MediaGrid items={mediaData.data} />
              
              {/* 分页组件 */}
              {mediaData.totalPages > 1 && (
                <div className="mt-12">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={mediaData.totalPages}
                    onPageChange={handlePageChange}
                    hasNext={mediaData.hasNext}
                    hasPrev={mediaData.hasPrev}
                  />
                </div>
              )}
            </>
          ) : (
            // 无结果提示
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎬</div>
              <div className="text-gray-500 text-xl mb-2">没有找到相关内容</div>
              <div className="text-gray-400 mb-4">
                {searchQuery ? (
                  <>没有找到包含 "{searchQuery}" 的内容</>
                ) : (
                  <>当前筛选条件下没有结果</>
                )}
              </div>
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                清除所有筛选
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 页脚信息 */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">🎬 电影电视剧网站</h3>
            <p className="text-gray-400">发现精彩内容，享受观影时光</p>
          </div>
          
          {mediaData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-blue-400">{mediaData.total}</div>
                <div className="text-gray-400">总内容数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {mediaData.data.filter(item => item.type === MediaType.MOVIE).length}
                </div>
                <div className="text-gray-400">电影</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {mediaData.data.filter(item => item.type === MediaType.TV).length}
                </div>
                <div className="text-gray-400">电视剧</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.round((mediaData.data.reduce((sum, item) => sum + item.rating, 0) / mediaData.data.length) * 10) / 10}
                </div>
                <div className="text-gray-400">平均评分</div>
              </div>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-700 text-gray-400 text-sm">
            © 2024 电影电视剧网站. 数据仅供展示使用.
          </div>
        </div>
      </footer>
    </div>
  );
} 