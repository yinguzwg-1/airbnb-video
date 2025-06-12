import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "../globals.css";
import { TranslationProvider } from "../contexts/TranslationContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { Language, supportedLanguages } from "../i18n";
import { notFound } from "next/navigation";

const inter = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Movie Shelter",
  description: "Movie Shelter - 发现精彩的电影和电视剧",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
    ],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: { lang: string };
}

// 生成静态参数
export async function generateStaticParams() {
  return supportedLanguages.map((lang) => ({
    lang,
  }));
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  // 验证语言参数
  if (!supportedLanguages.includes(params.lang as Language)) {
    notFound();
  }

  const lang = params.lang as Language;

  return (
    <html lang={lang === 'zh' ? 'zh-CN' : 'en'} suppressHydrationWarning={true}>
      <body className={inter.className}>
        <ThemeProvider>
          <TranslationProvider initialLanguage={lang}>
            {children}
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 