import Link from 'next/link';
import { useT } from '@/app/contexts/TranslationContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';

export default function Header() {
  const t = useT();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎬</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {t.home.title}
            </span>
          </Link>

          {/* 导航链接 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/media" 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t.nav.movies}
            </Link>
            <Link 
              href="/tv" 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t.nav.tvShows}
            </Link>
            <Link 
              href="/rankings" 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t.nav.rankings}
            </Link>
          </nav>

          {/* 右侧工具栏 */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
} 