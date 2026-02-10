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
    console.log('[WujieReact] 准备加载 wujie, url:', url);
    
    import('wujie').then(({ startApp, destroyApp }) => {
      console.log('[WujieReact] wujie 模块已加载');
      
      if (!containerRef.current) {
        console.error('[WujieReact] 容器不存在');
        return;
      }
      if (startedRef.current) {
        console.log('[WujieReact] 已经启动过，跳过');
        return;
      }
      
      startedRef.current = true;
      console.log('[WujieReact] 调用 startApp:', name, url);

      startApp({
        name,
        url,
        el: containerRef.current,
        alive,
        props,
        beforeLoad: () => {
          console.log('[WujieReact] beforeLoad 触发');
          beforeLoad?.();
        },
        afterMount: () => {
          console.log('[WujieReact] afterMount 触发');
          afterMount?.();
        },
        beforeUnmount: () => {
          console.log('[WujieReact] beforeUnmount 触发');
          beforeUnmount?.();
        },
        // 子应用激活时的回调
        activated: () => {
          console.log('[WujieReact] activated 触发');
          afterMount?.();
        },
        // 子应用加载完成后的回调
        deactivated: () => {
          console.log('[WujieReact] deactivated 触发');
        },
      }).then(() => {
        console.log('[WujieReact] startApp 完成');
        
        // 备用方案：startApp 完成后，延迟检测 iframe 并触发 afterMount
        setTimeout(() => {
          const iframe = containerRef.current?.querySelector('iframe');
          console.log('[WujieReact] 延迟检测 iframe:', iframe);
          if (iframe) {
            console.log('[WujieReact] iframe 存在，手动触发 afterMount');
            afterMount?.();
          }
        }, 500);
      }).catch((err: Error) => {
        console.error('[WujieReact] startApp 失败:', err);
      });
    }).catch((err) => {
      console.error('[WujieReact] wujie 模块加载失败:', err);
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
