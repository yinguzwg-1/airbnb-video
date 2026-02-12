"use client";

import { useState, useEffect } from "react";
import { MdLanguage, MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "./AuthModal";
import { useAuthStore } from "../stores/useAuthStore";
import { i18n } from "../config/i18n";

interface NavbarProps {
  currentLang: string;
}

export default function Navbar({ currentLang }: NavbarProps) {
  const t = i18n[currentLang as "zh" | "en"] || i18n.zh;
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { isLoggedIn, logout, login } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // 处理主题初始化
  useEffect(() => {
    console.log(`🚀 Deployment Time: ${process.env.NEXT_PUBLIC_DEPLOY_TIME}`);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = currentLang === "zh" ? "en" : "zh";
    const newPath = pathname.replace(`/${currentLang}`, `/${newLang}`);
    router.push(newPath);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem("theme", "light");
    }
  };

  const handleAuthSuccess = (data: any) => {
    login(data.user, data.access_token);
    setIsAuthModalOpen(false);
    alert(t.navbar.loginSuccess);
  };

  const handleUserClick = () => {
    if (isLoggedIn) {
      if (confirm(t.navbar.logoutConfirm)) {
        logout();
      }
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-sky-100/60 dark:border-sky-900/30 px-4 sm:px-6 py-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <motion.h1 
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent cursor-pointer whitespace-nowrap"
            onClick={() => router.push(`/${currentLang}`)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {t.metadata.title}
          </motion.h1>

          {/* 右侧功能区 */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* 多语言切换 */}
            <motion.button 
              onClick={toggleLanguage}
              className="p-2 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-full flex items-center space-x-1 transition-colors"
              title={t.navbar.toggleLang}
              whileTap={{ scale: 0.92 }}
            >
              <MdLanguage className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">{t.navbar.lang}</span>
            </motion.button>

            {/* 黑白主题切换 */}
            <motion.button 
              onClick={toggleTheme}
              className="p-2 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-full transition-colors"
              title={t.navbar.toggleTheme}
              whileTap={{ scale: 0.92, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {isDarkMode ? (
                <MdOutlineLightMode className="w-5 h-5 text-amber-400" />
              ) : (
                <MdOutlineDarkMode className="w-5 h-5" />
              )}
            </motion.button>

            {/* 用户操作按钮 */}
            <motion.div 
              className={`flex items-center space-x-1 sm:space-x-2 border rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${
                isLoggedIn 
                ? "border-sky-200 bg-sky-50 dark:bg-sky-900/20 dark:border-sky-800 text-sky-600 dark:text-sky-400" 
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              }`}
              onClick={handleUserClick}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="text-xs sm:text-sm font-bold whitespace-nowrap">
                {isLoggedIn ? t.navbar.logout : t.navbar.login}
              </div>
              <FaUserCircle className={`w-5 h-5 sm:w-6 h-6 ${isLoggedIn ? "text-sky-500" : "text-gray-500"}`} />
            </motion.div>
          </div>
        </div>
      </header>

      {/* 登录模态框 */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess}
        currentLang={currentLang}
      />
    </div>
  );
}
