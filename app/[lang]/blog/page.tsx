"use client";

import { Language } from "../../i18n";
import { CircularLanguageSwitcher, CircularThemeSwitcher } from "../../components";

interface BlogPageProps {
  params: { lang: Language };
}

export default function BlogPage({ params }: BlogPageProps) {

  const blogPosts = [
    {
      id: 1,
      title: "欢迎来到我们的博客",
      excerpt: "在这里分享最新的技术动态和行业见解...",
      author: "Admin",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "技术"
    },
    {
      id: 2,
      title: "前端开发最佳实践",
      excerpt: "探讨现代前端开发中的关键技术和最佳实践...",
      author: "Developer",
      date: "2024-01-10",
      readTime: "8 min read",
      category: "开发"
    },
    {
      id: 3,
      title: "用户体验设计指南",
      excerpt: "如何设计出优秀的用户界面和用户体验...",
      author: "Designer",
      date: "2024-01-05",
      readTime: "6 min read",
      category: "设计"
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
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-purple-100">
              分享知识，传播价值
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Post Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <span className="text-4xl">📝</span>
              </div>

              {/* Post Content */}
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-gray-500 text-sm ml-auto">{post.readTime}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-purple-600 transition-colors duration-200">
                  {post.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {post.author.charAt(0)}
                    </div>
                    <span className="text-gray-700 text-sm ml-2">{post.author}</span>
                  </div>
                  <span className="text-gray-500 text-sm">{post.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">更多内容即将到来</h3>
          <p className="text-gray-600">我们正在准备更多精彩的文章...</p>
        </div>
      </div>
    </div>
  );
} 