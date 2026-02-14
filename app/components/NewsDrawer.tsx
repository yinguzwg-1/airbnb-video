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

// 默认尺寸
const DEFAULT_W = 380;
const DEFAULT_H = 520;
const MIN_W = 320;
const MIN_H = 400;
export default function AiChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pendingImageRef = useRef<string | null>(null);

  // === 拖拽放置状态 ===
  const [isPhotoDragging, setIsPhotoDragging] = useState(false); // 全局：有图片正在被拖拽
  const [isDragOver, setIsDragOver] = useState(false);           // 局部：拖拽悬浮在 drop zone 上

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

  // === 向微前端发送图片（含重试机制） ===
  const sendImageToMicroFe = useCallback((imageUrl: string, retries = 3) => {
    const message = { type: 'SELECT_PHOTO', imageUrl };
    const doSend = () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(message, '*');
      }
      try {
        const wujie = (window as any).__WUJIE;
        if (wujie) wujie.bus.$emit('select-photo', imageUrl);
      } catch {}
    };
    doSend();
    // 重试机制：iframe 中 React 可能尚未水合，多发几次确保收到
    for (let i = 1; i <= retries; i++) {
      setTimeout(doSend, i * 600);
    }
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

  // 监听全局事件（从 PhotoCard 点击 AI 分析按钮触发）
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.imageUrl) {
        pendingImageRef.current = detail.imageUrl;
        if (isOpen && iframeRef.current?.contentWindow) {
          // 窗口已打开，直接发送（含重试）
          sendImageToMicroFe(detail.imageUrl);
          pendingImageRef.current = null;
        } else {
          // 窗口未打开，等 iframe onLoad 后发送
          setIsOpen(true);
        }
      }
    };
    window.addEventListener('ai-analyze-photo', handler);
    return () => window.removeEventListener('ai-analyze-photo', handler);
  }, [isOpen, sendImageToMicroFe]);

  // 监听全局拖拽状态（来自 PhotoCard 的 photo-drag-state 事件）
  useEffect(() => {
    const handler = (e: Event) => {
      const dragging = (e as CustomEvent).detail?.dragging;
      setIsPhotoDragging(!!dragging);
      if (!dragging) setIsDragOver(false);
    };
    window.addEventListener('photo-drag-state', handler);
    return () => window.removeEventListener('photo-drag-state', handler);
  }, []);

  // Drop zone 事件处理
  const handleDropZoneDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDropZoneDragLeave = useCallback((e: React.DragEvent) => {
    // 避免子元素触发 dragleave
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsPhotoDragging(false);
    const imageUrl = e.dataTransfer.getData('application/x-photo-ai') || e.dataTransfer.getData('text/plain');
    if (!imageUrl) return;

    if (isOpen && iframeRef.current?.contentWindow) {
      // 窗口已打开且 iframe 已加载，直接发送（含重试）
      sendImageToMicroFe(imageUrl);
    } else {
      // 窗口未打开，标记 pending，等 iframe onLoad 后发送
      pendingImageRef.current = imageUrl;
      setIsOpen(true);
    }
  }, [isOpen, sendImageToMicroFe]);

  const handleAfterMount = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    if (pendingImageRef.current) {
      // Wujie 挂载后也需等待微前端 React 初始化
      setTimeout(() => {
        sendImageToMicroFe(pendingImageRef.current!);
        pendingImageRef.current = null;
      }, 800);
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
      const newY = Math.max(0, Math.min(window.innerHeight - 48, clientY - dragOffset.current.y));
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
  };

  const currentH = size.h;
  const currentW = size.w;

  if (!initialized) return null;

  return (
    <>
      {/* 入口按钮 + 拖拽放置区 — 悬浮在右下角 */}
      {!isOpen && (
        <>
          {/* 拖拽中：放大的 Drop Zone（覆盖右下角大区域，更容易命中） */}
          {isPhotoDragging && (
            <div
              className={`fixed z-50 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center ${
                isDragOver
                  ? 'border-sky-400 bg-sky-50/95 shadow-2xl shadow-sky-400/40'
                  : 'border-sky-300/60 bg-sky-50/80 shadow-lg'
              }`}
              style={{ bottom: 24, right: 24, width: 160, height: 140 }}
              onDragOver={handleDropZoneDragOver}
              onDragLeave={handleDropZoneDragLeave}
              onDrop={handleDrop}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                isDragOver ? 'bg-sky-500 text-white scale-110' : 'bg-sky-200 text-sky-600'
              }`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <span className={`text-xs font-bold transition-colors ${isDragOver ? 'text-sky-600' : 'text-sky-400'}`}>
                {isDragOver ? '松手开始分析' : '拖到这里分析'}
              </span>
            </div>
          )}
          {/* 常规 FAB 按钮 */}
          <button
            onClick={() => setIsOpen(true)}
            className={`fixed bottom-[96px] right-8 z-40 w-14 h-14 bg-gradient-to-br from-sky-400 to-blue-500 text-white rounded-full shadow-lg shadow-sky-500/30 flex items-center justify-center group hover:shadow-sky-500/50 hover:scale-105 transition-all ${
              isPhotoDragging ? 'animate-pulse pointer-events-none' : ''
            }`}
            title="AI 摄影助手"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 transition-transform group-hover:scale-110">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
              <line x1="9" y1="22" x2="15" y2="22" />
            </svg>
          </button>
        </>
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
            overscrollBehavior: 'contain',
          }}
          onWheel={(e) => e.stopPropagation()}
          onDragOver={handleDropZoneDragOver}
          onDragLeave={handleDropZoneDragLeave}
          onDrop={handleDrop}
        >
          {/* 拖拽放置遮罩（窗口打开时）— 必须 pointer-events-auto 以拦截 iframe 的拖拽事件 */}
          {isPhotoDragging && (
            <div
              className={`absolute inset-0 z-[60] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 ${
                isDragOver
                  ? 'border-sky-400 bg-sky-100/90 backdrop-blur-sm'
                  : 'border-sky-300/50 bg-sky-50/70'
              }`}
              onDragOver={handleDropZoneDragOver}
              onDragLeave={handleDropZoneDragLeave}
              onDrop={handleDrop}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all ${
                isDragOver ? 'bg-sky-500 text-white scale-110' : 'bg-sky-200 text-sky-600'
              }`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <p className={`text-sm font-bold ${isDragOver ? 'text-sky-700' : 'text-sky-500'}`}>
                {isDragOver ? '松手开始 AI 分析' : '拖放照片到此处'}
              </p>
            </div>
          )}

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
              {/* 最小化（隐藏窗口，显示 FAB 按钮） */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                title="最小化"
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

          {/* 内容区 */}
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
                    // 等待微前端 React 水合完成后再发送（含重试）
                    setTimeout(() => {
                      sendImageToMicroFe(pendingImageRef.current!);
                      pendingImageRef.current = null;
                    }, 800);
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
        </div>
      )}
    </>
  );
}
