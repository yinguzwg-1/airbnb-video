"use client";

import { FilterParams } from '@/app/types/media';
import { FilterBar } from '@/app/components';
import { useCallback, useMemo } from 'react';
import { Language } from '@/app/i18n';
import { useStore } from '@/app/stores';
import { observer } from 'mobx-react-lite';

interface FilterSectionProps {
  resultCount: number;
  initialFilters: FilterParams;
  searchQuery?: string;
  lang: Language;
}

export const FilterSection = observer(({
  resultCount,
  initialFilters,
  searchQuery,
  lang
}: FilterSectionProps) => {
  const { urlStore } = useStore();

  const handleFilterChange = useCallback((newFilters: Partial<FilterParams>) => {
    
    // 构建更新参数
    const updates: Record<string, string | null> = {
      page: '1', // 重置页码
    };

    // 添加筛选参数
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        updates[key] = null; // 删除参数
      } else {
        updates[key] = String(value);
      }
    });

    // 保持搜索查询参数
    if (searchQuery) {
      updates.q = searchQuery;
    }
    
    // 更新URL参数
    urlStore.updateParams(updates);
  }, [urlStore, searchQuery]);

  // 清除筛选参数
  const handleClearFilters = useCallback(() => {
    urlStore.clearFilters();
  }, [urlStore]);

  // 从store获取当前筛选参数
  const currentFilters: FilterParams = useMemo(() => ({
    type: urlStore.getParam('type') as any,
    sortBy: (urlStore.getParam('sortBy') || 'rating') as 'rating' | 'year',
    order: (urlStore.getParam('order') || 'DESC') as 'ASC' | 'DESC'
  }), [urlStore]);

  return (
    <FilterBar
      filters={currentFilters}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
      resultCount={resultCount}
      loading={false}
      lang={lang}
    />
  );
}); 