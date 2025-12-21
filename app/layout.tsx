import { Nunito } from "next/font/google";
import "./globals.css";

import Script from 'next/script';

const inter = Nunito({ subsets: ["latin"] });


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning={true} className="scrollbar-hide">
      <head>
       
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
