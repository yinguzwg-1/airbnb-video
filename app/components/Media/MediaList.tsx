import React from 'react';
import { useT } from '@/app/contexts/TranslationContext';
import { MediaCard, Pagination } from '@/app/components';
import type { MediaItem } from '@/app/types/media';
import { Language } from '@/app/i18n';

interface MediaListProps {
  media: MediaItem[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  hasFilters: boolean;
  lang: Language;
}

export default function MediaList({
  media,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  hasFilters,
  lang
}: MediaListProps) {
  const t = useT();

  return (
    <div className="space-y-4">
      {/* 结果数量 */}
      {hasFilters && (
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          {t.media.found.replace('{count}', totalItems.toString())}
        </div>
      )}

      {/* 媒体列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>

      {/* 分页 */}
      {totalItems > 0 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            lang={lang}
          />
        </div>
      )}
    </div>
  );
}; 