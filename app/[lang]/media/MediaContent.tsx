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
import { useStore } from "@/app/stores";
import { observer } from "mobx-react-lite";

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

export default observer(function MediaContent({ initialData, params, searchParams, t }: MediaContentProps) {
  const { mediaStore } = useStore();
  const { mediaList, total } = mediaStore;
  const [currentPageState, setCurrentPageState] = useState(Number(searchParams.page) || 1);
  const [pageSizeState, setPageSizeState] = useState(Number(searchParams.pageSize) || 12);

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
    const data = await getMediaData({ page: page.toString(), pageSize: pageSizeState.toString(), q: searchParams.q || '' });
    mediaStore.setMediaList(data.items);
  };

  const handlePageSizeChange = async (size: number) => {
    setPageSizeState(size);
    setCurrentPageState(1);
    const data = await getMediaData({ page: currentPageState.toString(), pageSize: size.toString(), q: searchParams.q || '' });
    mediaStore.setMediaList(data.items);
  };
  useEffect(() => {
    mediaStore.setMediaList(initialData.items);
    mediaStore.setTotal(initialData.meta.total);
  }, [initialData]);
  return (
    <>
      {/* 筛选栏 */}
      <FilterSection
        genres={allGenres}
        resultCount={total || 0}
        initialFilters={filters}
        searchQuery={searchParams.q}
        lang={params.lang}
      />

      {/* 内容区域 */}
      <div className="mt-8">
        {mediaList && mediaList.length > 0 ? (
          <>
            {/* 媒体网格 */}
            <MediaGrid items={mediaList} lang={params.lang} />

            {/* 分页组件 */}
            <div className="mt-12">
              <PaginationSection
                currentPage={currentPageState}
                totalItems={total}
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
}); 