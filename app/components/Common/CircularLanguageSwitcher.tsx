"use client";

import { useTranslation } from '@/app/contexts/TranslationContext';
import { useTracker } from '@/app/hooks/useTracker';
import { Language, supportedLanguages, getLanguageName, getLanguageFlag } from '@/app/i18n';
import { useServerTranslation } from '@/app/hooks/useServerTranslation';

export default function CircularLanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const tracker = useTracker();
  const { t } = useServerTranslation();

  const handleLanguageToggle = () => {
    const currentIndex = supportedLanguages.indexOf(language);
    const nextIndex = (currentIndex + 1) % supportedLanguages.length;
    const newLanguage = supportedLanguages[nextIndex];

    console.log('Language toggle:', {
      currentLanguage: language,
      nextLanguage: newLanguage,
      currentIndex,
      nextIndex,
      supportedLanguages
    });

    // 详细的埋点记录
    tracker?.track('language_toggle', {
      old_language: language,
      new_language: newLanguage,
      old_language_name: getLanguageName(language),
      new_language_name: getLanguageName(newLanguage),
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      component: 'circular_language_switcher',
      action: 'click',
      current_index: currentIndex,
      next_index: nextIndex,
    });

    setLanguage(newLanguage);
  };

  const getNextLanguage = (): Language => {
    const currentIndex = supportedLanguages.indexOf(language);
    const nextIndex = (currentIndex + 1) % supportedLanguages.length;
    return supportedLanguages[nextIndex];
  };

  const nextLanguage = getNextLanguage();

  return (
    <button
      onClick={handleLanguageToggle}
      className="group relative w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-gray-600 circular-switcher"
      title={`${t('theme.switchToLanguage')}${getLanguageName(nextLanguage)}`}
    >
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      
      {/* 图标容器 */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <span className="text-lg font-bold group-hover:scale-110 dark:text-white">
          {getLanguageFlag(nextLanguage)}
        </span>
      </div>
    </button>
  );
} 