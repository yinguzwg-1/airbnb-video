'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { IoNewspaper, IoClose, IoChevronBack, IoRefresh } from 'react-icons/io5';
import dynamic from 'next/dynamic';

// 动态导入 wujie 组件（避免 SSR 问题）
const WujieReact = dynamic(() => import('./WujieReact'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
      <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium">正在加载微前端引擎...</p>
    </div>
  ),
});

// 微前端地址配置
const MIRCO_FE_URL = process.env.NEXT_PUBLIC_MIRCO_FE_URL || 'http://localhost:3002';

// 开发环境使用 iframe，生产环境使用 wujie
const isDev = process.env.NODE_ENV === 'development';

export default function NewsDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 预加载微前端（首屏渲染后空闲时执行）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 延迟预加载，不影响首屏
    const timer = setTimeout(() => {
      import('./WujieReact').then(({ preloadMicroApp }) => {
        preloadMicroApp('mirco-fe-news', MIRCO_FE_URL);
      });
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleAfterMount = useCallback(() => {
    console.log('[NewsDrawer] afterMount 回调触发');
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleBeforeLoad = useCallback(() => {
    console.log('[NewsDrawer] beforeLoad 回调触发');
    setIsLoading(true);
    setHasError(false);
  }, []);

  // 超时机制：如果 5 秒后还在 loading，自动关闭（可能是回调没触发）
  useEffect(() => {
    if (!isOpen || !isLoading) return;
    
    const timer = setTimeout(() => {
      console.log('[NewsDrawer] 加载超时，自动关闭 loading');
      setIsLoading(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isOpen, isLoading]);

  return (
    <div>
      {/* 入口按钮 - 固定在右侧 */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-white border border-r-0 border-slate-200 p-2 rounded-l-2xl shadow-xl hover:bg-rose-50 transition-colors group"
        title="打开前端新闻"
      >
        <div className="flex flex-col items-center gap-1">
          <IoNewspaper className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-lr] text-[10px] font-bold text-slate-600 tracking-widest py-1">
            实时新闻
          </span>
          <IoChevronBack className="w-3 h-3 text-slate-300" />
        </div>
      </button>

      {/* 侧边抽屉 */}
      <div 
        className={`fixed right-0 top-0 h-full z-50 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-[380px]' : 'w-0'
        } overflow-hidden`}
      >
        {/* 顶部工具栏 */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-white/95 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-3 z-10">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <IoClose className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-slate-600">前端资讯</span>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <IoRefresh className="w-4 h-4 text-slate-400 animate-spin" />
            )}
            <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
              LIVE
            </span>
          </div>
        </div>

        {/* 微前端容器 - 使用 flex 布局确保高度正确 */}
        <div className="h-full w-[380px] bg-white shadow-2xl flex flex-col">
          {/* 顶部占位（与工具栏高度一致） */}
          <div className="h-12 flex-shrink-0" />
          
          {/* 内容区域 */}
          <div className="flex-1 relative overflow-hidden">
            {isOpen && (
              <>
                {/* 加载状态 */}
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                    <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-400 mt-4">正在加载...</p>
                  </div>
                )}

                {/* 错误状态 */}
                {hasError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                    <p className="text-sm font-medium text-red-500">加载失败</p>
                    <p className="text-xs text-slate-400 mt-1">请稍后重试</p>
                  </div>
                )}

                {/* 微前端：开发用 iframe，生产用 wujie */}
                {isDev ? (
                  <iframe
                    src={MIRCO_FE_URL}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    onLoad={() => {
                      console.log('[NewsDrawer] iframe 加载完成');
                      setIsLoading(false);
                    }}
                  />
                ) : (
                  <WujieReact
                    name="mirco-fe-news"
                    url={MIRCO_FE_URL}
                    width="100%"
                    height="100%"
                    alive={true}
                    beforeLoad={handleBeforeLoad}
                    afterMount={handleAfterMount}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 遮罩层 */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30 transition-opacity"
        />
      )}
    </div>
  );
}
