import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "../globals.css";
import { TranslationProvider } from "../contexts/TranslationContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { Language, supportedLanguages, translations } from "../i18n";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ComponentLoading } from "../components/LoadingSpinner";

const inter = Nunito({ subsets: ["latin"] });

export async function generateMetadata({ params }: { params: { lang: Language } }): Promise<Metadata> {
  // 验证语言参数
  if (!supportedLanguages.includes(params.lang as Language)) {
    notFound();
  }

  const t = translations[params.lang as Language];
  
  return {
    title: t.home.title,
    description: t.home.subtitle,
    icons: {
      icon: [
        { url: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      ],
    },
  };
}

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
    <div className={inter.className}>
      <ThemeProvider>
        <Suspense fallback={<ComponentLoading />}>
          <TranslationProvider initialLanguage={lang}>
            {children}
          </TranslationProvider>
        </Suspense>
      </ThemeProvider>
    </div>
  );
} 