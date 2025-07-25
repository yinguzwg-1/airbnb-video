import { Language, translations } from "../../i18n";
import { TopBar, LoadingSpinner, MonitorDataClient } from "../../components";
import { formatRelativeTime } from "@/app/utils/timeUtils";
import { config } from "@/app/config";
import { monitoringService } from "@/app/services/monitoringService";
import { FrontendPerformanceData, FrontendPerformanceSummary, getFrontendPerformanceData } from "@/app/services/frontendPerformanceService";

interface MonitoringPageProps {
  params: { lang: Language };
}

interface MonitorData {
  id: number;
  method: string;
  url: string;
  body: string;
  response: string;
  error: string;
  status_code: number;
  duration: number;
  timestamp: Date;
  query: string;
  module?: string;
}

interface ApiStats {
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  statusCodeDistribution: Record<number, number>;
}

export default async function MonitoringPage({ params }: MonitoringPageProps) {
  const t = translations[params.lang];
  
  // 服务端数据获取
  let monitorData: MonitorData[] = [];
  let monitorPagination = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  };
  let apiStats: ApiStats = {
    totalRequests: 0,
    averageResponseTime: 0,
    successRate: 0,
    errorRate: 0,
    statusCodeDistribution: {}
  };
  let frontendPerformanceData: FrontendPerformanceSummary[] = [];

  try {
    // 并行获取数据
    const [monitorDataResult, monitorStatsResult, frontendPerformanceDataResult] = await Promise.allSettled([
      monitoringService.getMonitoringDataWithPagination(1, 20),
      monitoringService.getMonitoringStats(),
      getFrontendPerformanceData(),
    ]);
    // 处理监控数据
    if (monitorDataResult.status === 'fulfilled') {
      const result = monitorDataResult.value;
      monitorData = result.data;
      monitorPagination = result.pagination;
    }

    // 处理统计数据
    if (monitorStatsResult.status === 'fulfilled') {
      const stats = monitorStatsResult.value;
      apiStats = {
        totalRequests: stats.total,
        averageResponseTime: stats.averageResponseTime,
        successRate: stats.successRate,
        errorRate: stats.errorRate,
        statusCodeDistribution: stats.statusCodeDistribution
      };
    }

    if (frontendPerformanceDataResult.status === 'fulfilled') {
      frontendPerformanceData = frontendPerformanceDataResult.value;
    }

  } catch (error) {
    console.error('Failed to load data:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Top Navigation Bar */}
      <TopBar lang={params.lang} title={t.monitoring.title} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Frontend Performance Monitoring Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">⚡</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.monitoring.frontendMonitoring}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">监控页面加载性能和用户体验指标</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">{t.monitoring.performanceMetrics}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">Web Vitals</div>
            </div>
          </div>
          
          {frontendPerformanceData.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">⚡</div>
              <p className="text-lg font-medium mb-2">{t.monitoring.noPerformanceData}</p>
              <p className="text-sm">{t.monitoring.noPerformanceDataDesc}</p>
            </div>
          ) : (
            <div>
              {/* Page Performance Details */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.monitoring.pagePerformance}</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {frontendPerformanceData.map((page, index) => {
              

                    const bgColors = [
                      'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800',
                      'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800',
                      'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800',
                      'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800',
                      'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800',
                      'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-800',
                    ];

                    // 性能指标评估函数
                    const getPerformanceGrade = (value: number, metric: string) => {
                      const thresholds = {
                        lcp: { good: 2500, poor: 4000 },
                        fcp: { good: 1800, poor: 3000 },
                        ttfb: { good: 800, poor: 1800 },
                        cls: { good: 0.1, poor: 0.25 },
                        fid: { good: 100, poor: 300 }
                      };
                      
                      const threshold = thresholds[metric as keyof typeof thresholds];
                      if (!threshold) return 'unknown';
                      
                      if (value <= threshold.good) return 'good';
                      if (value <= threshold.poor) return 'needs-improvement';
                      return 'poor';
                    };

                    const getGradeColor = (grade: string) => {
                      switch (grade) {
                        case 'good': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
                        case 'needs-improvement': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
                        case 'poor': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
                        default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
                      }
                    };

                    const getGradeText = (grade: string) => {
                      switch (grade) {
                        case 'good': return '优秀';
                        case 'needs-improvement': return '需改进';
                        case 'poor': return '较差';
                        default: return '未知';
                      }
                    };

                    const formatMetric = (value: number, metric: string) => {
                      if (metric === 'cls') return value.toFixed(1);
                      if (metric === 'fid' || metric === 'lcp' || metric === 'fcp' || metric === 'ttfb') return `${value.toFixed(1)}ms`;
                      return value.toFixed(1);
                    };

                    return (
                      <div key={page.module} className={`p-6 ${bgColors[index % bgColors.length]} rounded-xl border hover:shadow-lg transition-all duration-300`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                              {page.module}
                            </h5>
                           
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              更新时间: {formatRelativeTime(new Date(page.timestamp), params.lang)}
                            </p>
                          </div>
                         
                        </div>
                        
                        {/* 性能指标紧凑垂直排列 */}
                        <div className="space-y-2 max-w-xs">
                          {/* LCP */}
                          <div className="group relative bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 hover:shadow-lg transition-all duration-300 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="text-base font-bold text-gray-900 dark:text-white">
                                  {formatMetric(page.lcp, 'lcp')}
                                </div>
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">LCP</div>
                              </div>
                            </div>
                            
                            {/* Hover 详细信息 */}
                            <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl border border-gray-200 dark:border-gray-700 z-10 min-w-[200px]">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                                    {formatMetric(page.lcp, 'lcp')}
                                  </div>
                                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">LCP</div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(getPerformanceGrade(page.lcp, 'lcp'))}`}>
                                  {getGradeText(getPerformanceGrade(page.lcp, 'lcp'))}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                {params.lang === 'zh' ? '最大内容绘制' : 'Largest Contentful Paint'}
                              </div>
                            </div>
                          </div>

                          {/* FCP */}
                          <div className="group relative bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 hover:shadow-lg transition-all duration-300 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="text-base font-bold text-gray-900 dark:text-white">
                                  {formatMetric(page.fcp, 'fcp')}
                                </div>
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">FCP</div>
                              </div>
                            </div>
                            
                            {/* Hover 详细信息 */}
                            <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl border border-gray-200 dark:border-gray-700 z-10 min-w-[200px]">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                                    {formatMetric(page.fcp, 'fcp')}
                                  </div>
                                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">FCP</div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(getPerformanceGrade(page.fcp, 'fcp'))}`}>
                                  {getGradeText(getPerformanceGrade(page.fcp, 'fcp'))}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                {params.lang === 'zh' ? '首次内容绘制' : 'First Contentful Paint'}
                              </div>
                            </div>
                          </div>

                          {/* TTFB */}
                          <div className="group relative bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 hover:shadow-lg transition-all duration-300 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="text-base font-bold text-gray-900 dark:text-white">
                                  {formatMetric(page.ttfb, 'ttfb')}
                                </div>
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">TTFB</div>
                              </div>
                            </div>
                            
                            {/* Hover 详细信息 */}
                            <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl border border-gray-200 dark:border-gray-700 z-10 min-w-[200px]">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                                    {formatMetric(page.ttfb, 'ttfb')}
                                  </div>
                                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">TTFB</div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(getPerformanceGrade(page.ttfb, 'ttfb'))}`}>
                                  {getGradeText(getPerformanceGrade(page.ttfb, 'ttfb'))}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                {params.lang === 'zh' ? '首字节时间' : 'Time to First Byte'}
                              </div>
                            </div>
                          </div>

                          {/* CLS */}
                          <div className="group relative bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 hover:shadow-lg transition-all duration-300 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="text-base font-bold text-gray-900 dark:text-white">
                                  {formatMetric(page.cls, 'cls')}
                                </div>
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">CLS</div>
                              </div>
                            </div>
                            
                            {/* Hover 详细信息 */}
                            <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl border border-gray-200 dark:border-gray-700 z-10 min-w-[200px]">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                                    {formatMetric(page.cls, 'cls')}
                                  </div>
                                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">CLS</div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(getPerformanceGrade(page.cls, 'cls'))}`}>
                                  {getGradeText(getPerformanceGrade(page.cls, 'cls'))}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                {params.lang === 'zh' ? '累积布局偏移' : 'Cumulative Layout Shift'}
                              </div>
                            </div>
                          </div>

                          {/* FID */}
                          <div className="group relative bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 hover:shadow-lg transition-all duration-300 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="text-base font-bold text-gray-900 dark:text-white">
                                  {formatMetric(page.fid, 'fid')}
                                </div>
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">FID</div>
                              </div>
                            </div>
                            
                            {/* Hover 详细信息 */}
                            <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl border border-gray-200 dark:border-gray-700 z-10 min-w-[200px]">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                                    {formatMetric(page.fid, 'fid')}
                                  </div>
                                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">FID</div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(getPerformanceGrade(page.fid, 'fid'))}`}>
                                  {getGradeText(getPerformanceGrade(page.fid, 'fid'))}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                {params.lang === 'zh' ? '首次输入延迟' : 'First Input Delay'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 性能趋势指示器 */}
                       
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Backend API Monitoring Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🔧</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.monitoring.backendMonitoring}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">实时监控后端API性能和状态</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">{t.monitoring.lastUpdated}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{formatRelativeTime(new Date(), params.lang)}</div>
            </div>
          </div>
          
          {monitorData.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">🔧</div>
              <p className="text-lg font-medium mb-2">{t.monitoring.noData}</p>
              <p className="text-sm">暂无后端监控数据</p>
            </div>
          ) : (
            <>
              {/* Backend Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">📊</div>
                    <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {apiStats.totalRequests}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{apiStats.totalRequests}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t.monitoring.totalRequests}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">⚡</div>
                    <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      {apiStats.averageResponseTime}ms
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{apiStats.averageResponseTime}ms</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t.monitoring.averageResponseTime}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">✅</div>
                    <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      {apiStats.successRate}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{apiStats.successRate}%</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t.monitoring.successRate}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">❌</div>
                    <span className="text-sm font-medium px-2 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                      {apiStats.errorRate}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{apiStats.errorRate}%</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t.monitoring.errorRate}</p>
                </div>
              </div>

              {/* API Request Details with Pagination */}
              <MonitorDataClient 
                lang={params.lang}
                initialData={monitorData}
                initialPagination={monitorPagination}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
} 