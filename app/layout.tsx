import { Nunito } from "next/font/google";
import "./globals.css";

import Script from 'next/script';
import { headers } from 'next/headers';

const inter = Nunito({ subsets: ["latin"] });


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 从 URL 路径中提取语言参数，动态设置 html lang
  const headersList = headers();
  const pathname = headersList.get('x-next-url') || headersList.get('x-invoke-path') || '';
  const langMatch = pathname.match(/^\/(zh|en)/);
  const lang = langMatch ? (langMatch[1] === 'zh' ? 'zh-CN' : 'en') : 'zh-CN';

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zwg.autos';

  return (
    <html lang={lang} suppressHydrationWarning={true} className="scrollbar-hide">
      <head>
        {/* 预连接后端 API 域名，加速资源加载 */}
        <link rel="preconnect" href={siteUrl} />
        <link rel="dns-prefetch" href={siteUrl} />

        {/* 临时诊断脚本 - 开发环境使用 */}
        {process.env.NODE_ENV === 'development' && (
          <Script
            id="debug-script"
            strategy="beforeInteractive"
            src="/debug-errors.js"
          />
        )}
      </head>
      <body className={`${inter.className} scrollbar-hide overflow-y-auto`}>
        {children}
      </body>
    </html>
  );
}
