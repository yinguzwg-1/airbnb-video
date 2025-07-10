"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useT } from '@/app/contexts/TranslationContext';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/app/stores';
import { mediaService } from '@/app/services/mediaService';
import { MediaItem } from '@/app/types/media';

interface SearchBarProps {
  initialQuery?: string;
}

const SearchBar = observer(({ initialQuery = '' }: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const { mediaStore, urlStore } = useStore();
  const t = useT();
  
  // 存储首页数据的引用
  const fullData = useRef<MediaItem[]>([]);
  const fullTotal = useRef(0);
  const isInitialized = useRef(false);

  // 初始化首页数据
  const initializeFullData = useCallback(() => {
    if (!isInitialized.current && mediaStore.mediaList.length > 0) {
      fullData.current = [...mediaStore.mediaList];
      fullTotal.current = mediaStore.total;
      isInitialized.current = true;
    }
  }, [mediaStore.mediaList, mediaStore.total]);

  // 在组件挂载时初始化数据
  useEffect(() => {
    initializeFullData();
  }, [initializeFullData]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (mediaStore.isLoading) return;

    const trimmedQuery = query.trim();
    
    // 添加搜索埋点
    window.tracker?.track('search_submit', {
      search_query: trimmedQuery,
      search_type: 'media',
      current_page: mediaStore.currentPage,
      total_items: mediaStore.total,
      page_url: window.location.href,
    });
    
    try { 
      // 更新URL参数
      urlStore.updateParams({ 
        q: trimmedQuery || null,
        page: '1' // 重置页码
      });
      
      // 发起搜索请求
      const res = await mediaService.getMedia({ page: 1, pageSize: 12, search: trimmedQuery});
      mediaStore.setMediaList(res.items);
      mediaStore.setTotal(res.meta.total);
      mediaStore.setCurrentPage(1);
      mediaStore.setSearchQuery(trimmedQuery);
    } catch (error) {
      console.error('搜索失败:', error);
    }
  }, [query, urlStore, mediaStore]);

  const handleClear = useCallback(async () => {
    if (mediaStore.isLoading) return;
    
    // 添加清除搜索埋点
    window.tracker?.track('search_clear', {
      previous_query: query,
      current_page: mediaStore.currentPage,
      total_items: mediaStore.total,
      page_url: window.location.href,
    });
    
    setQuery('');
    
    try {
      // 更新URL参数
      urlStore.updateParams({ 
        q: null,
        page: '1'
      });
      
      // 直接重置回首页数据，不发送网络请求
      if (fullData.current && fullData.current.length > 0) {
        mediaStore.setMediaList(fullData.current);
        mediaStore.setTotal(fullTotal.current);
      } else {
        // 如果没有缓存数据，重置为空状态
        mediaStore.setMediaList([]);
        mediaStore.setTotal(0);
      }
      
      mediaStore.setCurrentPage(1);
      mediaStore.setSearchQuery('');
      mediaStore.setLoading(false);
    } catch (error) {
      console.error('清除搜索失败:', error);
    }
  }, [urlStore, mediaStore, query]);

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.media.searchPlaceholder}
        className="w-full px-3 md:px-4 py-2 md:py-2.5 pl-9 md:pl-10 pr-9 md:pr-10 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors text-sm md:text-base font-size-16"
        disabled={mediaStore.isLoading}
      />
      <FiSearch 
        className={`absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 ${
          mediaStore.isLoading ? 'text-blue-500 animate-pulse' : 'text-gray-400 dark:text-gray-500'
        }`}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          disabled={mediaStore.isLoading}
          className="absolute right-2.5 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <FiX className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      )}
    </form>
  );
});

export default SearchBar; 