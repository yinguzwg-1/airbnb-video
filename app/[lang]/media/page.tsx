import { Suspense } from "react";
import { MediaType, FilterParams, MediaStatus } from "@/app/types/media";
import { allGenres } from "@/app/data/mockData";
import Header from "@/app/components/media/Header";
import { MediaGrid } from "@/app/components/media/MediaGrid";
import { Language, translations } from "@/app/i18n";
import { FilterSection } from "@/app/components/media/FilterSection";
import { PaginationSection } from "@/app/components/media/PaginationSection";
import LoadingSpinner from "@/app/components/media/LoadingSpinner";
import { getMediaData } from "@/app/actions/getMediaData";
import MediaContent from "./MediaContent";

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
  
  // 首次加载时在服务端获取数据
  const initialData = await getMediaData({page: searchParams.page || '1', pageSize: searchParams.pageSize || '12', q: searchParams.q || ''});
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* 顶部导航 */}
      <Header />

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <MediaContent 
            initialData={initialData}
            params={params}
            searchParams={searchParams}
            t={t}
          />
        </Suspense>
      </main>

      {/* 页脚信息 */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">{t.footer.title}</h3>
            <p className="text-gray-400 dark:text-gray-500">{t.footer.subtitle}</p>
          </div>
          
          {initialData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-blue-400 dark:text-blue-300">{initialData.meta.total}</div>
                <div className="text-gray-400 dark:text-gray-500">{t.footer.totalContent}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400 dark:text-green-300">
                  {initialData.items.filter(item => item.type === MediaType.MOVIE).length}
                </div>
                <div className="text-gray-400 dark:text-gray-500">{t.footer.movies}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400 dark:text-purple-300">
                  {initialData.items.filter(item => item.type === MediaType.TV).length}
                </div>
                <div className="text-gray-400 dark:text-gray-500">{t.footer.tvShows}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400 dark:text-yellow-300">
                  {initialData.items.length > 0
                    ? (Math.round((initialData.items.reduce((sum, item) => sum + parseFloat(item.rating.toString()), 0) / initialData.items.length) * 10) / 10).toFixed(1)
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