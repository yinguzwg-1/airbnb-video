"use client";

import { useState, useEffect, useMemo } from "react";
import { MediaType, FilterParams, MediaStatus } from "@/app/types/media";
import { allGenres } from "@/app/data/mockData";
import { MediaGrid } from "@/app/components/media/MediaGrid";
import { Language } from "@/app/i18n";
import { FilterSection } from "@/app/components/media/FilterSection";
import { PaginationSection } from "@/app/components/media/PaginationSection";
import LoadingSpinner from "@/app/components/media/LoadingSpinner";
import { getMediaData } from "@/app/actions/getMediaData";

interface MediaContentProps {
  initialData: any;
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
  t: any;
}

export default function MediaContent({ initialData, params, searchParams, t }: MediaContentProps) {
  const [loading, setLoading] = useState(false);
  const [mediaData, setMediaData] = useState(initialData);
  const [currentPageState, setCurrentPageState] = useState(Number(searchParams.page) || 1);
  const [pageSizeState, setPageSizeState] = useState(Number(searchParams.pageSize) || 12);
  const isFirstRender = useMemo(() => currentPageState === 1, [currentPageState]);
  
  // 构建过滤参数
  const filters: FilterParams = useMemo(() => ({
    type: searchParams.type as MediaType | undefined,
    genre: searchParams.genre,
    year: searchParams.year ? Number(searchParams.year) : undefined,
    rating: searchParams.rating ? Number(searchParams.rating) : undefined,
    status: searchParams.status as MediaStatus | undefined,
    sortBy: (searchParams.sortBy || 'rating') as 'rating' | 'year',
    order: (searchParams.order || 'DESC') as 'ASC' | 'DESC'
  }), [searchParams]);


  const handlePageChange = async (page: number) => {
    setCurrentPageState(page);
    console.log('page', page);
    const data = await getMediaData({ page: page.toString(), pageSize: pageSizeState.toString(), q: searchParams.q || '' });
    setMediaData(data);
  };

  const handlePageSizeChange = async (size: number) => {
    setPageSizeState(size);
    setCurrentPageState(1);
    const data = await getMediaData({ page: currentPageState.toString(), pageSize: size.toString(), q: searchParams.q || '' });
    setMediaData(data);
  };

  useEffect(() => {
    // 如果是首页，使用服务端数据
    if (isFirstRender) {
      setMediaData(initialData);
      return;
    }
  }, [isFirstRender, initialData]);

  return (
    <>
      {/* 筛选栏 */}
      <FilterSection
        genres={allGenres}
        resultCount={mediaData?.meta?.total || 0}
        availableYears={mediaData?.availableYears || []}
        initialFilters={filters}
        searchQuery={searchParams.q}
        lang={params.lang}
      />

      {/* 内容区域 */}
      <div className="mt-8">
        {loading ? (
          <LoadingSpinner />
        ) : mediaData && mediaData.items.length > 0 ? (
          <>
            {/* 媒体网格 */}
            <MediaGrid items={mediaData.items} lang={params.lang} />

            {/* 分页组件 */}
            <div className="mt-12">
              <PaginationSection
                currentPage={currentPageState}
                totalItems={mediaData.meta.total}
                pageSize={pageSizeState}
                lang={params.lang}
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
          </div>
        )}
      </div>
    </>
  );
} 