"use client";

import React from 'react';
import { MediaItem, MediaType, MediaStatus } from "@/app/types/media";
import { FiStar, FiPlay, FiClock, FiCalendar, FiTv } from "react-icons/fi";
import Link from 'next/link';
import { useT } from "@/app/contexts/TranslationContext";
import useLang from '@/app/hooks/useLang';
import { useParams } from 'next/navigation';

interface MediaCardProps {
  item: MediaItem;
}

export default function MediaCard({ item }: MediaCardProps) {
  const t = useT();
  const isEn = useLang() === 'en';
  const params = useParams();
  const currentLang = params?.lang as string || 'zh';

  const handleCardClick = () => {
    window.tracker?.track('media_card_click', {
      media_id: item.id,
      media_title: isEn ? item.title_en : item.title,
      media_type: item.type,
      media_year: item.year,
      media_rating: item.rating,
      page_url: window.location.href,
    });
  };

  return (
    <div data-media-id={item.id} className="cursor-pointer">
      <Link href={`/${currentLang}/media/${item.id}`} onClick={handleCardClick}>
        <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all duration-300 card-mobile">
          {/* 封面图片容器 */}
          <div className="relative aspect-[2/3] overflow-hidden">
            {/* 封面图片 */}
            <img
              src={item.poster}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 img-responsive"
            />
            
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* 评分标签 */}
            <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-yellow-400 dark:bg-yellow-500 text-black dark:text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs md:text-sm font-bold flex items-center gap-1 shadow-lg">
              <FiStar className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-nowrap">{item.rating}</span>
            </div>

            {/* 播放按钮 */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 dark:bg-gray-800/90 text-black dark:text-white p-2 md:p-3 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                <FiPlay className="w-4 h-4 md:w-6 md:h-6" />
              </div>
            </div>
          </div>

          {/* 内容信息 */}
          <div className="p-2 md:p-4">
            <h3 className="font-semibold text-sm md:text-lg mb-1 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate">
              {isEn ? item.title_en : item.title}
            </h3>
            <div className="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400 space-x-1 md:space-x-2">
              <span className="text-nowrap">{item.year}</span>
              <span className="hidden sm:inline">•</span>
              <span className={`
                px-1.5 md:px-2 py-0.5 rounded-full text-xs font-medium text-nowrap
                ${item.type === MediaType.MOVIE 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                  : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                }
              `}>
                {item.type === MediaType.MOVIE ? t.mediaTypes.movie : t.mediaTypes.tv}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
} 