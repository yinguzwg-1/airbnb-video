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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 flex items-center">
      {/* 顶部信息栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
    
      </div>

      {/* 筛选选项 */}
      <div className={`space-y-4`}>
        <div className="flex flex-wrap items-center gap-4">
  

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