"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PropagateLoader } from "react-spinners";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { MdPlayCircleOutline, MdClose, MdPublic, MdKeyboardArrowUp, MdVolumeUp, MdVolumeOff } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { i18n } from "../config/i18n";
import { format } from "date-fns";
import { sendPhotoToAi } from "./NewsDrawer";

// 真正的小狗 SVG Base64
const PUPPY_PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZGNkY2RjIiBzdHJva2Utd2lkdGg9IjEuNSI+PHBhdGggZD0iTTEyIDljLTMgMC01LjUgMi41LTUuNSA1LjVzMi41IDUuNSA1LjUgNS41IDUuNS0yLjUgNS41LTUuNVMyIDEyIDkgMTIgOXpNMTEuNSA4YzAtLjguNy0xLjUgMS41LTEuNXMxLjUuNyAxLjUgMS41LS43IDEuNS0xLjUgMS41LTEuNS0uNy0xLjUtMS41ek00LjYgNi4xYy43LTEuNyAyLjUtMyA0LjQtM2guN2MuOCAwIDEuNS43IDEuNSAxLjVzLS43IDEuNS0xLjUgMS41SDEwYy0xLjUgMC0yLjggMS0zLjQgMi40LS4yLjUtLjguNy0xLjIuNS0uNS0uMi0uNy0uOC0uNC0xLjR6TTIwLjUgOGMtLjggMC0xLjUtLjctMS41LTEuNVMxOS43IDUgMjAuNSA1cyAxLjUuNyAxLjUgMS41LS43IDEuNS0xLjUgMS41ek0yMiAxMmMwLTEuMS0uOS0yLTItMmgtNWMtMS4xIDAtMiAuOS0yIDJzLjkgMiAyIDJoNWMxLjEgMCAyLS45IDItMnoiLz48L3N2Zz4=";

