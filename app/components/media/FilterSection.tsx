"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { FilterParams } from '@/app/types/media';
import FilterBar from './FilterBar';
import { useCallback } from 'react';
import { Language } from '@/app/i18n';

interface FilterSectionProps {
  genres: string[];
  resultCount: number;
  initialFilters: FilterParams;
  searchQuery?: string;
  lang: Language;
}

export function FilterSection({
  genres,
  resultCount,
  initialFilters,
  searchQuery,
  lang
}: FilterSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (params: Partial<FilterParams>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      
      // 保持搜索查询参数
      if (searchQuery) {
        current.set('q', searchQuery);
      }
      
      // 更新或删除参数
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });
      
      return current.toString();
    },
    [searchParams, searchQuery]
  );

  const handleFilterChange = (newFilters: Partial<FilterParams>) => {
    const queryString = createQueryString({
      ...newFilters,
      page: 1, // 重置页码
    });
    router.push(`?${queryString}`);
  };

  const handleClearFilters = () => {
    // 如果有搜索查询，保留搜索查询
    if (searchQuery) {
      router.push(`?q=${searchQuery}`);
    } else {
      router.push('');
    }
  };

  return (
    <FilterBar
      filters={initialFilters}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
      genres={genres}
      resultCount={resultCount}
      loading={false}
      lang={lang}
    />
  );
} 