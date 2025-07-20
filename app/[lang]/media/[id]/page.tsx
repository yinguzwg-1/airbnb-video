import { Suspense } from "react";
import { Language, translations } from "@/app/i18n";
import { Footer, Header, LoadingSpinner, MediaDetail } from "@/app/components";
import { mediaService } from "@/app/services/mediaService";

interface MediaDetailPageProps {
  params: {
    lang: Language;
    id: string;
  };
}

export default async function MediaDetailPage({ params }: MediaDetailPageProps) {

  const media = await mediaService.getMediaById(params.id);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* 顶部导航 */}
      <Header />

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <MediaDetail media={media} />
        </Suspense>
      </main>

      {/* 页脚信息 */}
      <Footer />
    </div>
  );
} 