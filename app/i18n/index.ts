import { Language, TranslationKeys } from './types';
import { zh } from './locales/zh';
import { en } from './locales/en';

export const translations: Record<Language, TranslationKeys> = {
  zh,
  en,
};

export const defaultLanguage: Language = 'zh';
export const supportedLanguages: Language[] = ['zh', 'en'];

export const getLanguageName = (lang: Language): string => {
  const names: Record<Language, string> = {
    zh: '中文',
    en: 'English',
  };
  return names[lang];
};

export const getLanguageFlag = (lang: Language): string => {
  const flags: Record<Language, string> = {
    zh: '🇨🇳',
    en: '🇺🇸',
  };
  return flags[lang];
};

export * from './types';
export { zh, en }; 