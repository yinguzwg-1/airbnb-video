"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useT } from "../contexts/TranslationContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { Language } from "../i18n";

interface HomePageProps {
  params: { lang: Language };
}

export default function HomePage({ params }: HomePageProps) {
  const router = useRouter();
  const t = useT();

  // 自动跳转到媒体页面
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/${params.lang}/media`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, params.lang]);

  const handleGoToMedia = () => {
    router.push(`/${params.lang}/media`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center transition-colors duration-300">
      {/* 主题和语言切换按钮 */}
      <div className="absolute top-4 right-4 flex items-center space-x-3">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>

      <div className="text-center text-white p-8 max-w-2xl mx-auto">
        {/* Logo和标题 */}
        <div className="mb-8">
          <div className="text-8xl mb-6">🎬</div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {t.home.title}
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            {t.home.subtitle}
          </p>
        </div>

        {/* 特色介绍 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6">
            <div className="text-3xl mb-3">🎭</div>
            <h3 className="text-lg font-semibold mb-2">{t.home.features.content.title}</h3>
            <p className="text-gray-300 text-sm">{t.home.features.content.description}</p>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold mb-2">{t.home.features.search.title}</h3>
            <p className="text-gray-300 text-sm">{t.home.features.search.description}</p>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="text-lg font-semibold mb-2">{t.home.features.interface.title}</h3>
            <p className="text-gray-300 text-sm">{t.home.features.interface.description}</p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-4">
          <button
            onClick={handleGoToMedia}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {t.home.exploreButton}
          </button>
          
          <div className="text-gray-400 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <span>3 {t.home.autoRedirect}</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">6+</div>
            <div className="text-gray-400 text-sm">{t.home.stats.movies}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">6+</div>
            <div className="text-gray-400 text-sm">{t.home.stats.tvShows}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">100%</div>
            <div className="text-gray-400 text-sm">{t.home.stats.free}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">HD</div>
            <div className="text-gray-400 text-sm">{t.home.stats.quality}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 