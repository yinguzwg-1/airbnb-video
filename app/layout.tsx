import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from './contexts/ThemeContext';
import { TranslationProvider } from './contexts/TranslationContext';
import TrackerInitializer from "./components/BurryPoint/ClientTrackerProvider";
import { NotificationManager } from "./components/Common/NotificationManager";
import Script from 'next/script';

const inter = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "虫师的世界",
  description: "",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = '9527';

  return (
    <html lang="zh-CN" suppressHydrationWarning={true}>
      <head>
        <Script
          id="error-handler"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // 全局错误处理器 - 忽略来自外部脚本的错误
              window.addEventListener('error', function(event) {
                // 忽略来自 content_scripts 的错误
                if (event.filename && event.filename.includes('content_scripts')) {
                  event.preventDefault();
                  return false;
                }
                
                // 忽略 shadowRoot 相关的错误
                if (event.message && event.message.includes('shadowRoot')) {
                  event.preventDefault();
                  return false;
                }
                
                // 忽略 getShadowDomById 相关的错误
                if (event.message && event.message.includes('getShadowDomById')) {
                  event.preventDefault();
                  return false;
                }
              });
              
              // 处理未捕获的 Promise 错误
              window.addEventListener('unhandledrejection', function(event) {
                // 忽略来自 content_scripts 的错误
                if (event.reason && event.reason.message && 
                    (event.reason.message.includes('shadowRoot') || 
                     event.reason.message.includes('getShadowDomById'))) {
                  event.preventDefault();
                  return false;
                }
              });
              
              // 重写 console.error 来过滤某些错误
              const originalConsoleError = console.error;
              console.error = function(...args) {
                const message = args.join(' ');
                if (message.includes('shadowRoot') || 
                    message.includes('getShadowDomById') ||
                    message.includes('content_scripts')) {
                  return; // 不输出这些错误
                }
                originalConsoleError.apply(console, args);
              };
            `
          }}
        />
        {/* 临时诊断脚本 - 开发环境使用 */}
        {process.env.NODE_ENV === 'development' && (
          <Script
            id="debug-script"
            strategy="beforeInteractive"
            src="/debug-errors.js"
          />
        )}
      </head>
      <body className={inter.className}>

        {children}
      </body>
    </html>
  );
}
