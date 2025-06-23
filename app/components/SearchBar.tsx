"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { FiSearch, FiX } from 'react-icons/fi';
import { useT } from '@/app/contexts/TranslationContext';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores';
import { mediaService } from '../services/mediaService';
import { MediaItem } from '../types/media';

interface SearchBarProps {
  initialQuery?: string;
}

const SearchBar = observer(({ initialQuery = '' }: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const { mediaStore } = useStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // 重置页码
      params.set('page', '1');
      return params.toString();
    },
    [searchParams]
  );

  // 更新URL但不触发导航
  const updateUrl = useCallback((queryString: string) => {
    const newUrl = `${pathname}?${queryString}`;
    window.history.pushState({}, '', newUrl);
  }, [pathname]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (mediaStore.isLoading) return;

    const trimmedQuery = query.trim();
    const queryString = createQueryString('q', trimmedQuery);
    
    try { 
      // 更新URL
      updateUrl(queryString);
      // 发起搜索请求
      const res = trimmedQuery ? await mediaService.searchMedia(trimmedQuery): await mediaService.getMedia({ page: 1, pageSize: 12 });
      mediaStore.setMediaList(res.items);
      mediaStore.setTotal(res.meta.total);
      mediaStore.setCurrentPage(1);
      mediaStore.setSearchQuery(trimmedQuery);
    } catch (error) {
      console.error('搜索失败:', error);
    }
  }, [query, createQueryString, updateUrl, mediaStore]);

  const handleClear = useCallback(async () => {
    if (mediaStore.isLoading) return;
    
    setQuery('');
    const queryString = createQueryString('q', '');
    
    try {
      // 更新URL
      updateUrl(queryString);
      console.log('fullData.current', fullData.current);
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
  }, [createQueryString, updateUrl, mediaStore]);

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.media.searchPlaceholder}
        className="w-full px-4 py-2 pl-10 pr-10 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
        disabled={mediaStore.isLoading}
      />
      <FiSearch 
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
          mediaStore.isLoading ? 'text-blue-500 animate-pulse' : 'text-gray-400 dark:text-gray-500'
        }`}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          disabled={mediaStore.isLoading}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
        >
          <FiX />
        </button>
      )}
    </form>
  );
});

export default SearchBar; 