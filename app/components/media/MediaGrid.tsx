import { MediaItem } from "@/app/types/media";
import { MediaCard } from "@/app/components";
import { Language } from "@/app/i18n";

interface MediaGridProps {
  items: MediaItem[];
  lang: Language;
}

export function MediaGrid({ items, lang }: MediaGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <div className="text-4xl md:text-6xl mb-4">🎬</div>
        <div className="text-gray-500 dark:text-gray-400 text-lg md:text-xl">暂无内容</div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  );
} 