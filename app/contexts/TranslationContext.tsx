"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Language, TranslationKeys, translations, defaultLanguage } from '@/app/i18n';

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
    
    // 构建新的URL路径
    const segments = pathname.split('/').filter(Boolean);
    // 移除当前语言段（如果存在）
    if (segments[0] && (segments[0] === 'zh' || segments[0] === 'en')) {
      segments.shift();
    }
    // 添加新语言段
    const newPath = `/${lang}${segments.length > 0 ? '/' + segments.join('/') : ''}`;
    
    // 导航到新URL
    router.push(newPath);
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