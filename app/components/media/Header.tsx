"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useT } from "@/app/contexts/TranslationContext";
import LanguageSwitcher from "../LanguageSwitcher";
import ThemeSwitcher from "../ThemeSwitcher";
import SearchBar from '../SearchBar';
import { useSearchParams, useRouter } from 'next/navigation';
import { ComponentLoading } from '../LoadingSpinner';
import { config as configApi } from '@/app/config';

// 内部组件，处理 useSearchParams
function HeaderInner() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const t = useT();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const lastCrawledPage = localStorage.getItem('lastCrawledPage');
    if (lastCrawledPage) {
      setCurrentPage(Number(lastCrawledPage));
    }
  }, []);

  
  const refreshList = () => {
    // 刷新当前页面
    router.refresh();
  };

  const handleCrawl = async () => {
    window.tracker?.track('crawl_click',{
      page: currentPage,
    });
    try {
      setIsCrawling(true);
      const response = await fetch(`${configApi.NEXT_PUBLIC_LOCAL_HOST}/crawler/movies?page=${currentPage}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('爬取失败');
      }

      const data = await response.json();
      // 保存当前页码到localStorage
      localStorage.setItem('lastCrawledPage', (Number(currentPage) + 1).toString());
      // 更新下一页的页码
      setCurrentPage(Number(currentPage) + 1);
      alert(`爬取成功：第 ${currentPage} 页, ${data.message}`);
      
      // 爬取成功后刷新列表
      refreshList();
    } catch (error: any) {
      console.error('爬取错误:', error);
      alert('爬取失败：' + (error.message || '未知错误'));
    } finally {
      setIsCrawling(false);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎬</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {t.home.title}
            </span>
          </Link>

          {/* 搜索框 */}
          <div className="flex-1 max-w-2xl mx-8">
            <SearchBar initialQuery={searchParams.get('q') || ''} />
          </div>

       

          {/* 功能按钮组 */}
          <div className="flex items-center space-x-6 mx-8">
            
            {/* 爬取按钮 */}
            <button
              onClick={handleCrawl}
              disabled={isCrawling}
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                isCrawling
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              }`}
            >
              {isCrawling ? '爬取中...' : `爬取第 ${currentPage} 页`}
            </button>

            {/* 主题和语言切换 */}
            <div className="flex items-center space-x-3">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </div>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* 移动端导航菜单 */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/media" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {t.nav.movies}
              </Link>
              <Link 
                href="/media?type=movie" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {t.mediaTypes.movie}
              </Link>
              <Link 
                href="/media?type=tv" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {t.mediaTypes.tv}
              </Link>

              {/* 移动端爬取按钮 */}
              <button
                onClick={handleCrawl}
                disabled={isCrawling}
                className={`w-full px-4 py-2 rounded-lg text-white transition-colors ${
                  isCrawling
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isCrawling ? '爬取中...' : `爬取第 ${currentPage} 页`}
              </button>
              
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <ThemeSwitcher />
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// 包装组件，提供 Suspense 边界
const Header = () => {
  return (
    <Suspense fallback={<ComponentLoading />}>
      <HeaderInner />
    </Suspense>
  );
};

export default Header; 