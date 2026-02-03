'use client';

import React, { useEffect, useRef, useState } from 'react';

interface WujieReactProps {
  name: string;
  url: string;
  width?: string;
  height?: string;
  alive?: boolean;
  props?: Record<string, any>;
  beforeLoad?: () => void;
  afterMount?: () => void;
  beforeUnmount?: () => void;
}

export default function WujieReact({
  name,
  url,
  width = '100%',
  height = '100%',
  alive = true,
  props = {},
  beforeLoad,
  afterMount,
  beforeUnmount,
}: WujieReactProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const [isClient, setIsClient] = useState(false);

  // 确保只在客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current || startedRef.current) return;

    // 动态导入 wujie，确保只在客户端加载
    import('wujie').then(({ startApp, destroyApp }) => {
      if (!containerRef.current || startedRef.current) return;
      
      startedRef.current = true;

      console.log('[wujie] 开始加载微前端:', name, url);

      startApp({
        name,
        url,
        el: containerRef.current,
        alive,
        props,
        beforeLoad: () => {
          console.log('[wujie] beforeLoad');
          beforeLoad?.();
        },
        afterMount: () => {
          console.log('[wujie] afterMount - 微前端挂载成功');
          afterMount?.();
        },
        beforeUnmount: () => {
          console.log('[wujie] beforeUnmount');
          beforeUnmount?.();
        },
        // 加载完成后的回调
        activated: () => {
          console.log('[wujie] activated - 微前端激活');
          afterMount?.();
        },
      }).then(() => {
        console.log('[wujie] startApp Promise resolved');
      }).catch((err: Error) => {
        console.error('[wujie] startApp 失败:', err);
      });
    });

    return () => {
      if (!alive && startedRef.current) {
        import('wujie').then(({ destroyApp }) => {
          destroyApp(name);
        });
      }
    };
  }, [isClient, name, url, alive, props, beforeLoad, afterMount, beforeUnmount]);

  return (
    <div
      ref={containerRef}
      style={{ width, height }}
      data-wujie-app={name}
    />
  );
}

// 预加载函数，可在应用空闲时调用
export function preloadMicroApp(name: string, url: string) {
  if (typeof window === 'undefined') return;
  
  import('wujie').then(({ preloadApp }) => {
    preloadApp({
      name,
      url,
      exec: true,
    });
  });
}
