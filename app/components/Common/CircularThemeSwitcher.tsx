"use client";

import { IoSunnyOutline, IoMoonOutline } from 'react-icons/io5';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useTracker } from '@/app/hooks/useTracker';
import { useServerTranslation } from '@/app/hooks/useServerTranslation';

export default function CircularThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const tracker = useTracker();
  const { t } = useServerTranslation();

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    

    // 详细的埋点记录
    tracker?.track('theme_toggle', {
      old_theme: theme,
      new_theme: newTheme,
      old_theme_name: theme === 'light' ? '浅色模式' : '深色模式',
      new_theme_name: newTheme === 'light' ? '浅色模式' : '深色模式',
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      component: 'circular_theme_switcher',
      action: 'click',
    });

    toggleTheme();
  };

  return (
    <button
      onClick={handleThemeToggle}
      className="group relative w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-gray-600 circular-switcher"
      title={theme === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')}
    >
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-blue-600 dark:to-purple-700 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      
      {/* 图标容器 */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {theme === 'light' ? (
          <IoSunnyOutline className="w-6 h-6 text-yellow-500" />
        ) : (
          <IoMoonOutline className="w-6 h-6 text-blue-400" />
        )}
      </div>
    </button>
  );
} 