"use client";
import { useT } from "@/app/contexts/TranslationContext";
import { MediaType, MediaItem, MediaResponse } from "../types/media";
import { useStore } from "../stores";
import { observer } from "mobx-react-lite";

const Footer = observer(function Footer({initialData}: {initialData: MediaResponse}) {
  const t = useT();
  const { mediaStore } = useStore();
  const { mediaList, total } = mediaStore;
  return (
    <footer className="bg-gray-800 dark:bg-gray-950 text-white py-8 mt-16">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">{t.footer.title}</h3>
          <p className="text-gray-400 dark:text-gray-500">{t.footer.subtitle}</p>
        </div>

        {mediaList && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-2xl font-bold text-blue-400 dark:text-blue-300">{total}</div>
              <div className="text-gray-400 dark:text-gray-500">{t.footer.totalContent}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400 dark:text-green-300">
                {mediaList.filter(item => item.type === MediaType.MOVIE).length}
              </div>
              <div className="text-gray-400 dark:text-gray-500">{t.footer.movies}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400 dark:text-purple-300">
                {mediaList.filter(item => item.type === MediaType.TV).length}
              </div>
              <div className="text-gray-400 dark:text-gray-500">{t.footer.tvShows}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400 dark:text-yellow-300">
                {mediaList.length > 0
                  ? (Math.round((mediaList.reduce((sum, item) => sum + parseFloat(item.rating.toString()), 0) / mediaList.length) * 10) / 10).toFixed(1)
                  : '0.0'
                }
              </div>
              <div className="text-gray-400 dark:text-gray-500">{t.footer.averageRating}</div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-700 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-sm">
          {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
});

export default Footer;