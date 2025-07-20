import { NextRequest, NextResponse } from 'next/server';

const supportedLanguages = ['zh', 'en'];
const defaultLanguage = 'zh';

export function middleware(request: NextRequest) {
  // 检查路径名
  const pathname = request.nextUrl.pathname;
  
  // 检查路径是否已包含语言前缀
  const pathnameHasLocale = supportedLanguages.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // 如果路径不包含语言前缀，重定向到默认语言
  if (!pathnameHasLocale) {
    // 跳过 API 路由、静态资源等
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // 对于根路径或其他路径，重定向到默认语言
    const redirectPath = pathname === '/' 
      ? `/${defaultLanguage}` 
      : `/${defaultLanguage}${pathname}`;
    
    // 保留查询参数
    const url = new URL(redirectPath, request.url);
    // 将原始URL的查询参数复制到新URL
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
    
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // 匹配所有路径，除了 API 路由、静态资源和文件扩展名
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};