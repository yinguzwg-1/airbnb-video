"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MediaType, FilterParams } from "@/app/types/media";
import { Language } from "@/app/i18n";
import { FilterSection, MediaGrid, PaginationSection, LoadingSpinner } from "@/app/components";
import { getMediaData } from "@/app/actions/getMediaData";
import { useStore } from "@/app/stores";
import { observer } from "mobx-react-lite";
import { useTracker } from "@/app/hooks/useTracker";

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
  const { mediaStore, urlStore } = useStore();
  const { mediaList, total } = mediaStore;
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const tracker = useTracker();

  // 构建过滤参数
  const filters: FilterParams = useMemo(() => ({
    type: urlStore.getParam('type') as MediaType | undefined,
    sortBy: (urlStore.getParam('sortBy') || 'rating') as 'rating' | 'year',
    order: (urlStore.getParam('order') || 'DESC') as 'ASC' | 'DESC'
  }), [urlStore]);

  // 统一的获取数据函数
  const fetchData = useCallback(async (params: Record<string, string>) => {
    setIsLoading(true);
    try {
      const data = await getMediaData({ 
        page: params.page || '1', 
        pageSize: params.pageSize || '12', 
        q: params.q || '',
        sortBy: params.sortBy || '',
        order: params.order || ''
      });
      mediaStore.setMediaList(data.items);
      mediaStore.setTotal(data.meta.total);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [mediaStore]);

  // 初始化数据
  useEffect(() => {
    if (initialData && initialData.items && !isInitialized) {
      mediaStore.setMediaList(initialData.items);
      mediaStore.setTotal(initialData.meta.total);
      setIsInitialized(true);
    }
  }, [initialData, mediaStore, isInitialized]);

  // 监听URL状态变化并重新获取数据
  useEffect(() => {
    if (!isInitialized) return;
    
    const handleUrlChange = () => {
      const urlState = urlStore.getAllParams();
      fetchData(urlState);
    };

    // 监听URL变化事件
    window.addEventListener('urlStateChanged', handleUrlChange);

    // 初始检查
    const urlState = urlStore.getAllParams();
    const hasUrlParams = Object.keys(urlState).length > 0;
    if (hasUrlParams) {
      fetchData(urlState);
    }

    return () => {
      window.removeEventListener('urlStateChanged', handleUrlChange);
    };
  }, [isInitialized, urlStore, fetchData]);

  // 分页处理函数
  const handlePageChange = useCallback((page: number) => {
    urlStore.updateParams({ page: page.toString() });
  }, [urlStore]);

  const handlePageSizeChange = useCallback((size: number) => {
    urlStore.updateParams({ 
      pageSize: size.toString(),
      page: '1' // 重置到第一页
    });
  }, [urlStore]);

  return (
    <>
      {/* 筛选栏 */}
      <FilterSection
        resultCount={total || 0}
        initialFilters={filters}
        searchQuery={urlStore.getParam('q')}
        lang={params.lang}
      />

      {/* 内容区域 */}
      <div className="mt-6 md:mt-8">
        {isLoading ? (
          <LoadingSpinner />
        ) : mediaList && mediaList.length > 0 ? (
          <>
            {/* 媒体网格 */}
            <MediaGrid items={mediaList} lang={params.lang} />

            {/* 分页组件 */}
            <div className="mt-8 md:mt-12">
              <PaginationSection
                currentPage={Number(urlStore.getParam('page')) || 1}
                totalItems={total}
                pageSize={Number(urlStore.getParam('pageSize')) || 12}
                lang={params.lang}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </>
        ) : (
          // 无结果提示
          <div className="text-center py-8 md:py-12">
            <div className="text-4xl md:text-6xl mb-4">🎬</div>
            <div className="text-gray-500 dark:text-gray-400 text-lg md:text-xl mb-2">{t.noResults.title}</div>
            <div className="text-gray-500 dark:text-gray-500 mb-4 text-responsive">
              {t.noResults.filterMessage}
            </div>
          </div>
        )}
      </div>
    </>
  );
}); 