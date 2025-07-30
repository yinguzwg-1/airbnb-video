import { Language, translations } from "../i18n";
import { CircularLanguageSwitcher, CircularThemeSwitcher, HomePageClient } from "../components";
import Swiper from "../components/Swiper";

interface HomePageProps {
  params: { lang: Language };
}

export default async function HomePage({ params }: HomePageProps) {
  // 确保语言参数有效，如果无效则使用默认语言
  const lang = params.lang && translations[params.lang] ? params.lang : 'zh';
  const t = translations[lang];
  
  // 添加防护检查
  if (!t || !t.home || !t.home.modules) {
    console.error('Translation object is missing required properties:', { lang, t });
    throw new Error('Translation configuration error');
  }
  const modules = [
    {
      id: 'media',
      icon: '🎬',
      route: `/${lang}/media`,
      gradient: 'gradient-purple-pink',
      title: t.home.modules.media.title,
      description: t.home.modules.media.description,
      position: 'top' // 顶部
    },
    {
      id: 'blog',
      icon: '📝',
      route: `/${lang}/blog`,
      gradient: 'gradient-purple-indigo',
      title: t.home.modules.blog.title,
      description: t.home.modules.blog.description,
      position: 'top-right' // 右上
    },
    {
      id: 'burrypoint',
      icon: '📊',
      route: `/${lang}/burrypoint`,
      gradient: 'gradient-purple-blue',
      title: t.home.modules.burrypoint.title,
      description: t.home.modules.burrypoint.description,
      position: 'bottom-right' // 右下
    },
    {
      id: 'monitoring',
      icon: '🔍',
      route: `/${lang}/monitoring`,
      gradient: 'gradient-purple-green',
      title: t.home.modules.monitoring.title,
      description: t.home.modules.monitoring.description,
      position: 'bottom-left' // 左下
    },
    // {
    //   id: 'about',
    //   icon: 'ℹ️',
    //   route: `/${params.lang}/about`,
    //   gradient: 'gradient-purple-violet',
    //   title: t.home.modules.about.title,
    //   description: t.home.modules.about.description,
    //   position: 'top-left' // 左上
    // }
  ];
  const carouselItems = [
    {
      id: 1,
      content: (
        <div className="h-64 bg-blue-500 flex items-center justify-center text-white text-2xl">
          Slide 1 Content
        </div>
      ),
    },
    {
      id: 2,
      content: (
        <div className="h-64 bg-green-500 flex items-center justify-center text-white text-2xl">
          Slide 2 Content
        </div>
      ),
    },
    {
      id: 3,
      content: (
        <div className="h-64 bg-purple-500 flex items-center justify-center text-white text-2xl">
          Slide 3 Content
        </div>
      ),
    },
  ];
  return (
    <div className="relative">
      {/* <div className="max-w-4xl mx-auto mt-10">
        <Swiper
          items={carouselItems}
          autoPlay={true}
          interval={2000}
          showArrows={true}
          showDots={true}
        />
      </div> */}
      {/* 语言和主题切换器 */}
      <div className="absolute top-6 right-6 z-10 md:top-8 md:right-8 flex gap-3">
        <CircularLanguageSwitcher />
        <CircularThemeSwitcher />
      </div>

      {/* 客户端交互组件 */}
      <HomePageClient 
        lang={lang}
        modules={modules}
        welcomeTitle={t.home.welcomeTitle}
        welcomeSubtitle={t.home.welcomeSubtitle}
      />
    </div>
  );
} 