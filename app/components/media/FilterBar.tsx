"use client";

import { MediaType, FilterParams } from "@/app/types/media";
import { FiFilter, FiX } from "react-icons/fi";
import { useState } from "react";
import { useT } from "@/app/contexts/TranslationContext";

interface FilterBarProps {
  filters: FilterParams;
  onFilterChange: (filters: Partial<FilterParams>) => void;
  onClearFilters: () => void;
  genres: string[];
  resultCount: number;
  loading: boolean;
}

export default function FilterBar({
  filters,
  onFilterChange,
  onClearFilters,
  genres,
  resultCount,
  loading
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useT();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  const hasActiveFilters = !!(
    filters.type || 
    filters.genre || 
    filters.year || 
    filters.rating || 
    filters.status
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
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
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <FiX size={16} className="mr-1" />
              {t.media.clearFilters}
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {isExpanded ? t.media.collapseFilters : t.media.expandFilters}
          </button>
        </div>
      </div>

      {/* 筛选选项 */}
      <div className={`grid gap-4 ${isExpanded ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* 媒体类型筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.filters.type}
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => onFilterChange({ type: e.target.value as MediaType || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t.mediaTypes.all}</option>
              <option value={MediaType.MOVIE}>{t.mediaTypes.movie}</option>
              <option value={MediaType.TV}>{t.mediaTypes.tv}</option>
            </select>
          </div>

          {/* 类型筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.filters.genre}
            </label>
            <select
              value={filters.genre || ''}
              onChange={(e) => onFilterChange({ genre: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t.filters.allGenres}</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* 年份筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.filters.year}
            </label>
            <select
              value={filters.year || ''}
              onChange={(e) => onFilterChange({ year: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t.filters.allYears}</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* 评分筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.filters.rating}
            </label>
            <select
              value={filters.rating || ''}
              onChange={(e) => onFilterChange({ rating: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t.filters.minRating}</option>
              <option value="9.0">9.0+</option>
              <option value="8.0">8.0+</option>
              <option value="7.0">7.0+</option>
              <option value="6.0">6.0+</option>
            </select>
          </div>

          {/* 状态筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.filters.status}
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => onFilterChange({ status: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t.filters.allStatus}</option>
              <option value="released">{t.status.released}</option>
              <option value="ongoing">{t.status.ongoing}</option>
              <option value="upcoming">{t.status.upcoming}</option>
            </select>
          </div>

          {/* 排序选项 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.filters.sort}
            </label>
            <div className="flex space-x-1">
              <select
                value={filters.sortBy || 'year'}
                onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="year">{t.sortOptions.year}</option>
                <option value="rating">{t.sortOptions.rating}</option>
                <option value="title">{t.sortOptions.title}</option>
              </select>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => onFilterChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
                className="px-2 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">{t.filters.descending}</option>
                <option value="asc">{t.filters.ascending}</option>
              </select>
            </div>
          </div>
        </div>

        {/* 活跃的筛选标签 */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-300">{t.media.currentFilters}</span>
            {filters.type && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.type === MediaType.MOVIE ? t.mediaTypes.movie : t.mediaTypes.tv}
                <button
                  onClick={() => onFilterChange({ type: undefined })}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <FiX size={12} />
                </button>
              </span>
            )}
            {filters.genre && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {filters.genre}
                <button
                  onClick={() => onFilterChange({ genre: undefined })}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <FiX size={12} />
                </button>
              </span>
            )}
            {filters.year && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {filters.year}{t.filters.year}
                <button
                  onClick={() => onFilterChange({ year: undefined })}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  <FiX size={12} />
                </button>
              </span>
            )}
            {filters.rating && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {filters.rating}+
                <button
                  onClick={() => onFilterChange({ rating: undefined })}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  <FiX size={12} />
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {filters.status === 'released' ? t.status.released : 
                 filters.status === 'ongoing' ? t.status.ongoing : t.status.upcoming}
                <button
                  onClick={() => onFilterChange({ status: undefined })}
                  className="ml-1 text-red-600 hover:text-red-800"
                >
                  <FiX size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 