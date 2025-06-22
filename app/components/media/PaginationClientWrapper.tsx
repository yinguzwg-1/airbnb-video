"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from './Pagination';
import { useCallback } from 'react';
import { Language } from '@/app/i18n';

interface PaginationClientWrapperProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  lang: Language;
}

export default function PaginationClientWrapper({
  currentPage,
  totalItems,
  pageSize,
  lang,
}: PaginationClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set(name, value);
      return current.toString();
    },
    [searchParams]
  );

  const handlePageChange = (page: number) => {
    const queryString = createQueryString('page', String(page));
    router.push(`?${queryString}`);
  };

  const handlePageSizeChange = (size: number) => {
    const queryString = createQueryString('pageSize', String(size));
    router.push(`?${queryString}`);
  };

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