import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "../globals.css";
import { notFound } from "next/navigation";
import { i18n } from "../config/i18n";

const inter = Nunito({ subsets: ["latin"] });

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const t = i18n[params.lang as "zh" | "en"] || i18n.zh;
  
  return {
    title: {
      default: t.metadata.title,
      template: `%s | ${t.metadata.title}`,
    },
    description: t.metadata.desc,
    keywords: t.metadata.keywords,
    authors: [{ name: "Doushabao" }],
    creator: "Doushabao",
    publisher: "Doushabao",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://zwg.autos"),
    alternates: {
      canonical: `/${params.lang}`,
      languages: {
        'zh-CN': '/zh',
        'en-US': '/en',
      },
    },
    openGraph: {
      title: t.metadata.ogTitle,
      description: t.metadata.ogDesc,
      url: `https://zwg.autos/${params.lang}`,
      siteName: t.metadata.title,
      locale: params.lang === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
      images: [
        {
          url: '/favicon.png',
          width: 512,
          height: 512,
          alt: t.metadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary',
      site: '@zwgautos',
      title: t.metadata.ogTitle,
      description: t.metadata.ogDesc,
      images: ['/favicon.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.png', sizes: 'any', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png' },
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
  return ['en', 'zh'].map((lang) => ({
    lang,
  }));
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  // 验证语言参数
  if (!['en', 'zh'].includes(params.lang)) {
    notFound();
  }
  return (
    <div className={inter.className}>
      {children}
    </div>
  );
} 