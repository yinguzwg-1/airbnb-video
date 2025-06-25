import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from './contexts/ThemeContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { TrackerInitializer } from "./components/BurryPoint/ClientTrackerProvider";

const inter = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "电影避难所",
  description: "电影避难所 - 发现精彩的电影和电视剧",
  icons: {
    icon: [
      { url: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = '1234567890';

  return (
    <html lang="zh-CN" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <ThemeProvider>
          <TranslationProvider>
            <TrackerInitializer userId={userId}>
              {children}
            </TrackerInitializer>
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
