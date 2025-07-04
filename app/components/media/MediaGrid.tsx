import { MediaItem } from "@/app/types/media";
import { MediaCard } from "./MediaCard";
import { Language } from "@/app/i18n";

interface MediaGridProps {
  items: MediaItem[];
  lang: Language;
}

export function MediaGrid({ items, lang }: MediaGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎬</div>
        <div className="text-gray-500 text-xl">暂无内容</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  );
} 