"use client";

import { useState } from "react";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import { useT } from "@/app/contexts/TranslationContext";
import LanguageSwitcher from "../LanguageSwitcher";
import ThemeSwitcher from "../ThemeSwitcher";

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export default function Header({ onSearch, searchQuery }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tempSearch, setTempSearch] = useState(searchQuery);
  const t = useT();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(tempSearch);
  };

  const handleClearSearch = () => {
    setTempSearch("");
    onSearch("");
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo和标题 */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-blue-600">🎬</div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t.media.title}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{t.media.subtitle}</p>
            </div>
          </div>

          {/* 搜索栏 */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder={t.media.searchPlaceholder}
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-12 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FiSearch 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" 
                size={20}
              />
              {tempSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                >
                  <FiX size={20} />
                </button>
              )}
            </form>
          </div>

          {/* 导航菜单 */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.nav.home}
            </a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.nav.movies}
            </a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.nav.tvShows}
            </a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.nav.rankings}
            </a>
            <div className="ml-4 flex items-center space-x-3">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </nav>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* 移动端搜索栏 */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder={t.common.search + "..."}
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-12 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" 
              size={20}
            />
            {tempSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              >
                <FiX size={20} />
              </button>
            )}
          </form>
        </div>

        {/* 移动端导航菜单 */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <nav className="flex flex-col space-y-3">
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {t.nav.home}
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {t.nav.movies}
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {t.nav.tvShows}
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {t.nav.rankings}
              </a>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <ThemeSwitcher />
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 