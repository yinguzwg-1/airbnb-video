"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useT } from "@/app/contexts/TranslationContext";
import { CircularLanguageSwitcher, CircularThemeSwitcher, SearchBar, ComponentLoading } from "@/app/components";
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { config as configApi } from '@/app/config';
import TopBar from '../Common/TopBar';
import { Language } from '@/app/i18n';

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




  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg sticky w-full top-0 z-50 transition-colors duration-200">
      <TopBar lang={currentLang as Language} title={t.media.title} >
        <div className="flex-1 max-w-lg md:max-w-2xl mx-3 md:mx-8 hidden sm:block">
          <SearchBar initialQuery={searchParams.get('q') || ''} />
        </div>
      </TopBar><div className="flex items-center space-x-3 md:space-x-6 mx-3 md:mx-8">

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
