"use client";

import { useState } from "react";
import Image from "next/image";

// 一个简约的小狗 Base64 图标（透明背景）
const PUPPY_PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZGNkY2RjIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTIgM2wtMS45MTIgNS44MTNMMi40MjYgOC44Mmw1LjM2MyA0LjY4Ny0yLjA0IDYuMzkzTDEyIDE2LjI1bDYuMjkxIDMuNjUyLTIuMDQtNi4zOTMgNS4zNjMtNC42ODctNy42NjEtMS4wMDdMMTIgM3oiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIi8+PC9zdmc+";

const PhotoCard = ({ photo, index }: { photo: { id: number, url: string, title: string }, index: number }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* 站位图层：当图片未加载完成时显示 */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 animate-pulse">
          <img 
            src={PUPPY_PLACEHOLDER} 
            className="w-12 h-12 opacity-30" 
            alt="Loading..." 
          />
        </div>
      )}

      <Image
        src={photo.url}
        alt={photo.title}
        unoptimized={true} 
        fill
        className={`object-cover transition-all duration-500 group-hover:scale-110 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        // 前 4 张图片设置 priority，会自动应用 loading="eager" 并提升加载优先级
        priority={index < 4}
        // 显式提示浏览器这是一个高优先级请求
        {...(index < 4 ? { fetchPriority: "high" } : {})}
        onLoadingComplete={() => setIsLoaded(true)}
      />
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
        <p className="text-white font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          {photo.title}
        </p>
      </div>
    </div>
  );
};

const Picture = ({ photos }: { photos: { id: number, url: string, title: string }[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {photos.map((photo, index) => (
        <PhotoCard key={photo.id} photo={photo} index={index} />
      ))}
    </div>
  );
}

export default Picture;
