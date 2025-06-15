"use client";

import React from 'react';
import Link from 'next/link';
import { useState } from "react";
import { FiSearch, FiMenu, FiX, FiUpload } from "react-icons/fi";
import { useT } from "@/app/contexts/TranslationContext";
import LanguageSwitcher from "../LanguageSwitcher";
import ThemeSwitcher from "../ThemeSwitcher";
import MicroUploadController from "../upload/MicroUploadController";
import { UPLOAD_PRESETS, UploadFile } from "@/app/types/upload";
import SearchBar from '../SearchBar';

interface HeaderProps {
  // 移除搜索相关的属性
}

const Header: React.FC<HeaderProps> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useT();

  const handleUploadSuccess = (files: UploadFile[]) => {
    console.log('上传成功:', files);
    // 这里可以处理上传成功后的逻辑，比如刷新列表等
    alert(`成功上传 ${files.length} 个文件！`);
  };

  const handleUploadError = (error: string) => {
    console.error('上传失败:', error);
    alert(`上传失败: ${error}`);
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎬</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {t.home.title}
            </span>
          </Link>

          {/* 搜索框 */}
          <div className="flex-1 max-w-2xl mx-8">
            <SearchBar />
          </div>

          {/* 导航链接 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/media" 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t.nav.movies}
            </Link>
            <Link 
              href="/media?type=movie" 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t.mediaTypes.movie}
            </Link>
            <Link 
              href="/media?type=tv" 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t.mediaTypes.tv}
            </Link>
          </nav>

          {/* 上传按钮 */}
          <MicroUploadController
            config={UPLOAD_PRESETS.MEDIA_MIX}
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            trigger={
              <button className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors">
                <FiUpload size={16} />
                <span>上传</span>
              </button>
            }
          />
          
          <div className="ml-4 flex items-center space-x-3">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* 移动端导航菜单 */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/media" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {t.nav.movies}
              </Link>
              <Link 
                href="/media?type=movie" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {t.mediaTypes.movie}
              </Link>
              <Link 
                href="/media?type=tv" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {t.mediaTypes.tv}
              </Link>
              
              {/* 移动端上传按钮 */}
              <div className="pt-2">
                <MicroUploadController
                  config={UPLOAD_PRESETS.MEDIA_MIX}
                  onSuccess={handleUploadSuccess}
                  onError={handleUploadError}
                  trigger={
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      <FiUpload size={18} />
                      <span>上传文件</span>
                    </button>
                  }
                />
              </div>
              
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
};

export default Header; 