const LoadingImage = ({ src, alt, className, sizes, priority = false, style }: { 
  src: string, 
  alt: string, 
  className?: string, 
  sizes?: string,
  priority?: boolean,
  style?: React.CSSProperties
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // 提取圆角相关的类名，应用到外层容器上
  const roundedClasses = className?.split(' ').filter(c => c.startsWith('rounded-') || c.startsWith('sm:rounded-') || c.startsWith('md:rounded-') || c.startsWith('lg:rounded-')).join(' ') || '';

  return (
    <div className={`relative w-full h-full overflow-hidden ${roundedClasses}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 animate-shimmer z-10">
          <img 
            src={PUPPY_PLACEHOLDER} 
            className="w-12 h-12 opacity-20" 
            alt="Loading..." 
          />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized={true}
        className={`${className} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        sizes={sizes}
        priority={priority}
        style={style}
        onLoadingComplete={() => setIsLoaded(true)}
      />
    </div>
  );
};

// 格式化视频时长：秒 → mm:ss
const formatDuration = (seconds?: number): string => {
  if (!seconds || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const PhotoCard = ({ photo, index, columnCount, t, getFullImageUrl }: { 
  photo: any, 
  index: number, 
  columnCount: number, 
  t: any, 
  getFullImageUrl: any 
}) => {
  // === Live Photo 状态 ===
  const [isLivePlaying, setIsLivePlaying] = useState(false);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // === 视频播放状态 ===
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoState, setVideoState] = useState<'idle' | 'previewing' | 'playing' | 'paused'>('idle');
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const isVideo = photo.type === 'video';

  // Live Photo 长按处理
  const handleLivePressStart = (e: React.PointerEvent | React.TouchEvent) => {
    if (photo.type !== 'live' || !photo.liveVideoUrl) return;
    e.preventDefault?.();
    longPressTimer.current = setTimeout(() => {
      setIsLivePlaying(true);
      liveVideoRef.current?.play().catch(() => {});
    }, 300);
  };

  const handleLivePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isLivePlaying) {
      setIsLivePlaying(false);
      if (liveVideoRef.current) {
        liveVideoRef.current.pause();
        liveVideoRef.current.currentTime = 0;
      }
    }
  };

  // 视频 hover 进入：静音自动预览
  const handleVideoMouseEnter = () => {
    if (!isVideo || !videoRef.current) return;
    videoRef.current.muted = true;
    setIsMuted(true);
    videoRef.current.play().catch(() => {});
    setVideoState('previewing');
  };

  // 视频 hover 离开：停止并重置
  const handleVideoMouseLeave = () => {
    if (!isVideo || !videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setVideoState('idle');
    setIsMuted(true);
    setProgress(0);
  };

  // 视频点击：切换播放状态
  const handleVideoClick = (e: React.MouseEvent) => {
    if (!isVideo || !videoRef.current) return;
    e.stopPropagation();

    if (videoState === 'previewing') {
      // 从预览→播放（取消静音）
      videoRef.current.muted = false;
      setIsMuted(false);
      setVideoState('playing');
    } else if (videoState === 'playing') {
      // 从播放→暂停
      videoRef.current.pause();
      setVideoState('paused');
    } else if (videoState === 'paused') {
      // 从暂停→继续播放
      videoRef.current.play().catch(() => {});
      setVideoState('playing');
    }
  };

  // 静音/取消静音切换
  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  };

  // 进度条更新
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (duration > 0) setProgress(currentTime / duration);
  };

  // 进度条点击跳转
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = ratio * videoRef.current.duration;
    setProgress(ratio);
  };

  const isVideoActive = videoState !== 'idle';
  const showPlayOverlay = !isVideoActive || videoState === 'paused';
  const showControls = videoState === 'playing' || videoState === 'paused';

  // Live Photo / 非视频时的 hover 动画
  const hoverAnimation = (isLivePlaying || isVideoActive) ? {} : { scale: 1.03, y: -4 };

  return (
    <motion.div
      className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-800/50 shadow-sm hover:shadow-2xl transition-shadow duration-500 border border-gray-100/80 dark:border-gray-700/50"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: Math.min(index * 0.04, 0.4) 
      }}
      whileHover={hoverAnimation}
      onPointerDown={handleLivePressStart}
      onPointerUp={handleLivePressEnd}
      onPointerLeave={(e) => {
        handleLivePressEnd();
        handleVideoMouseLeave();
      }}
      onPointerCancel={handleLivePressEnd}
      onMouseEnter={handleVideoMouseEnter}
      onClick={isVideo ? handleVideoClick : undefined}
    >
      {isVideo ? (
        <div className="relative w-full h-full cursor-pointer bg-black">
          <video
            ref={videoRef}
            src={getFullImageUrl(photo.url)}
            poster={photo.coverUrl ? getFullImageUrl(photo.coverUrl) : undefined}
            className={`w-full h-full object-cover transition-transform duration-700 ${isVideoActive ? 'scale-100' : 'group-hover:scale-105'}`}
            playsInline
            muted
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => {
              setVideoState('paused');
              setProgress(0);
            }}
          />

          {/* 播放按钮覆盖层 */}
          <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-all duration-300 pointer-events-none ${
            showPlayOverlay ? 'opacity-100' : 'opacity-0'
          }`}>
            <motion.div 
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-sky-500/90 backdrop-blur-sm flex items-center justify-center shadow-xl shadow-sky-500/40 border-2 border-white/80"
              initial={false}
              animate={showPlayOverlay ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                {videoState === 'paused' ? (
                  <path d="M8 5v14l11-7z" />
                ) : (
                  <path d="M8 5v14l11-7z" />
                )}
              </svg>
            </motion.div>
          </div>

          {/* 视频时长标签 */}
          {photo.duration && !isVideoActive && (
            <div className="absolute bottom-2.5 right-2.5 z-20 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold tabular-nums tracking-wide">
              {formatDuration(photo.duration)}
            </div>
          )}

          {/* 静音/取消静音按钮 */}
          <AnimatePresence>
            {showControls && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                onClick={handleMuteToggle}
                className="absolute top-2.5 right-2.5 z-30 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                {isMuted ? <MdVolumeOff className="w-4 h-4" /> : <MdVolumeUp className="w-4 h-4" />}
              </motion.button>
            )}
          </AnimatePresence>

          {/* 进度条 */}
          {isVideoActive && (
            <div 
              className="absolute bottom-0 left-0 right-0 z-30 h-1 sm:h-1.5 bg-white/20 cursor-pointer group/progress"
              onClick={handleProgressClick}
            >
              <motion.div 
                className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-r-full"
                style={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
              {/* 进度条拖拽圆点 */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white shadow-md shadow-sky-500/40 opacity-0 group-hover/progress:opacity-100 transition-opacity"
                style={{ left: `calc(${progress * 100}% - 5px)` }}
              />
            </div>
          )}
        </div>
      ) : (
        <>
          <LoadingImage
            src={getFullImageUrl(photo.url)}
            alt={photo.title || t.grid.photography}
            className="object-cover group-hover:scale-105 group-hover:brightness-110"
            sizes={
              columnCount === 2 
                ? "(max-width: 768px) 50vw, 50vw" 
                : columnCount === 4 
                ? "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                : "(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 16vw"
            }
            priority={index < 4}
          />

          {/* Live Photo 视频覆盖层 */}
          {photo.type === 'live' && photo.liveVideoUrl && (
            <video
              ref={liveVideoRef}
              src={getFullImageUrl(photo.liveVideoUrl)}
              className={`live-video absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
                isLivePlaying ? 'opacity-100 z-10' : 'opacity-0'
              }`}
              playsInline
              muted
              loop
              preload="auto"
            />
          )}
        </>
      )}

      {/* LIVE 徽章 */}
      {photo.type === 'live' && (
        <div className={`absolute top-2.5 left-2.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
          isLivePlaying
            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40'
            : 'bg-black/40 backdrop-blur-sm text-white/90'
        }`}>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>{t.grid.live || 'LIVE'}</span>
        </div>
      )}

      <div className={`absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-all duration-300 translate-y-2 z-20 ${
        isVideo 
          ? (showControls ? 'opacity-100 translate-y-0' : 'opacity-0') 
          : 'opacity-0 group-hover:opacity-100 group-hover:translate-y-0'
      }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {isVideo ? (
                <>
                  {photo.title && (
                    <h3 className="text-white font-bold text-xs sm:text-sm tracking-wide line-clamp-1">
                      {photo.title}
                    </h3>
                  )}
                  {photo.duration && (
                    <p className="text-white/60 text-[8px] sm:text-[10px] tabular-nums mt-0.5">
                      {formatDuration(Math.floor((videoRef.current?.currentTime || 0)))} / {formatDuration(photo.duration)}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-white font-bold text-xs sm:text-sm tracking-wide line-clamp-1">
                    {photo.title || t.grid.untitled}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {(photo.takenAt || photo.createdAt) && (
                      <p className="text-white/70 text-[8px] sm:text-[10px]">
                        {(() => {
                          try {
                            const d = new Date(photo.takenAt || photo.createdAt || '');
                            return isNaN(d.getTime()) ? '' : format(d, 'yyyy-MM-dd HH:mm');
                          } catch { return ''; }
                        })()}
                      </p>
                    )}
                    {photo.width && photo.height && (
                      <p className="text-white/50 text-[8px] sm:text-[10px]">
                        {photo.width} × {photo.height}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            {/* AI 分析按钮 */}
            {!isVideo && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sendPhotoToAi(getFullImageUrl(photo.url));
                }}
                className="shrink-0 ml-2 px-2 py-1 rounded-lg bg-white/15 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold hover:bg-white/25 transition-all flex items-center gap-1 border border-white/10"
                title="AI 分析"
              >
                <span>🤖</span>
                <span className="hidden sm:inline">AI</span>
              </button>
            )}
          </div>
      </div>

      <div 
        className={`absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none z-30 ${
          isVideoActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
        }`}
        style={{
          border: '3px solid transparent',
          backgroundImage: 'linear-gradient(to bottom right, #0EA5E9, #38BDF8, #3B82F6)',
          backgroundOrigin: 'border-box',
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'destination-out',
          maskComposite: 'exclude',
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
        }}
      />
    </motion.div>
  );
};

interface Photo {
  id: number;
  url: string;
  coverUrl?: string;
  liveVideoUrl?: string;
  title?: string;
  width?: number;
  height?: number;
  duration?: number;
  type?: 'photo' | 'video' | 'live';
  takenAt?: string;
  createdAt?: string;
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
  const [month, setMonth] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [isSphereOpen, setIsSphereOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sphereContainerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  // 获取有数据的月份列表
  const { data: availableMonths } = useSWR<string[]>(
    '/api/upload/months',
    (url: string) => fetch(url).then(r => r.json()),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    const saved = localStorage.getItem('photo-grid-columns');
    if (saved && [2, 4, 6].includes(parseInt(saved))) {
      setColumnCount(parseInt(saved) as 2 | 4 | 6);
    }
    setIsMounted(true);
  }, []);

  // 监听滚动，控制回到顶部按钮的显示
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isSphereOpen) {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      return;
    }

    const animate = () => {
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
    const monthParam = month ? `&month=${month}` : '';
    if (pageIndex === 0) return `/api/upload/list?page=1&limit=20&category=${category}${monthParam}`;
    if (previousPageData && !previousPageData.hasMore) return null;
    return `/api/upload/list?page=${pageIndex + 1}&limit=20&category=${category}${monthParam}`;
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
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  const photos = data ? data.map((page) => page.data).flat() : [];
  const hasMore = data ? data[data.length - 1].hasMore : initialHasMore;
  const isFetchingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");

  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return url;
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

  const splitIndex = Math.ceil(photos.length / 2);
  const row1 = photos.slice(0, splitIndex);
  const row2 = photos.slice(splitIndex);

  return (
    <div className="space-y-8">
      <h2 className="sr-only">{t.metadata.title} - {t.grid.photography}</h2>

      <div className="sticky top-24 z-30 px-4 space-y-3 mb-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-1 rounded-2xl border border-sky-100/60 dark:border-sky-900/30 shadow-sm flex items-center mr-2">
              {(['all', 'photo', 'video'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`relative px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    category === cat
                      ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                      : "text-gray-500 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                  }`}
                >
                  {t.grid[cat]}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsSphereOpen(true)}
              className="hidden sm:flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-sky-100/60 dark:border-sky-900/30 shadow-sm hover:shadow-md hover:bg-sky-50 dark:hover:bg-sky-900/20 text-sky-500 transition-all font-bold group whitespace-nowrap"
            >
              <MdPublic className="w-5 h-5 sm:w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span className="text-sm sm:text-base">{t.grid.sphere}</span>
            </button>

            <button
              onClick={() => setIsSlideshowOpen(true)}
              className="hidden sm:flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-sky-100/60 dark:border-sky-900/30 shadow-sm hover:shadow-md hover:bg-sky-50 dark:hover:bg-sky-900/20 text-sky-500 transition-all font-bold group whitespace-nowrap"
            >
              <MdPlayCircleOutline className="w-5 h-5 sm:w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm sm:text-base">{t.grid.slideshow}</span>
            </button>
          </div>

          <div className="hidden sm:flex bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-1 rounded-2xl border border-sky-100/60 dark:border-sky-900/30 shadow-sm items-center self-end sm:self-auto">
            {[2, 4, 6].map((num) => (
              <button
                key={num}
                onClick={() => handleColumnCountChange(num as 2 | 4 | 6)}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  columnCount === num
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/25 scale-105"
                    : "text-gray-500 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                }`}
              >
                {t.grid.columns.replace('{num}', num.toString())}
              </button>
            ))}
          </div>
        </div>

        {/* 月份筛选器 */}
        {availableMonths && availableMonths.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap shrink-0">
              {(t.grid as any).monthFilter}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMonth(null)}
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                  month === null
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                    : "bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 border border-sky-100/40 dark:border-sky-900/20"
                }`}
              >
                {(t.grid as any).allTime}
              </button>
              {availableMonths.map((m) => (
                <button
                  key={m}
                  onClick={() => setMonth(m)}
                  className={`px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                    month === m
                      ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                      : "bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 border border-sky-100/40 dark:border-sky-900/20"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isMounted ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 px-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-gray-100 dark:bg-gray-800 animate-shimmer" />
          ))}
        </div>
      ) : (
        <div className={`grid ${gridColsClass} gap-4 sm:gap-6 px-4`}>
          {photos.map((photo, index) => (
            <PhotoCard 
              key={`${photo.id}-${photo.type}-${index}`}
              photo={photo} 
              index={index}
              columnCount={columnCount}
              t={t}
              getFullImageUrl={getFullImageUrl}
            />
          ))}
        </div>
      )}

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
              <div className="film-strip overflow-hidden">
                <div className="flex animate-scroll-right whitespace-nowrap">
                  {[...row1, ...row1, ...row1].map((photo, i) => (
                    <div key={`${photo.id}-r1-${i}`} className="inline-block px-2 sm:px-4 h-48 sm:h-72 aspect-[3/4] relative group">
                      <div className="relative w-full h-full">
                        <LoadingImage 
                          src={getFullImageUrl(photo.url)} 
                          alt="" 
                          className="object-cover rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-white/5 transition-transform duration-500 group-hover:scale-105" 
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl sm:rounded-2xl mx-2 sm:mx-4" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="film-strip overflow-hidden">
                <div className="flex animate-scroll-left whitespace-nowrap">
                  {[...row2, ...row2, ...row2].map((photo, i) => (
                    <div key={`${photo.id}-r2-${i}`} className="inline-block px-2 sm:px-4 h-48 sm:h-72 aspect-[3/4] relative group">
                      <div className="relative w-full h-full">
                        <LoadingImage 
                          src={getFullImageUrl(photo.url)} 
                          alt="" 
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
                        <LoadingImage
                          src={getFullImageUrl(photo.url)}
                          alt=""
                          className="w-full h-full object-cover rounded-lg sm:rounded-xl border border-white/10 transition-all shadow-2xl group-hover:border-sky-500/50"
                          style={{
                            filter: `brightness(${0.4 + (z / radius) * 0.6 + 0.5}) saturate(${0.8 + (z / radius) * 0.4 + 0.2})`
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg sm:rounded-xl" />
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
          <PropagateLoader color="#38BDF8" size={10} />
        ) : !hasMore && photos.length > 0 ? (
          <p className="text-gray-400 text-xs sm:text-sm">{t.grid.noMore}</p>
        ) : null}
      </div>

      {/* 回到顶部按钮 — 位于上传 + 号按钮上方，大小和风格一致 */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.4, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.4, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-8 z-40 w-14 h-14 bg-gradient-to-br from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-full shadow-2xl shadow-sky-500/30 flex items-center justify-center cursor-pointer group"
            whileHover={{ scale: 1.12, boxShadow: "0 20px 40px -8px rgba(56, 189, 248, 0.45)" }}
            whileTap={{ scale: 0.9 }}
          >
            <MdKeyboardArrowUp className="w-7 h-7 transition-transform group-hover:-translate-y-0.5" />
            <span className="absolute inset-0 rounded-full animate-breathe opacity-60 pointer-events-none" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InfinitePhotoGrid;
