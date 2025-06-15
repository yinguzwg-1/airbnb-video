"use client";

import { useState, useEffect } from "react";
import { MediaItem, MediaType, FilterParams, MediaResponse } from "@/app/types/media";
import { mediaService } from "@/app/services/mediaService";
import Header from "@/app/components/media/Header";
import FilterBar from "@/app/components/media/FilterBar";
import MediaGrid from "@/app/components/media/MediaGrid";
import Pagination from "@/app/components/media/Pagination";
import LoadingSpinner from "@/app/components/media/LoadingSpinner";
import { useT } from "@/app/contexts/TranslationContext";

export default function MediaPage() {
  const [mediaData, setMediaData] = useState<MediaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useT();
  
  // 筛选和分页状态
  const [filters, setFilters] = useState<FilterParams>({
    sortBy: 'rating',
    order: 'DESC'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // 获取媒体数据
  const fetchMediaData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mediaService.getMedia(filters, {
        page: Number(currentPage),
        pageSize: Number(pageSize)
      });
      
      setMediaData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
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

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 处理每页数量变化
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // 清除筛选
  const handleClearFilters = () => {
    setFilters({
      sortBy: 'rating',
      order: 'DESC'
    });
    setCurrentPage(1);
  };

  // 获取可用年份列表
  const getAvailableYears = () => {
    if (!mediaData?.data) return [];
    const years = new Set(mediaData.data.map(item => item.year));
    return Array.from(years).sort((a, b) => b - a); // 降序排列
  };

  // 监听筛选和分页变化
  useEffect(() => {
    fetchMediaData();
  }, [filters, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* 顶部导航 */}
      <Header />

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-8">
        {/* 筛选栏 */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          resultCount={mediaData?.total || 0}
          loading={loading}
          genres={mediaData?.data.map(item => item.genres).flat() || []}
          availableYears={getAvailableYears()}
        />

        {/* 内容区域 */}
        <div className="mt-8">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 dark:text-red-400 text-lg mb-2">❌ {error}</div>
              <button
                onClick={fetchMediaData}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                {t.common.retry}
              </button>
            </div>
          ) : mediaData && mediaData.data.length > 0 ? (
            <>
              {/* 媒体网格 */}
              <MediaGrid items={mediaData.data} />
              
              {/* 分页组件 */}
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalItems={mediaData.total}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </>
          ) : (
            // 无结果提示
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎬</div>
              <div className="text-gray-500 dark:text-gray-400 text-xl mb-2">{t.noResults.title}</div>
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                {t.noResults.filterMessage}
              </div>
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                {t.noResults.clearButton}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 页脚信息 */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">{t.footer.title}</h3>
            <p className="text-gray-400 dark:text-gray-500">{t.footer.subtitle}</p>
          </div>
          
          {mediaData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-blue-400 dark:text-blue-300">{mediaData.total}</div>
                <div className="text-gray-400 dark:text-gray-500">{t.footer.totalContent}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400 dark:text-green-300">
                  {mediaData.data.filter(item => item.type === MediaType.MOVIE).length}
                </div>
                <div className="text-gray-400 dark:text-gray-500">{t.footer.movies}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400 dark:text-purple-300">
                  {mediaData.data.filter(item => item.type === MediaType.TV).length}
                </div>
                <div className="text-gray-400 dark:text-gray-500">{t.footer.tvShows}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400 dark:text-yellow-300">
                  {Math.round((mediaData.data.reduce((sum, item) => sum + item.rating, 0) / mediaData.data.length) * 10) / 10}
                </div>
                <div className="text-gray-400 dark:text-gray-500">{t.footer.averageRating}</div>
              </div>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-700 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-sm">
            {t.footer.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
} 