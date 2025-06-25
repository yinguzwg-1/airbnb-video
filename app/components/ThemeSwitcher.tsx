"use client";

import { useState, useRef, useEffect } from 'react';
import { IoSunnyOutline, IoMoonOutline, IoDesktopOutline, IoChevronDownOutline } from 'react-icons/io5';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useT } from '@/app/contexts/TranslationContext';
import { Theme } from '@/app/types/theme';

type ThemeOption = Theme | 'system';

interface ThemeOptionConfig {
  value: ThemeOption;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  descriptionKey: string;
}

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const t = useT();

  const themeOptions: ThemeOptionConfig[] = [
    {
      value: 'light',
      icon: IoSunnyOutline,
      labelKey: 'light',
      descriptionKey: 'lightDescription',
    },
    {
      value: 'dark',
      icon: IoMoonOutline,
      labelKey: 'dark',
      descriptionKey: 'darkDescription',
    },
    {
      value: 'system',
      icon: IoDesktopOutline,
      labelKey: 'system',
      descriptionKey: 'systemDescription',
    },
  ];
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ThemeOption>('system');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 检查当前是否为系统默认设置
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      setSelectedOption('system');
    } else {
      setSelectedOption(savedTheme as Theme);
    }
  }, []);

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

  const handleThemeChange = (option: ThemeOption) => {
    // 添加主题切换埋点
    window.tracker?.track('theme_change', {
      old_theme: selectedOption,
      new_theme: option,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    });
    
    setSelectedOption(option);
    
    if (option === 'system') {
      // 移除localStorage设置，让系统跟随系统主题
      localStorage.removeItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } else {
      setTheme(option);
    }
    
    setIsOpen(false);
  };

  const getCurrentOption = () => {
    return themeOptions.find(option => option.value === selectedOption) || themeOptions[0];
  };

  const currentOption = getCurrentOption();
  const IconComponent = currentOption.icon;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={t.theme.switchTheme}
      >
        <IconComponent className="w-4 h-4" />
        <span className="hidden sm:inline">{t.theme[currentOption.labelKey as keyof typeof t.theme]}</span>
        <IoChevronDownOutline 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          <div className="py-1">
            {themeOptions.map((option) => {
              const OptionIcon = option.icon;
              const isSelected = option.value === selectedOption;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <OptionIcon className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{t.theme[option.labelKey as keyof typeof t.theme]}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {t.theme[option.descriptionKey as keyof typeof t.theme]}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 