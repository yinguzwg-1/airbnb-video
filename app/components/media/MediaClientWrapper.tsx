"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { FilterParams, MediaType } from '@/app/types/media';
import FilterBar from './FilterBar';
import { useCallback } from 'react';
import { Language } from '@/app/i18n';

interface MediaClientWrapperProps {
  genres: string[];
  resultCount: number;
  availableYears: number[];
  initialFilters: FilterParams;
  lang: Language;
}

export default function MediaClientWrapper({
  genres,
  resultCount,
  availableYears,
  initialFilters,
  lang,
}: MediaClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (params: Partial<FilterParams>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      
      // 更新或删除参数
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          current.delete(key);
        } else {
          // 将所有值转换为字符串
          current.set(key, String(value));
        }
      });
      
      return current.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (newFilters: Partial<FilterParams>) => {
    const queryString = createQueryString({
      ...newFilters,
      page: 1, // 重置页码
    });
    router.push(`?${queryString}`);
  };

  const handleClearFilters = () => {
    router.push('');
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