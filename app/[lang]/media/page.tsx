import { Suspense } from "react";
import { Language, translations } from "@/app/i18n";
import { getMediaData } from "@/app/actions/getMediaData";
import { Footer, Header, LoadingSpinner, MediaContent } from "@/app/components";

interface MediaPageProps {
  params: {
    lang: Language;
  };
  searchParams: {
    page?: string;
    pageSize?: string;
    type?: string;
    genre?: string;
    year?: string;
    rating?: string;
    status?: string;
    sortBy?: string;
    order?: string;
    q?: string;
  };
}

export default async function MediaPage({ params, searchParams }: MediaPageProps) {
  // 获取翻译
  const t = translations[params.lang];
  
  // 首次加载时在服务端获取数据
  const initialData = await getMediaData({
    page: searchParams.page || '1',
    pageSize: searchParams.pageSize || '12',
    q: searchParams.q || '',
    sortBy: searchParams.sortBy || '',
    order: searchParams.order || ''
  });
 
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* 顶部导航 */}
      <Header />

      {/* 主要内容区域 */}
      <main className="container mx-auto px-responsive py-responsive">
        <Suspense fallback={<LoadingSpinner />}>
          <MediaContent 
            initialData={initialData}
            params={params}
            searchParams={searchParams}
            t={t}
          />
        </Suspense>
      </main>

      {/* 页脚信息 */}
      <Footer />
    </div>
  );
} 