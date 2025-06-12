"use client";

import { MediaItem, MediaType, Movie, TVShow } from "@/app/types/media";
import { FiStar, FiPlay, FiClock, FiCalendar, FiTv } from "react-icons/fi";
import { useState } from "react";
import { useT } from "@/app/contexts/TranslationContext";

interface MediaCardProps {
  item: MediaItem;
}

export default function MediaCard({ item }: MediaCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const t = useT();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'released': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'released': return t.status.released;
      case 'ongoing': return t.status.ongoing;
      case 'upcoming': return t.status.upcoming;
      default: return status;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 9) return 'text-green-600';
    if (rating >= 8) return 'text-blue-600';
    if (rating >= 7) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* 海报图片 */}
      <div className="relative aspect-[2/3] bg-gray-200 overflow-hidden">
        {!imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="text-gray-400 text-4xl">🎬</div>
              </div>
            )}
            <img
              src={item.poster}
              alt={item.title}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center text-gray-400">
            <div className="text-4xl mb-2">🎬</div>
            <div className="text-sm">{t.card.imageLoadError}</div>
          </div>
        )}

        {/* 悬停时的播放按钮 */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <FiPlay className="text-gray-800 text-xl ml-1" />
          </button>
        </div>

        {/* 状态标签 */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
            {getStatusText(item.status)}
          </span>
        </div>

        {/* 媒体类型标签 */}
        <div className="absolute top-2 right-2">
          <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
            {item.type === MediaType.MOVIE ? (
              <>
                <FiPlay size={12} className="mr-1" />
                {t.mediaTypes.movie}
              </>
            ) : (
              <>
                <FiTv size={12} className="mr-1" />
                {t.mediaTypes.tv}
              </>
            )}
          </span>
        </div>

        {/* 评分标签 */}
        <div className="absolute bottom-2 right-2">
          <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-sm font-medium flex items-center">
            <FiStar className={`mr-1 ${getRatingColor(item.rating)}`} size={14} />
            <span className={getRatingColor(item.rating)}>{item.rating}</span>
          </div>
        </div>
      </div>

      {/* 内容信息 */}
      <div className="p-4">
        {/* 标题 */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>

        {/* 年份和时长/集数信息 */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center">
            <FiCalendar size={12} className="mr-1" />
            {item.year}
          </div>
          
          <div className="flex items-center">
            <FiClock size={12} className="mr-1" />
            {item.type === MediaType.MOVIE 
              ? `${(item as Movie).duration} ${t.card.minutes}`
              : `${(item as TVShow).seasons} ${t.card.seasons} ${(item as TVShow).episodes} ${t.card.episodes}`
            }
          </div>
        </div>

        {/* 类型标签 */}
        <div className="flex flex-wrap gap-1 mb-3">
          {item.genres.slice(0, 2).map((genre, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
            >
              {genre}
            </span>
          ))}
          {item.genres.length > 2 && (
            <span className="text-gray-400 text-xs px-1">
              +{item.genres.length - 2}
            </span>
          )}
        </div>

        {/* 描述 */}
        <p className="text-gray-600 text-xs line-clamp-2 mb-3">
          {item.description}
        </p>

        {/* 创作者信息 */}
        <div className="text-xs text-gray-500">
          {item.type === MediaType.MOVIE ? (
            <span>{t.card.director}: {(item as Movie).director}</span>
          ) : (
            <span>{t.card.creator}: {(item as TVShow).creator}</span>
          )}
        </div>

        {/* 主演信息 */}
        {item.cast.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            {t.card.cast}: {item.cast.slice(0, 2).join(', ')}
            {item.cast.length > 2 && ' 等'}
          </div>
        )}
      </div>

      {/* 底部操作按钮 */}
      <div className="px-4 pb-4">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center">
          <FiPlay size={16} className="mr-2" />
          {t.common.viewDetails}
        </button>
      </div>
    </div>
  );
} 