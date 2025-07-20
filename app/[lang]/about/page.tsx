"use client";

import { Language } from "../../i18n";
import { CircularLanguageSwitcher, CircularThemeSwitcher } from "../../components";

interface AboutPageProps {
  params: { lang: Language };
}

export default function AboutPage({ params }: AboutPageProps) {

  const teamMembers = [
    {
      id: 1,
      name: "张三",
      role: "前端开发工程师",
      avatar: "👨‍💻",
      description: "专注于React和Next.js开发，热爱用户体验设计"
    },
    {
      id: 2,
      name: "李四",
      role: "后端开发工程师",
      avatar: "👩‍💻",
      description: "精通Node.js和数据库设计，负责API开发和系统架构"
    },
    {
      id: 3,
      name: "王五",
      role: "产品经理",
      avatar: "👨‍💼",
      description: "负责产品规划和用户体验，确保产品满足用户需求"
    },
    {
      id: 4,
      name: "赵六",
      role: "UI/UX设计师",
      avatar: "👩‍🎨",
      description: "专注于界面设计和用户体验，创造美观实用的产品"
    }
  ];

  const features = [
    {
      icon: "🚀",
      title: "高性能",
      description: "采用最新的技术栈，确保应用运行流畅快速"
    },
    {
      icon: "🔒",
      title: "安全可靠",
      description: "多重安全防护，保护用户数据和隐私"
    },
    {
      icon: "📱",
      title: "响应式设计",
      description: "完美适配各种设备，提供一致的用户体验"
    },
    {
      icon: "🛠️",
      title: "易于维护",
      description: "清晰的代码结构和完善的文档，便于维护和扩展"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-pink-50">
      {/* Header with Circular Switchers */}
      <div className="relative">
        {/* Circular Switchers */}
        <div className="absolute top-6 right-6 z-10 md:top-8 md:right-8 flex gap-3">
          <CircularLanguageSwitcher />
          <CircularThemeSwitcher />
        </div>
        
                {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-700 text-white py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">About Us</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              我们致力于为用户提供最好的数字体验，通过创新的技术和优秀的设计，
              让每一个产品都能为用户创造价值。
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">我们的使命</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            通过技术创新和用户体验优化，为用户提供简单、高效、安全的数字解决方案。
            我们相信技术的力量可以改变世界，让生活变得更加美好。
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">我们的团队</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-6xl mb-4">{member.avatar}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-purple-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">我们的成就</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">1000+</div>
              <p className="text-gray-600">活跃用户</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">50+</div>
              <p className="text-gray-600">项目完成</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
              <p className="text-gray-600">系统可用性</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <p className="text-gray-600">技术支持</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-700 rounded-2xl text-white p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">联系我们</h2>
          <p className="text-xl text-purple-100 mb-6">
            如果您有任何问题或建议，欢迎随时联系我们
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center justify-center">
              <span className="text-2xl mr-2">📧</span>
              <span>contact@example.com</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-2xl mr-2">📱</span>
              <span>+86 123 4567 8900</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 