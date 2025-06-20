import { Suspense } from "react";
import { MediaType, FilterParams, MediaStatus } from "@/app/types/media";
import { allGenres } from "@/app/data/mockData";
import Header from "@/app/components/media/Header";
import MediaGrid from "@/app/components/media/MediaGrid";
import LoadingSpinner from "@/app/components/media/LoadingSpinner";
import { Language, translations } from "@/app/i18n";
import { mediaService } from "@/app/services/mediaService";
import MediaClientWrapper from "@/app/components/media/MediaClientWrapper";
import PaginationClientWrapper from "@/app/components/media/PaginationClientWrapper";
import SearchBar from "@/app/components/SearchBar";

interface MediaPageProps {
  params: {
    lang: Language;
  };
  searchParams: {
    page?: string;
    pageSize?: string;
    type?: string;
    genre?: string;
    year?: string;
    rating?: string;
    status?: string;
    sortBy?: string;
    order?: string;
    q?: string;
  };
}

export default async function MediaPage({ params, searchParams }: MediaPageProps) {
  // 获取翻译
  const t = translations[params.lang];
  
  // 解析查询参数
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 12;
  
  // 构建过滤参数
  const filters: FilterParams = {
    type: searchParams.type as MediaType | undefined,
    genre: searchParams.genre,
    year: searchParams.year ? Number(searchParams.year) : undefined,
    rating: searchParams.rating ? Number(searchParams.rating) : undefined,
    status: searchParams.status as MediaStatus | undefined,
    sortBy: (searchParams.sortBy || 'rating') as 'rating' | 'year',
    order: (searchParams.order || 'DESC') as 'ASC' | 'DESC'
  };

  // 获取媒体数据
  const mediaData = searchParams.q
    ? await mediaService.searchMedia(searchParams.q, { page: currentPage, pageSize })
    : await mediaService.getMedia(filters, { page: currentPage, pageSize });

  // 获取可用年份列表
  const getAvailableYears = () => {
    if (!mediaData?.data) return [];
    const years = new Set(mediaData.data.map(item => item.year));
    return Array.from(years).sort((a, b) => b - a);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* 顶部导航 */}
      <Header />

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-8">

        {/* 筛选栏 */}
        <Suspense fallback={<LoadingSpinner />}>
          <MediaClientWrapper
            genres={allGenres}
            resultCount={mediaData?.total || 0}
            availableYears={getAvailableYears()}
            initialFilters={filters}
          />
        </Suspense>

        {/* 内容区域 */}
        <div className="mt-8">
          <Suspense fallback={<LoadingSpinner />}>
            {mediaData && mediaData.data.length > 0 ? (
              <>
                {/* 媒体网格 */}
                <MediaGrid items={mediaData.data} />
                
                {/* 分页组件 */}
                <div className="mt-12">
                  <PaginationClientWrapper
                    currentPage={currentPage}
                    totalItems={mediaData.total}
                    pageSize={pageSize}
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
              </div>
            )}
          </Suspense>
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
                  {mediaData.data.length > 0
                    ? (Math.round((mediaData.data.reduce((sum, item) => sum + item.rating, 0) / mediaData.data.length) * 10) / 10).toFixed(1)
                    : '0.0'
                  }
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