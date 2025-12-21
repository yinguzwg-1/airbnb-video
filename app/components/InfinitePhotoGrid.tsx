"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PropagateLoader } from "react-spinners";
import useSWRInfinite from "swr/infinite";
import { MdPlayCircleOutline, MdClose, MdPublic } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { i18n } from "../config/i18n";

interface Photo {
  id: number;
  url: string;
  coverUrl?: string;
  title?: string;
  width?: number;
  height?: number;
  type?: 'photo' | 'video';
}

interface ApiResponse {
  data: Photo[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface InfinitePhotoGridProps {
  initialData: Photo[];
  initialHasMore: boolean;
  currentLang: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const InfinitePhotoGrid = ({ initialData, initialHasMore, currentLang }: InfinitePhotoGridProps) => {
  const t = i18n[currentLang as "zh" | "en"] || i18n.zh;
  const observerTarget = useRef(null);
  const [columnCount, setColumnCount] = useState<2 | 4 | 6>(4);
  const [category, setCategory] = useState<'all' | 'photo' | 'video'>('all');
  const [isMounted, setIsMounted] = useState(false);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [isSphereOpen, setIsSphereOpen] = useState(false);
  const sphereContainerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  // 初始化加载本地存储的列数
  useEffect(() => {
    const saved = localStorage.getItem('photo-grid-columns');
    if (saved && [2, 4, 6].includes(parseInt(saved))) {
      setColumnCount(parseInt(saved) as 2 | 4 | 6);
    }
    setIsMounted(true);
  }, []);

  // 使用 requestAnimationFrame 实现更符合直觉的球体自转（基于鼠标位置）
  useEffect(() => {
    if (!isSphereOpen) {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      return;
    }

    const animate = () => {
      // 只有在非拖拽状态下才根据鼠标位置自动旋转，或者你可以合并两者
      // 这里采用更“球形”的逻辑：鼠标位置决定旋转速度和轴向
      if (!isDragging.current) {
        rotationRef.current.y += targetRotationRef.current.y * 0.5;
        rotationRef.current.x += targetRotationRef.current.x * 0.5;
      }

      if (sphereContainerRef.current) {
        sphereContainerRef.current.style.transform = `rotateX(${-rotationRef.current.x}deg) rotateY(${rotationRef.current.y}deg)`;
      }
      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isSphereOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    if (isDragging.current) {
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      
      rotationRef.current.y += deltaX * 0.3;
      rotationRef.current.x += deltaY * 0.3;
      
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    } else {
      // 鼠标位置决定“目标旋转速度”
      targetRotationRef.current.y = (e.clientX - centerX) / (rect.width / 2);
      targetRotationRef.current.x = (e.clientY - centerY) / (rect.height / 2);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleColumnCountChange = (num: 2 | 4 | 6) => {
    setColumnCount(num);
    localStorage.setItem('photo-grid-columns', num.toString());
  };

  const getKey = (pageIndex: number, previousPageData: ApiResponse) => {
    if (pageIndex === 0) return `/api/upload/list?page=1&limit=20&category=${category}`;
    if (previousPageData && !previousPageData.hasMore) return null;
    return `/api/upload/list?page=${pageIndex + 1}&limit=20&category=${category}`;
  };

  const { data, size, setSize, isValidating, isLoading } = useSWRInfinite<ApiResponse>(
    getKey, 
    fetcher, 
    {
      fallbackData: [{ 
        data: initialData, 
        total: 0, 
        page: 1, 
        limit: 20, 
        hasMore: initialHasMore 
      }],
      revalidateFirstPage: false,
      revalidateOnFocus: false, // 禁止窗口聚焦时重新验证
      revalidateOnReconnect: false, // 禁止重连时重新验证
      shouldRetryOnError: false, // 失败时不重试，避免循环加载
    }
  );

  const photos = data ? data.map((page) => page.data).flat() : [];
  const hasMore = data ? data[data.length - 1].hasMore : initialHasMore;
  const isFetchingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");

  // 获取基础图片路径
  const getFullImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.BACKEND_URL || 'https://zwg.autos');
    return `${baseUrl}${url}`;
  };

  useEffect(() => {
    if (!isMounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isValidating && !isLoading) {
          setSize(size + 1);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, hasMore, size, isValidating, isLoading, isMounted, setSize]);

  const gridColsClass = {
    2: "grid-cols-1 sm:grid-cols-2", 
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    6: "grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
  }[columnCount];

  // 准备轮播数据
  const splitIndex = Math.ceil(photos.length / 2);
  const row1 = photos.slice(0, splitIndex);
  const row2 = photos.slice(splitIndex);

  return (
    <div className="space-y-8">
      {/* 隐藏的 H2 用于 SEO 结构 */}
      <h2 className="sr-only">{t.metadata.title} - {t.grid.photography}</h2>

      {/* 顶部工具栏 */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 sticky top-24 z-30 px-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {/* 分类选择 */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-1 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center mr-2">
            {(['all', 'photo', 'video'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  category === cat
                    ? "bg-rose-500 text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {t.grid[cat]}
              </button>
            ))}
          </div>

          {/* 地球播放按钮 */}
          <button
            onClick={() => setIsSphereOpen(true)}
            className="hidden sm:flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 transition-all font-bold group whitespace-nowrap"
          >
            <MdPublic className="w-5 h-5 sm:w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="text-sm sm:text-base">{t.grid.sphere}</span>
          </button>

          {/* 轮播播放按钮 */}
          <button
            onClick={() => setIsSlideshowOpen(true)}
            className="hidden sm:flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 transition-all font-bold group whitespace-nowrap"
          >
            <MdPlayCircleOutline className="w-5 h-5 sm:w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-sm sm:text-base">{t.grid.slideshow}</span>
          </button>
        </div>

        {/* 列数选择器 */}
        <div className="hidden sm:flex bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-1 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm items-center self-end sm:self-auto">
          {[2, 4, 6].map((num) => (
            <button
              key={num}
              onClick={() => handleColumnCountChange(num as 2 | 4 | 6)}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                columnCount === num
                  ? "bg-rose-500 text-white shadow-md scale-105"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {t.grid.columns.replace('{num}', num.toString())}
            </button>
          ))}
        </div>
      </div>

      {!isMounted ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 px-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
            <div className={`grid ${gridColsClass} gap-4 sm:gap-6 px-4`}>
              {photos.map((photo, index) => (
                <div
                  key={`${photo.id}-${photo.type}-${index}`}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-800/50 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700"
                  onClick={(e) => {
                    if (photo.type === 'video') {
                      const video = e.currentTarget.querySelector('video');
                      if (video) {
                        if (video.paused) video.play();
                        else video.pause();
                      }
                    }
                  }}
                >
                  {photo.type === 'video' ? (
                    <div className="relative w-full h-full cursor-pointer bg-black">
                      <video
                        src={getFullImageUrl(photo.url)}
                        poster={photo.coverUrl ? getFullImageUrl(photo.coverUrl) : undefined}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                        playsInline
                        preload="metadata"
                        onPlay={(e) => e.currentTarget.parentElement?.querySelector('.play-overlay')?.classList.add('opacity-0')}
                        onPause={(e) => e.currentTarget.parentElement?.querySelector('.play-overlay')?.classList.remove('opacity-0')}
                      />
                      {/* 自定义播放按钮 */}
                      <div className="play-overlay absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 pointer-events-none">
                        <div className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center shadow-xl shadow-rose-500/40 border-4 border-white">
                          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={getFullImageUrl(photo.url)}
                      alt={photo.title || t.grid.photography}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
                      sizes={
                        columnCount === 2 
                          ? "(max-width: 768px) 50vw, 50vw" 
                          : columnCount === 4 
                          ? "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          : "(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 16vw"
                      }
                      priority={index < 4}
                      loading={index < 4 ? "eager" : "lazy"}
                    />
                  )}

              {/* 优雅的底部遮罩 */}
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <div className="flex items-center justify-between">
                    <div>
                      {photo.type !== 'video' && (
                        <>
                          <h3 className="text-white font-bold text-xs sm:text-sm tracking-wide line-clamp-1">
                            {photo.title || t.grid.untitled}
                          </h3>
                          {photo.width && photo.height && (
                            <p className="text-white/70 text-[8px] sm:text-[10px] mt-0.5">
                              {photo.width} × {photo.height}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
              </div>

              {/* 红色渐变边框 - 最终修复版 */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
                style={{
                  border: '3px solid transparent',
                  backgroundImage: 'linear-gradient(to bottom right, #e11d48, #f43f5e, #fb923c)',
                  backgroundOrigin: 'border-box',
                  WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'destination-out',
                  maskComposite: 'exclude',
                  boxShadow: '0 0 20px rgba(244, 63, 94, 0.4)'
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 轮播播放全屏覆盖层 */}
      <AnimatePresence>
        {isSlideshowOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col justify-center overflow-hidden"
          >
            <button
              onClick={() => setIsSlideshowOpen(false)}
              className="absolute top-4 sm:top-8 right-4 sm:right-8 z-[110] p-2 sm:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <MdClose className="w-6 h-6 sm:w-8 h-8" />
            </button>

                <div className="space-y-8 sm:space-y-16 py-12">
                  {/* 第一行：左往右 */}
                  <div className="film-strip overflow-hidden">
                    <div className="flex animate-scroll-right whitespace-nowrap">
                  {[...row1, ...row1, ...row1].map((photo, i) => (
                    <div 
                      key={`${photo.id}-r1-${i}`} 
                      className="inline-block px-2 sm:px-4 h-48 sm:h-72 aspect-[3/4] relative group"
                    >
                      <div className="relative w-full h-full">
                        <Image 
                          src={getFullImageUrl(photo.url)} 
                          alt="" 
                          fill
                          unoptimized={true}
                          loading="lazy"
                          className="object-cover rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-white/5 transition-transform duration-500 group-hover:scale-105" 
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl sm:rounded-2xl mx-2 sm:mx-4" />
                    </div>
                  ))}
                    </div>
                  </div>

                  {/* 第二行：右往左 */}
                  <div className="film-strip overflow-hidden">
                    <div className="flex animate-scroll-left whitespace-nowrap">
                  {[...row2, ...row2, ...row2].map((photo, i) => (
                    <div 
                      key={`${photo.id}-r2-${i}`} 
                      className="inline-block px-2 sm:px-4 h-48 sm:h-72 aspect-[3/4] relative group"
                    >
                      <div className="relative w-full h-full">
                        <Image 
                          src={getFullImageUrl(photo.url)} 
                          alt="" 
                          fill
                          unoptimized={true}
                          loading="lazy"
                          className="object-cover rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-white/5 transition-transform duration-500 group-hover:scale-105" 
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl sm:rounded-2xl mx-2 sm:mx-4" />
                    </div>
                  ))}
                    </div>
                  </div>
                </div>

            <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 text-center">
              <h2 className="text-white/50 text-sm sm:text-xl font-bold tracking-widest uppercase">{t.grid.slideshowTitle}</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D 地球全屏覆盖层 */}
      <AnimatePresence>
        {isSphereOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
          >
            <button
              onClick={() => setIsSphereOpen(false)}
              className="absolute top-4 sm:top-8 right-4 sm:right-8 z-[110] p-2 sm:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <MdClose className="w-6 h-6 sm:w-8 h-8" />
            </button>

            <div 
              className="stage-3d w-full h-full flex items-center justify-center overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div 
                ref={sphereContainerRef}
                id="sphere-gallery"
                className="sphere-container w-0 h-0 flex items-center justify-center will-change-transform"
              >
                    {photos.slice(0, 50).map((photo, index, array) => {
                      const total = array.length;
                      const phi = Math.acos(-1 + (2 * index) / total);
                      const theta = Math.sqrt(total * Math.PI) * phi;
                      const radius = isMounted && typeof window !== 'undefined' && window.innerWidth < 640 ? 200 : 380;

                      const x = radius * Math.sin(phi) * Math.cos(theta);
                      const y = radius * Math.sin(phi) * Math.sin(theta);
                      const z = radius * Math.cos(phi);

                      return (
                        <div
                          key={`sphere-${photo.id}-${index}`}
                          className="sphere-item"
                          style={{
                            transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                          }}
                        >
                          <div className="w-24 h-18 sm:w-44 sm:h-32 block relative group select-none">
                            <Image
                              src={getFullImageUrl(photo.url)}
                              alt=""
                              fill
                              unoptimized={true}
                              loading="lazy"
                              className="w-full h-full object-cover rounded-lg sm:rounded-xl border border-white/10 transition-all shadow-2xl group-hover:border-rose-500/50"
                              style={{
                                filter: `brightness(${0.4 + (z / radius) * 0.6 + 0.5}) saturate(${0.8 + (z / radius) * 0.4 + 0.2})`
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg sm:rounded-xl" />
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>

            <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 text-center pointer-events-none px-4">
              <h2 className="text-white/30 text-lg sm:text-2xl font-black tracking-[0.5em] sm:tracking-[1em] uppercase">{t.grid.sphereTitle}</h2>
              <p className="text-white/20 text-xs sm:text-sm mt-2">{t.grid.sphereDesc}</p>
              <p className="text-white/10 text-[10px] mt-4 hidden sm:block">{t.grid.clickToSpin}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={observerTarget} className="flex justify-center py-6 sm:py-10 min-h-[80px] sm:min-h-[100px]">
        {(isValidating || isFetchingMore) ? (
          <PropagateLoader color="#F43F5E" size={10} />
        ) : !hasMore && photos.length > 0 ? (
          <p className="text-gray-400 text-xs sm:text-sm">{t.grid.noMore}</p>
        ) : null}
      </div>
    </div>
  );
};

export default InfinitePhotoGrid;
