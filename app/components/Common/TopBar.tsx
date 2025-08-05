'use client'
import Link from "next/link";
import { CircularLanguageSwitcher, CircularThemeSwitcher } from "..";
import { translations, Language } from "@/app/i18n";


const TopBar = ({lang, children, title}: {lang: Language, children?: React.ReactNode, title?: string}) => {
  const t = translations[lang];
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Back to Home */}
          <Link
            href={`/${lang}`}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.burrypoint.backToHome}
          </Link>
          {children}
          {/* Title */}
          {
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          }

          {/* Language and Theme Switchers */}
          <div className="flex gap-3">
            <CircularLanguageSwitcher />
            <CircularThemeSwitcher />
      
          </div>
        </div>
      </div>
    </div>  
  );
};

export default TopBar;