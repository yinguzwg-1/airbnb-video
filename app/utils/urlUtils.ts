import { ReadonlyURLSearchParams } from 'next/navigation';

/**
 * 构建带有查询参数的新URL
 * @param pathname 路径名
 * @param searchParams 查询参数
 * @param newLang 新语言
 * @returns 新的URL字符串
 */
export function buildLocalizedUrl(
  pathname: string, 
  searchParams: ReadonlyURLSearchParams, 
  newLang: string
): string {
  // 移除当前语言前缀
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] && (segments[0] === 'zh' || segments[0] === 'en')) {
    segments.shift();
  }
  
  // 构建新路径
  const newPath = `/${newLang}${segments.length > 0 ? '/' + segments.join('/') : ''}`;
  
  // 保留所有查询参数，但排除 lang 参数
  const newSearchParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'lang') {
      newSearchParams.set(key, value);
    }
  });
  
  const currentSearchParams = newSearchParams.toString();
  return currentSearchParams ? `${newPath}?${currentSearchParams}` : newPath;
}

/**
 * 检查URL是否包含语言前缀
 * @param pathname 路径名
 * @returns 是否包含语言前缀
 */
export function hasLanguagePrefix(pathname: string): boolean {
  return pathname.startsWith('/zh/') || pathname.startsWith('/en/') || pathname === '/zh' || pathname === '/en';
}

/**
 * 从路径中提取语言
 * @param pathname 路径名
 * @returns 语言代码或null
 */
export function extractLanguageFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] && (segments[0] === 'zh' || segments[0] === 'en')) {
    return segments[0];
  }
  return null;
}

/**
 * 从路径中移除语言前缀
 * @param pathname 路径名
 * @returns 移除语言前缀后的路径
 */
export function removeLanguagePrefix(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] && (segments[0] === 'zh' || segments[0] === 'en')) {
    segments.shift();
  }
  return segments.length > 0 ? '/' + segments.join('/') : '/';
} 