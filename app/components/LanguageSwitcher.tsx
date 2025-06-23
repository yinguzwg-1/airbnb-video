"use client";

import { useState, useRef, useEffect } from 'react';
import { IoLanguageOutline, IoChevronDownOutline } from 'react-icons/io5';
import { useTranslation } from '@/app/contexts/TranslationContext';
import { useSearchParams } from 'next/navigation';
import { Language, supportedLanguages, getLanguageName, getLanguageFlag } from '@/app/i18n';
import { useStore } from '../stores';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { urlStore } = useStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    // 在切换语言前记录当前的查询参数（用于调试）
    const currentParams = searchParams.toString();
    
    // 更新语言参数
    urlStore.updateParams({ lang: lang });
    
    // 设置语言（这会触发路由导航）
    setLanguage(lang);
    
    // 延迟更新pathname，确保路由导航完成
    setTimeout(() => {
      urlStore.updatePathname();
    }, 100);
    
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <IoLanguageOutline className="w-4 h-4" />
        <span className="flex items-center gap-1">
          <span>{getLanguageFlag(language)}</span>
          <span>{getLanguageName(language)}</span>
        </span>
        <IoChevronDownOutline 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          <div className="py-1">
            {supportedLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  language === lang ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{getLanguageFlag(lang)}</span>
                <span>{getLanguageName(lang)}</span>
                {language === lang && (
                  <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 