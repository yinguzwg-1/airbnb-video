'use client';

import { Language, translations } from "@/app/i18n";
import { TrackerEvent, UserEventsResponse, ModuleStats, DeviceStats } from "@/app/types/tracker";
import TopBar from "../Common/TopBar";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface BurryPointClientProps {
  lang: Language;
  data: UserEventsResponse | undefined;
  searchUserId?: string;
  currentPage?: number;
  pageSize?: number;
}

// 获取设备类型
function getDeviceType(userAgent?: string): string {
  if (!userAgent) return 'unknown';
  
  const mobileKeywords = ['Mobile', 'Android', 'iPhone', 'iPad', 'Windows Phone'];
  const isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword));
  
  return isMobile ? 'mobile' : 'web';
}

// 格式化时间
function formatTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 获取事件类型图标
function getEventIcon(eventId?: string): string {
  if (!eventId) return '📊';
  
  if (eventId.includes('page')) return '📄';
  if (eventId.includes('click')) return '🖱️';
  if (eventId.includes('custom')) return '🎯';
  
  return '📊';
}

export default function BurryPointClient({ 
  lang, 
  data,
  currentPage = 1,
  pageSize = 10, // 减少默认页面大小以提高加载速度
}: BurryPointClientProps) {
  const t = translations[lang];
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  
  const { events, total, hasMore, stats } = data || { events: [], total: 0, hasMore: false, stats: { totalEvents: 0, uniqueSessions: 0, todayEvents: 0, moduleStats: [], deviceStats: { web: 0, mobile: 0, unknown: 0 } } };
  const { uniqueUsers } = stats;
  console.log('--------stats----------------------',stats);
  // 分页处理函数
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/${lang}/burrypoint?${params.toString()}`);
  };

  const handlePageSizeChange = (size: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', size.toString());
    params.set('page', '1'); // 重置到第一页
    setLocalPageSize(size);
    router.push(`/${lang}/burrypoint?${params.toString()}`);
  };

  // 模块名称映射表 - 支持双向映射
  const moduleNameMap: Record<string, string> = {
    // 英文到当前语言（后端统一使用英文名称）
    'Data Analytics': lang === 'zh' ? '数据埋点' : 'Data Analytics',
    'Blog': lang === 'zh' ? '博客' : 'Blog',
    'Media': lang === 'zh' ? '媒体' : 'Media',
    'About': lang === 'zh' ? '关于' : 'About',
    'Performance Monitoring': lang === 'zh' ? '性能监控' : 'Performance Monitoring',
    'Home': lang === 'zh' ? '首页' : 'Home',
    'Movies': lang === 'zh' ? '电影' : 'Movies',
    'TV Shows': lang === 'zh' ? '电视剧' : 'TV Shows',
    'Rankings': lang === 'zh' ? '排行榜' : 'Rankings',
    'Upload': lang === 'zh' ? '上传' : 'Upload',
    // 中文到当前语言（兼容旧数据）
    '数据埋点': lang === 'zh' ? '数据埋点' : 'Data Analytics',
    '博客': lang === 'zh' ? '博客' : 'Blog',
    '媒体': lang === 'zh' ? '媒体' : 'Media',
    '关于': lang === 'zh' ? '关于' : 'About',
    '性能监控': lang === 'zh' ? '性能监控' : 'Performance Monitoring',
    '首页': lang === 'zh' ? '首页' : 'Home',
    '电影': lang === 'zh' ? '电影' : 'Movies',
    '电视剧': lang === 'zh' ? '电视剧' : 'TV Shows',
    '排行榜': lang === 'zh' ? '排行榜' : 'Rankings',
    '上传': lang === 'zh' ? '上传' : 'Upload',
    'Unknown Module': t.burrypoint.unknownModule
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Top Navigation Bar */}
      <TopBar lang={lang} title={t.burrypoint.title} />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">📊</div>
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                +{stats.totalEvents}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalEvents.toLocaleString()}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t.burrypoint.totalEvents}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">👥</div>
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {uniqueUsers}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{uniqueUsers}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t.burrypoint.totalUsers}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">🔄</div>
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                {stats.uniqueSessions}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.uniqueSessions.toLocaleString()}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t.burrypoint.totalSessions}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">📅</div>
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                {stats.todayEvents}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.todayEvents.toLocaleString()}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t.burrypoint.todayEvents}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Module Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.burrypoint.moduleStats}</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-hide">
              {stats.moduleStats.length > 0 ? (
                stats.moduleStats.map((module: ModuleStats, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {moduleNameMap[module.name] || module.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t.burrypoint.moduleId}: {module.id}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {t.burrypoint.routes}: {module.routes.slice(0, 3).join(', ')}
                        {module.routes.length > 3 && ` +${module.routes.length - 3}${t.burrypoint.moreRoutes}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{module.count}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t.burrypoint.accessCount}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">📊</div>
                  <p>{t.burrypoint.noData}</p>
                </div>
              )}
            </div>
          </div>

          {/* Device Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.burrypoint.deviceStats}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">💻</div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t.burrypoint.webAccess}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.burrypoint.webAccessDesc}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.deviceStats.web}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">📱</div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t.burrypoint.mobileAccess}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.burrypoint.mobileAccessDesc}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">{stats.deviceStats.mobile}</span>
              </div>
              
              {stats.deviceStats.unknown > 0 && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">❓</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t.burrypoint.unknownDevice}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t.burrypoint.unknownDeviceDesc}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-600 dark:text-gray-400">{stats.deviceStats.unknown}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-12 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.burrypoint.recentEvents}</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
            {events.length > 0 ? (
              events.map((event: TrackerEvent, index: number) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    {getEventIcon(event.event_id)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.event_id || t.burrypoint.customEvent}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.properties?.module_name && `${t.burrypoint.module}: ${moduleNameMap[event.properties.module_name] || event.properties.module_name}`}
                      {event.properties?.route && ` • ${t.burrypoint.route}: ${event.properties.route}`}
                      {event.user_id && ` • ${t.burrypoint.user}: ${event.user_id}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {event.properties?.user_agent && `${getDeviceType(event.properties.user_agent) === 'mobile' ? '📱' : '💻'} ${getDeviceType(event.properties.user_agent) === 'mobile' ? t.burrypoint.mobileAccess : t.burrypoint.webAccess}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTime(event.event_time || event.created_at)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">📊</div>
                <p>{t.burrypoint.noData}</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">每页显示:</span>
                <select
                  value={localPageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                显示 {((currentPage - 1) * localPageSize) + 1} - {Math.min(currentPage * localPageSize, total)} 条，共 {total} 条记录
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  上一页
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  {currentPage} / {Math.ceil(total / localPageSize)}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasMore}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>

       
      </div>
    </div>
  );
} 