"use client";

import { useRouter } from "next/navigation";
import { Language } from "../../i18n";
import { useTracker } from "../../hooks/useTracker";
import WaveBackground from "./WaveBackground";

interface Module {
  id: string;
  icon: string;
  route: string;
  gradient: string;
  title: string;
  description: string;
  position: string;
}

interface HomePageClientProps {
  lang: Language;
  modules: Module[];
  welcomeTitle: string;
  welcomeSubtitle: string;
}

export default function HomePageClient({ 
  lang, 
  modules, 
  welcomeTitle, 
  welcomeSubtitle 
}: HomePageClientProps) {
  const router = useRouter();
  const tracker = useTracker();

  // 获取服务端埋点数据
  const serverAnalytics = typeof window !== 'undefined' ? (window as any).__SERVER_ANALYTICS__ : null;

  const handleModuleClick = (route: string, moduleId: string) => {
    // 埋点记录
    tracker?.track('module_click', {
      module_id: moduleId,
      module_name: modules.find(m => m.id === moduleId)?.title || moduleId,
      route: route,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    router.push(route);
  };

  const handleModuleHover = (module: any) => {
    // hover埋点记录
    tracker?.track('module_hover', {
      module_id: module.id,
      module_name: module.title,
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <WaveBackground className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header Content */}
      <div className="text-center py-20 px-4 pt-16 md:pt-20">
        <h1 className="text-6xl font-bold text-purple-900 dark:text-purple-100 mb-6 animate-fade-in transition-colors duration-300">
          {welcomeTitle}
        </h1>
        <p className="text-2xl text-purple-700 dark:text-purple-300 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay transition-colors duration-300">
          {welcomeSubtitle}
        </p>
      </div>

      {/* 一行排布的模块 */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
          {modules.map((module, index) => (
            <div
              key={module.id}
              className="w-64 h-64 md:w-72 md:h-72 cursor-pointer group module-hover-scale"
              style={{
                animationDelay: `${index * 200}ms`
              }}
              onClick={() => handleModuleClick(module.route, module.id)}
              onMouseEnter={() => handleModuleHover(module)}
            >
              <div className={`w-full h-full rounded-full flex flex-col items-center justify-center text-white shadow-2xl dark:shadow-gray-900/50 transition-all duration-300 ease-out relative overflow-hidden ${module.gradient}`}>
                {/* 波浪背景装饰 */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 right-4 w-8 h-8 border border-white rounded-full animate-pulse"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border border-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 left-1/4 w-4 h-4 border border-white rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* 浮动元素 */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                </div>

                {/* 内容 */}
                <div className="relative z-10 text-center px-4">
                  <div className="text-4xl md:text-5xl mb-3 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                    {module.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 leading-tight">
                    {module.title}
                  </h3>
                  <p className="text-xs md:text-sm text-purple-100 leading-tight opacity-90">
                    {module.description}
                  </p>
                </div>

                {/* Hover效果环 */}
                <div className="absolute inset-0 rounded-full border-2 border-white border-opacity-0 group-hover:border-opacity-30 transition-all duration-300"></div>
                
                {/* 渐变光晕效果 */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300 transform rotate-45"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 px-4">
        <p className="text-purple-600 dark:text-purple-400 text-sm transition-colors duration-300">
          © 2025 浙ICP备2025184029号
        </p>
      </div>
    </WaveBackground>
  );
} 