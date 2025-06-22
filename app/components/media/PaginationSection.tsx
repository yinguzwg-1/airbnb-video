"use client";

import { useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Pagination from './Pagination';
import { Language } from '@/app/i18n';

interface PaginationSectionProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  lang: Language;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function PaginationSection({
  currentPage,
  totalItems,
  pageSize,
  lang,
  onPageChange,
  onPageSizeChange
}: PaginationSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (name === 'page' && value === '1') {
        params.delete('page');
      } else {
        params.set(name, value);
      }
      
      if (name === 'pageSize' && value === '12') {
        params.delete('pageSize');
      } else {
        params.set(name, value);
      }
      
      return params.toString();
    },
    [searchParams]
  );

  const handlePageChange = useCallback((page: number) => {
    if (page === currentPage) return;
    
    const queryString = createQueryString('page', String(page));
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    // 使用 history.pushState 来更新 URL，而不是使用 router
    window.history.pushState({}, '', newUrl);
    
    onPageChange(page);
  }, [currentPage, pathname, createQueryString, onPageChange]);

  const handlePageSizeChange = useCallback((size: number) => {
    if (size === pageSize) return;
    
    const queryString = createQueryString('pageSize', String(size));
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    // 使用 history.pushState 来更新 URL，而不是使用 router
    window.history.pushState({}, '', newUrl);
    
    onPageSizeChange(size);
  }, [pageSize, pathname, createQueryString, onPageSizeChange]);

  return (
    <Pagination
      currentPage={currentPage}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      lang={lang}
    />
  );
} 