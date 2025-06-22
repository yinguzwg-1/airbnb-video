"use client";

import { useCallback } from 'react';
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
  const handlePageChange = useCallback((page: number) => {
    if (page === currentPage) return; // 如果页码没有变化，不做任何操作
    onPageChange(page);
  }, [currentPage, onPageChange]);

  const handlePageSizeChange = useCallback((size: number) => {
    if (size === pageSize) return; // 如果页面大小没有变化，不做任何操作
    onPageSizeChange(size);
  }, [pageSize, onPageSizeChange]);

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