'use client';

import { useTranslation } from '@/app/contexts/TranslationContext';
import { zh, en } from '@/app/i18n';

export function useServerTranslation() {
  const { language } = useTranslation();
  
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = language === 'zh' ? zh : en;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // 如果找不到翻译，返回key本身
      }
    }
    
    return typeof value === 'string' ? value : key;
  };
  
  return { t, language };
} 