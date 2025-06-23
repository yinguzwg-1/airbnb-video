import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';

export function useUrlState() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [urlState, setUrlState] = useState<Record<string, string>>({});

  // 解析URL参数
  const parseParams = useCallback(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  // 更新URL参数
  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    const newUrl = `${pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('urlStateChanged', {
      detail: { url: newUrl, params: parseParams() }
    }));
  }, [searchParams, pathname, parseParams]);

  // 监听URL变化
  useEffect(() => {
    const handleUrlChange = () => {
      const newParams = parseParams();
      setUrlState(newParams);
    };

    // 初始化
    setUrlState(parseParams());

    // 监听事件
    window.addEventListener('urlStateChanged', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('urlStateChanged', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [parseParams]);

  return {
    urlState,
    updateParams,
    getParam: (key: string, defaultValue: string = '') => urlState[key] || defaultValue,
    hasParam: (key: string) => key in urlState
  };
} 