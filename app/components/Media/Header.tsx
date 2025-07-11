"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useT } from "@/app/contexts/TranslationContext";
import { LanguageSwitcher, ThemeSwitcher, SearchBar, ComponentLoading } from "@/app/components";
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { config as configApi } from '@/app/config';

// 内部组件，处理 useSearchParams
function HeaderInner() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const t = useT();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const currentLang = params?.lang as string || 'zh';

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

  // const handleCrawl = async () => {
  //   window.tracker?.track('crawl_click',{
  //     page: currentPage,
  //   });
  //   try {
  //     setIsCrawling(true);
  //     const response = await fetch(`${configApi.NEXT_PUBLIC_API_URL}/crawler/movies?page=${currentPage}`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       credentials: 'include',
  //     });
      
  //     if (!response.ok) {
  //       throw new Error('爬取失败');
  //     }

  //     const data = await response.json();
  //     // 保存当前页码到localStorage
  //     localStorage.setItem('lastCrawledPage', (Number(currentPage) + 1).toString());
  //     // 更新下一页的页码
  //     setCurrentPage(Number(currentPage) + 1);
  //     alert(`爬取成功：第 ${currentPage} 页, ${data.message}`);
      
  //     // 爬取成功后刷新列表
  //     refreshList();
  //   } catch (error: any) {
  //     console.error('爬取错误:', error);
  //     alert('爬取失败：' + (error.message || '未知错误'));
  //   } finally {
  //     setIsCrawling(false);
  //   }
  // };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 transition-colors duration-200">
      <div className="container mx-auto px-responsive">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href={`/${currentLang}`} className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-xl md:text-2xl">🎬</span>
            <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white text-nowrap">
              {t.home.title}
            </span>
          </Link>

          {/* 搜索框 */}
          <div className="flex-1 max-w-lg md:max-w-2xl mx-3 md:mx-8 hidden sm:block">
            <SearchBar initialQuery={searchParams.get('q') || ''} />
          </div>

       

          {/* 功能按钮组 */}
          <div className="flex items-center space-x-3 md:space-x-6 mx-3 md:mx-8">
            
            {/* 爬取按钮 */}
            {/* <button
              onClick={handleCrawl}
              disabled={isCrawling}
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                isCrawling
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              }`}
            >
              {isCrawling ? '爬取中...' : `爬取第 ${currentPage} 页`}
            </button> */}

            {/* 主题和语言切换 */}
            <div className="flex items-center space-x-2 md:space-x-3">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </div>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* 移动端搜索框 */}
        <div className="sm:hidden pb-3">
          <SearchBar initialQuery={searchParams.get('q') || ''} />
        </div>

        {/* 移动端导航菜单 */}
        {isMenuOpen && (
          <div className="sm:hidden pb-4 border-t border-gray-200 dark:border-gray-700 pt-3">
            <nav className="flex flex-col space-y-3">
              <Link 
                href={`/${currentLang}/media`} 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t.nav.movies}
              </Link>
              <Link 
                href={`/${currentLang}/media?type=movie`} 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t.mediaTypes.movie}
              </Link>
              <Link 
                href={`/${currentLang}/media?type=tv`} 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t.mediaTypes.tv}
              </Link>

              {/* 移动端爬取按钮 */}
              {/* <button
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
               */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3 px-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">主题</span>
                  <ThemeSwitcher />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">语言</span>
                  <LanguageSwitcher />
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// 包装组件，提供 Suspense 边界
export default function Header() {
  return (
    <Suspense fallback={<ComponentLoading />}>
      <HeaderInner />
    </Suspense>
  );
};
