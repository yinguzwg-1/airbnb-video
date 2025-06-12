"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { defaultLanguage } from "./i18n";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // 检查localStorage中保存的语言偏好
    const savedLanguage = localStorage.getItem('language');
    const targetLanguage = savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en') 
      ? savedLanguage 
      : defaultLanguage;
    
    // 重定向到默认语言页面
    router.replace(`/${targetLanguage}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">🎬</div>
        <div className="text-lg">正在加载...</div>
      </div>
    </div>
  );
}
