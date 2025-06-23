"use client";

import React from 'react';
import { MediaItem, MediaType, MediaStatus } from "@/app/types/media";
import { FiStar, FiPlay, FiClock, FiCalendar, FiTv } from "react-icons/fi";
import Link from 'next/link';
import { useT } from "@/app/contexts/TranslationContext";
import useLang from '@/app/hooks/useLang';

interface MediaCardProps {
  item: MediaItem;
}

export function MediaCard({ item }: MediaCardProps) {
  const t = useT();
  const isEn = useLang() === 'en';
  return (
    <Link href={`/media/${item.id}`}>
      <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all duration-300">
        {/* 封面图片容器 */}
        <div className="relative aspect-[2/3] overflow-hidden">
          {/* 封面图片 */}
          <img
            src={item.poster}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* 评分标签 */}
          <div className="absolute top-2 right-2 bg-yellow-400 dark:bg-yellow-500 text-black dark:text-white px-2 py-1 rounded-md text-sm font-bold flex items-center gap-1 shadow-lg">
            <FiStar className="w-4 h-4" />
            {item.rating}
          </div>

          {/* 播放按钮 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 dark:bg-gray-800/90 text-black dark:text-white p-3 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg">
              <FiPlay className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 内容信息 */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {isEn ? item.title_en : item.title}
          </h3>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-2">
            <span>{item.year}</span>
            <span>•</span>
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-medium
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
  );
} 