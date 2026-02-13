'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IoClose, IoRefresh, IoRemove, IoExpand, IoContract } from 'react-icons/io5';
import dynamic from 'next/dynamic';

const WujieReact = dynamic(() => import('./WujieReact'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
      <div className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium">正在加载 AI 引擎...</p>
    </div>
  ),
});

const MIRCO_FE_URL = process.env.NEXT_PUBLIC_MIRCO_FE_URL || 'http://localhost:3002';

const isInAppWebView = () => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).ReactNativeWebView || !!(window as any).JSBridge?.isInApp;
};

const shouldUseIframe = () => {
  return process.env.NODE_ENV === 'development' || isInAppWebView();
};

// 全局事件：供 PhotoCard 等组件调用
export function sendPhotoToAi(imageUrl: string) {
  window.dispatchEvent(new CustomEvent('ai-analyze-photo', { detail: { imageUrl } }));
}

// 默认尺寸
const DEFAULT_W = 380;
const DEFAULT_H = 520;
const MIN_W = 320;
const MIN_H = 400;
const COLLAPSED_H = 48;

export default function AiChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pendingImageRef = useRef<string | null>(null);

  // 位置和尺寸
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H });
  const [initialized, setInitialized] = useState(false);

  // 拖拽状态
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // 初始化位置（右下角）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setPos({
      x: window.innerWidth - DEFAULT_W - 24,
      y: window.innerHeight - DEFAULT_H - 100,
    });
    setInitialized(true);
  }, []);

  // 预加载微前端
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      import('./WujieReact').then(({ preloadMicroApp }) => {
        preloadMicroApp('mirco-fe-ai', MIRCO_FE_URL);
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // 监听全局事件
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.imageUrl) {
        pendingImageRef.current = detail.imageUrl;
        setIsOpen(true);
        setIsMinimized(false);
        setTimeout(() => sendImageToMicroFe(detail.imageUrl), 500);
      }
    };
    window.addEventListener('ai-analyze-photo', handler);
    return () => window.removeEventListener('ai-analyze-photo', handler);
  }, []);

  const sendImageToMicroFe = useCallback((imageUrl: string) => {
    const message = { type: 'SELECT_PHOTO', imageUrl };
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(message, '*');
    }
    try {
      const wujie = (window as any).__WUJIE;
      if (wujie) wujie.bus.$emit('select-photo', imageUrl);
    } catch {}
  }, []);

  const handleAfterMount = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    if (pendingImageRef.current) {
      setTimeout(() => {
        sendImageToMicroFe(pendingImageRef.current!);
        pendingImageRef.current = null;
      }, 300);
    }
  }, [sendImageToMicroFe]);

  const handleBeforeLoad = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  useEffect(() => {
    if (!isOpen || !isLoading) return;
    const timer = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(timer);
  }, [isOpen, isLoading]);

  // === 拖拽逻辑 ===
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // 忽略按钮区域的拖拽
    if ((e.target as HTMLElement).closest('button')) return;
    isDragging.current = true;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragOffset.current = { x: clientX - pos.x, y: clientY - pos.y };

    // 拖拽时禁止 iframe 捕获事件
    if (iframeRef.current) iframeRef.current.style.pointerEvents = 'none';

    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const newX = Math.max(0, Math.min(window.innerWidth - 60, clientX - dragOffset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - COLLAPSED_H, clientY - dragOffset.current.y));
      setPos({ x: newX, y: newY });
    };

    const handleEnd = () => {
      isDragging.current = false;
      if (iframeRef.current) iframeRef.current.style.pointerEvents = 'auto';
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, []);

  // 展开/收缩
  const toggleExpand = () => {
    if (isExpanded) {
      setSize({ w: DEFAULT_W, h: DEFAULT_H });
      setPos({
        x: window.innerWidth - DEFAULT_W - 24,
        y: window.innerHeight - DEFAULT_H - 100,
      });
    } else {
      setSize({ w: Math.min(600, window.innerWidth - 48), h: Math.min(700, window.innerHeight - 80) });
      setPos({ x: Math.max(24, (window.innerWidth - 600) / 2), y: 40 });
    }
    setIsExpanded(!isExpanded);
    setIsMinimized(false);
  };

  // 当前窗口高度
  const currentH = isMinimized ? COLLAPSED_H : size.h;
  const currentW = size.w;

  if (!initialized) return null;

  return (
    <>
      {/* 入口按钮 — 悬浮在右下角，与上传按钮上方对齐 */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="fixed bottom-[136px] right-8 z-40 w-14 h-14 bg-gradient-to-br from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-full shadow-2xl shadow-sky-500/30 flex items-center justify-center group transition-all hover:scale-110"
          title="AI 摄影助手"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 transition-transform group-hover:scale-110">
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
            <line x1="9" y1="22" x2="15" y2="22" />
          </svg>
          <span className="absolute inset-0 rounded-full animate-breathe opacity-60 pointer-events-none" />
        </button>
      )}

      {/* 浮动对话窗 */}
      {isOpen && (
        <div
          ref={windowRef}
          className="fixed z-50 flex flex-col bg-white rounded-2xl shadow-2xl shadow-black/15 border border-slate-200/80 overflow-hidden select-none"
          style={{
            left: pos.x,
            top: pos.y,
            width: currentW,
            height: currentH,
            transition: isDragging.current ? 'none' : 'width 0.3s ease, height 0.3s ease',
          }}
        >
          {/* 标题栏 — 可拖拽 */}
          <div
            className="h-12 flex-shrink-0 bg-gradient-to-r from-sky-500 to-blue-500 flex items-center justify-between px-3 cursor-move"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-xs">🤖</span>
              </div>
              <span className="text-sm font-bold text-white tracking-wide">AI 摄影助手</span>
              {isLoading && (
                <IoRefresh className="w-3.5 h-3.5 text-white/70 animate-spin" />
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* 最小化 */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                title={isMinimized ? '展开' : '最小化'}
              >
                <IoRemove className="w-4 h-4" />
              </button>
              {/* 展开/收缩 */}
              <button
                onClick={toggleExpand}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                title={isExpanded ? '还原' : '放大'}
              >
                {isExpanded ? <IoContract className="w-4 h-4" /> : <IoExpand className="w-4 h-4" />}
              </button>
              {/* 关闭 */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-red-500/60 text-white/80 hover:text-white transition-colors"
                title="关闭"
              >
                <IoClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 内容区 — 最小化时隐藏 */}
          {!isMinimized && (
            <div className="flex-1 relative overflow-hidden bg-slate-50">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                  <div className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-slate-400 mt-4">正在加载 AI 引擎...</p>
                </div>
              )}

              {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                  <p className="text-sm font-medium text-red-500">加载失败</p>
                  <p className="text-xs text-slate-400 mt-1">请稍后重试</p>
                </div>
              )}

              {shouldUseIframe() ? (
                <iframe
                  ref={iframeRef}
                  src={MIRCO_FE_URL}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  onLoad={() => {
                    setIsLoading(false);
                    if (pendingImageRef.current) {
                      setTimeout(() => {
                        sendImageToMicroFe(pendingImageRef.current!);
                        pendingImageRef.current = null;
                      }, 300);
                    }
                  }}
                />
              ) : (
                <WujieReact
                  name="mirco-fe-ai"
                  url={MIRCO_FE_URL}
                  width="100%"
                  height="100%"
                  alive={true}
                  beforeLoad={handleBeforeLoad}
                  afterMount={handleAfterMount}
                />
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
