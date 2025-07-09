"use client";

import React from 'react';
import { FilterParams } from "@/app/types/media";
import { FiFilter } from "react-icons/fi";
import { useState } from "react";
import { translations, Language } from "@/app/i18n";


interface FilterBarProps {
  filters: FilterParams;
  onFilterChange: (newFilters: Partial<FilterParams>) => void;
  onClearFilters: () => void;
  resultCount: number;
  loading: boolean;
  lang: Language;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  resultCount,
  loading,
  lang
}) => {
  const t = translations[lang];
  const [sortBy, setSortBy] = useState(filters.sortBy || 'rating');
  const [order, setOrder] = useState(filters.order || 'DESC');
  const hasActiveFilters = !!(
    filters.type || 
    filters.status || 
    filters.year || 
    filters.status
  );

  const handleSortByChange = (newSortBy: 'rating' | 'year') => {
    window.tracker?.track('filter_sort_by_change', {
      old_sort_by: sortBy,
      new_sort_by: newSortBy,
      current_order: order,
      result_count: resultCount,
      page_url: window.location.href,
    });
    setSortBy(newSortBy);
    onFilterChange({ sortBy: newSortBy });
  };

  const handleOrderChange = (newOrder: 'ASC' | 'DESC') => {
    window.tracker?.track('filter_order_change', {
      sort_by: sortBy,
      old_order: order,
      new_order: newOrder,
      result_count: resultCount,
      page_url: window.location.href,
    });
    setOrder(newOrder);
    onFilterChange({ order: newOrder });
  };

  const handleClearFilters = () => {
    window.tracker?.track('filter_clear', {
      current_filters: filters,
      result_count: resultCount,
      page_url: window.location.href,
    });
    onClearFilters();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4">
      {/* 顶部信息栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center space-x-4 mb-2 sm:mb-0">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <FiFilter className="mr-2" />
            {t.media.filterTitle}
          </h2>
          {loading ? (
            <span className="text-sm text-gray-500 dark:text-gray-400">{t.media.searching}</span>
          ) : (
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {t.media.found} <span className="font-semibold text-blue-600 dark:text-blue-400">{resultCount}</span> {t.common.results}
            </span>
          )}
        </div>
        
        {/* <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <FiX size={16} className="mr-1" />
              {t.media.clearFilters}
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {isExpanded ? t.media.collapseFilters : t.media.expandFilters}
          </button>
        </div> */}
      </div>

      {/* 筛选选项 */}
      <div className={`space-y-4`}>
        <div className="flex flex-wrap items-center gap-4">
          {/* 类型筛选 */}
          {/* <select
            value={filters.type || ''}
            onChange={(e) => onFilterChange({ type: e.target.value as MediaType || undefined })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 min-w-[120px]"
          >
            <option value="">{t.filters.all}</option>
            <option value={MediaType.MOVIE}>{t.mediaTypes.movie}</option>
            <option value={MediaType.TV}>{t.mediaTypes.tv}</option>
          </select> */}

         

          {/* 状态筛选 */}
          {/* <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ status: e.target.value as MediaStatus || undefined })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 min-w-[120px]"
          >
            <option value="">{t.filters.allStatus}</option>
            <option value={MediaStatus.RELEASED}>{t.status.released}</option>
            <option value={MediaStatus.UPCOMING}>{t.status.upcoming}</option>
            <option value={MediaStatus.ONGOING}>{t.status.ongoing}</option>
          </select> */}

          {/* 排序方式 */}
          <select
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value as 'rating' | 'year')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 min-w-[120px]"
          >
            <option value="rating">{t.sortOptions.rating}</option>
            <option value="year">{t.sortOptions.year}</option>
          </select>

          {/* 排序顺序 */}
          <select
            value={order}
            onChange={(e) => handleOrderChange(e.target.value as 'ASC' | 'DESC')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 min-w-[100px]"
          >
            <option value="DESC">{t.filters.descending}</option>
            <option value="ASC">{t.filters.ascending}</option>
          </select>
          <button 
            onClick={handleClearFilters} 
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 min-w-[100px]"
          >
            {t.filters.clear}
          </button>
        </div>

      </div>
    </div>
  );
};

export default FilterBar; 