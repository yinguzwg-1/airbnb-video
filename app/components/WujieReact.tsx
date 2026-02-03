'use client';

import React, { useEffect, useRef } from 'react';
import { startApp, destroyApp, preloadApp } from 'wujie';

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

  useEffect(() => {
    if (!containerRef.current || startedRef.current) return;

    startedRef.current = true;

    startApp({
      name,
      url,
      el: containerRef.current,
      alive,
      props,
      beforeLoad,
      afterMount,
      beforeUnmount,
      // 允许跨域
      fetch: (url, options) => {
        return window.fetch(url, {
          ...options,
          credentials: 'omit',
        });
      },
    });

    return () => {
      if (!alive) {
        destroyApp(name);
      }
    };
  }, [name, url, alive, props, beforeLoad, afterMount, beforeUnmount]);

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
  preloadApp({
    name,
    url,
    exec: true, // 预执行 JS
  });
}
