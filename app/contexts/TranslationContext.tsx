"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Language, TranslationKeys, translations, defaultLanguage } from '@/app/i18n';
import { buildLocalizedUrl } from '@/app/utils/urlUtils';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export function TranslationProvider({ children, initialLanguage }: TranslationProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage || defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 从URL参数或localStorage读取保存的语言设置
  useEffect(() => {
    if (initialLanguage) {
      // 如果有初始语言参数（来自URL），优先使用
      setLanguageState(initialLanguage);
      localStorage.setItem('language', initialLanguage);
    } else {
      // 否则从localStorage读取
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
      }
    }
    setIsLoading(false);
  }, [initialLanguage]);

  // 设置语言并保存到localStorage，同时更新URL
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // 更新HTML lang属性
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    
    // 使用工具函数构建新URL，保留所有查询参数
    const newUrl = buildLocalizedUrl(pathname, searchParams, lang);
    
    // 导航到新URL
    router.push(newUrl);
  };

  // 获取当前语言的翻译对象
  const t = translations[language];

  const value: TranslationContextType = {
    language,
    setLanguage,
    t,
    isLoading,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

// 自定义Hook
export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

// 简化的翻译Hook，只返回t函数
export function useT() {
  const { t } = useTranslation();
  return t;
} 