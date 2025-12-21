
import React from "react";
import Navbar from "../components/Navbar";
import InfinitePhotoGrid from "../components/InfinitePhotoGrid";
import UploadButton from "../components/UploadButton";

interface HomePageProps {
  params: { lang: string };
}

// ✅ SSG: 在构建时执行（生成静态 HTML）
export default async function HomePage({ params: { lang } }: HomePageProps) {
  // 从服务端获取初始图片数据
  let initialPhotos = [];
  let initialHasMore = false;

  try {
    const baseUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'http://zwg.autos');
    // 初始加载第 1 页，每页 20 条
    const response = await fetch(`${baseUrl}/api/upload/list?page=1&limit=20`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const result = await response.json();
      initialPhotos = result.data;
      initialHasMore = result.hasMore;
    }
  } catch (error) {
    console.error('获取初始图片数据失败:', error);
  }

  return <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
    {/* 顶部导航栏 (客户端组件) */}
    <Navbar currentLang={lang} />

    {/* 中间照片墙部分 (无限滚动) */}
    <main className="max-w-7xl mx-auto px-6 py-8">
      <InfinitePhotoGrid 
        initialData={initialPhotos} 
        initialHasMore={initialHasMore} 
        currentLang={lang}
      />
    </main>

    {/* 悬浮上传按钮 (仅登录后显示) */}
    <UploadButton currentLang={lang} />
  </div>;
}
