"use client";

import { useEffect, useState } from "react";
import { Language, translations } from "../../i18n";
import { TopBar, LoadingSpinner } from "../../components";
import { useTracker } from "../../hooks/useTracker";
import { monitoringService } from "@/app/services/monitoringService";
import { formatRelativeTime } from "@/app/utils/timeUtils";
import { websocketService } from "@/app/services/websocketService";
import { getFrontendPerformanceSummary, FrontendPerformanceSummary, getGlobalPerformanceMetrics, GlobalPerformanceMetrics } from "@/app/services/frontendPerformanceService";

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
}

interface ApiStats {
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  statusCodeDistribution: Record<number, number>;
}

export default function MonitoringPage({ params }: MonitoringPageProps) {
  const t = translations[params.lang];
  const tracker = useTracker();
  const [monitorData, setMonitorData] = useState<MonitorData[]>([]);
  const [frontendPerformanceData, setFrontendPerformanceData] = useState<FrontendPerformanceSummary[]>([]);
  const [globalPerformanceMetrics, setGlobalPerformanceMetrics] = useState<GlobalPerformanceMetrics>({
    averageLcp: 0,
    averageFcp: 0,
    averageTtfb: 0,
    averageCls: 0,
    averageFid: 0,
    latestLcp: 0,
    latestFcp: 0,
    latestTtfb: 0,
    latestCls: 0,
    latestFid: 0,
    latestTimestamp: 0,
    totalPages: 0,
    totalVisits: 0,
  });
  const [apiStats, setApiStats] = useState<ApiStats>({
    totalRequests: 0,
    averageResponseTime: 0,
    successRate: 0,
    errorRate: 0,
    statusCodeDistribution: {}
  });
  const [loading, setLoading] = useState(true);
  const [frontendLoading, setFrontendLoading] = useState(true);

  // 加载监控数据
  useEffect(() => {
    const fetchMonitorData = async () => {
      try {
        setLoading(true);
        const data = await monitoringService.getMonitoringData();
        setMonitorData(data);

        // 计算统计数据
        const totalRequests = data.length;
        const successfulRequests = data.filter(item => item.status_code < 400).length;
        const averageResponseTime = data.reduce((sum, item) => sum + item.duration, 0) / totalRequests;
        const successRate = (successfulRequests / totalRequests) * 100;
        const errorRate = 100 - successRate;

        // 状态码分布
        const statusCodeDistribution: Record<number, number> = {};
        data.forEach(item => {
          statusCodeDistribution[item.status_code] = (statusCodeDistribution[item.status_code] || 0) + 1;
        });

        setApiStats({
          totalRequests,
          averageResponseTime: Math.round(averageResponseTime),
          successRate: Math.round(successRate * 100) / 100,
          errorRate: Math.round(errorRate * 100) / 100,
          statusCodeDistribution
        });
      } catch (error) {
        console.error('Failed to fetch monitor data:', error);
      } finally {
        setLoading(false);
      }
    }

    const fetchFrontendPerformanceData = async () => {
      try {
        setFrontendLoading(true);
        const [summaryData, globalData] = await Promise.all([
          getFrontendPerformanceSummary(),
          getGlobalPerformanceMetrics()
        ]);
        setFrontendPerformanceData(summaryData);
        setGlobalPerformanceMetrics(globalData);
      } catch (error) {
        console.error('Failed to fetch frontend performance data:', error);
      } finally {
        setFrontendLoading(false);
      }
    }

    fetchMonitorData();
    fetchFrontendPerformanceData();
  }, []);

  const getStatusCodeColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    if (statusCode >= 300 && statusCode < 400) return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    if (statusCode >= 400 && statusCode < 500) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'POST': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'PUT': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'DELETE': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const formatDuration = (duration: number) => {
    return duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(2)}s`;
  };

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
          
          {frontendLoading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <LoadingSpinner size="lg" className="mb-4" />
              <p>{t.monitoring.loading}</p>
            </div>
          ) : frontendPerformanceData.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">⚡</div>
              <p className="text-lg font-medium mb-2">{t.monitoring.noPerformanceData}</p>
              <p className="text-sm">{t.monitoring.noPerformanceDataDesc}</p>
            </div>
          ) : (
            <>
              {/* Global Performance Metrics */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.monitoring.averageMetrics}</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.monitoring.metrics.lcp}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {globalPerformanceMetrics.averageLcp > 0 ? `${(globalPerformanceMetrics.averageLcp / 1000).toFixed(1)}s` : '--'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.monitoring.metrics.fcp}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {globalPerformanceMetrics.averageFcp > 0 ? `${(globalPerformanceMetrics.averageFcp / 1000).toFixed(1)}s` : '--'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.monitoring.metrics.ttfb}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {globalPerformanceMetrics.averageTtfb > 0 ? `${globalPerformanceMetrics.averageTtfb.toFixed(0)}ms` : '--'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.monitoring.metrics.cls}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {globalPerformanceMetrics.averageCls > 0 ? globalPerformanceMetrics.averageCls.toFixed(3) : '--'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-4 rounded-lg border border-pink-200 dark:border-pink-800">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.monitoring.metrics.fid}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {globalPerformanceMetrics.averageFid > 0 ? `${globalPerformanceMetrics.averageFid.toFixed(0)}ms` : '--'}
                    </div>
                  </div>
                </div>

                {/* Latest Metrics */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.monitoring.latestMetrics}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.monitoring.metrics.lcp}</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {globalPerformanceMetrics.latestLcp > 0 ? `${(globalPerformanceMetrics.latestLcp / 1000).toFixed(1)}s` : '--'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {globalPerformanceMetrics.latestTimestamp > 0 ? formatRelativeTime(new Date(globalPerformanceMetrics.latestTimestamp), params.lang) : ''}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.monitoring.metrics.fcp}</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {globalPerformanceMetrics.latestFcp > 0 ? `${(globalPerformanceMetrics.latestFcp / 1000).toFixed(1)}s` : '--'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {globalPerformanceMetrics.latestTimestamp > 0 ? formatRelativeTime(new Date(globalPerformanceMetrics.latestTimestamp), params.lang) : ''}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.monitoring.metrics.ttfb}</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {globalPerformanceMetrics.latestTtfb > 0 ? `${globalPerformanceMetrics.latestTtfb.toFixed(0)}ms` : '--'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {globalPerformanceMetrics.latestTimestamp > 0 ? formatRelativeTime(new Date(globalPerformanceMetrics.latestTimestamp), params.lang) : ''}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.monitoring.metrics.cls}</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {globalPerformanceMetrics.latestCls > 0 ? globalPerformanceMetrics.latestCls.toFixed(3) : '--'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {globalPerformanceMetrics.latestTimestamp > 0 ? formatRelativeTime(new Date(globalPerformanceMetrics.latestTimestamp), params.lang) : ''}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-4 rounded-lg border border-pink-200 dark:border-pink-800">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.monitoring.metrics.fid}</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {globalPerformanceMetrics.latestFid > 0 ? `${globalPerformanceMetrics.latestFid.toFixed(0)}ms` : '--'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {globalPerformanceMetrics.latestTimestamp > 0 ? formatRelativeTime(new Date(globalPerformanceMetrics.latestTimestamp), params.lang) : ''}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">总页面数</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{globalPerformanceMetrics.totalPages}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.monitoring.visitCount}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{globalPerformanceMetrics.totalVisits}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.monitoring.lastCollected}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {globalPerformanceMetrics.latestTimestamp > 0 ? formatRelativeTime(new Date(globalPerformanceMetrics.latestTimestamp), params.lang) : '--'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Page Performance Details */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.monitoring.pagePerformance}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {frontendPerformanceData.map((page, index) => {
                    const getGradeColor = (grade: string) => {
                      switch (grade) {
                        case 'good': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
                        case 'needs-improvement': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
                        case 'poor': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
                        default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
                      }
                    };

                    const getGradeText = (grade: string) => {
                      switch (grade) {
                        case 'good': return t.monitoring.performanceGrade.good;
                        case 'needs-improvement': return t.monitoring.performanceGrade.needsImprovement;
                        case 'poor': return t.monitoring.performanceGrade.poor;
                        default: return t.monitoring.performanceGrade.unknown;
                      }
                    };

                    const bgColors = [
                      'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800',
                      'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800',
                      'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800',
                      'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800',
                      'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800',
                      'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-800',
                    ];

                    return (
                      <div key={page.pageName} className={`p-6 ${bgColors[index % bgColors.length]} rounded-xl border hover:shadow-lg transition-all duration-300`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                              {page.pageTitle || page.pageName}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t.monitoring.pagePerformance}
                            </p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${getGradeColor(page.overallGrade)}`}>
                            {getGradeText(page.overallGrade)}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t.monitoring.metrics.lcp}:</span>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {page.averageLcp > 0 ? `${(page.averageLcp / 1000).toFixed(1)}s` : '--'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {page.latestLcp > 0 ? `最新: ${(page.latestLcp / 1000).toFixed(1)}s` : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t.monitoring.metrics.fcp}:</span>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {page.averageFcp > 0 ? `${(page.averageFcp / 1000).toFixed(1)}s` : '--'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {page.latestFcp > 0 ? `最新: ${(page.latestFcp / 1000).toFixed(1)}s` : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t.monitoring.metrics.ttfb}:</span>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {page.averageTtfb > 0 ? `${page.averageTtfb.toFixed(0)}ms` : '--'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {page.latestTtfb > 0 ? `最新: ${page.latestTtfb.toFixed(0)}ms` : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t.monitoring.metrics.cls}:</span>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {page.averageCls > 0 ? page.averageCls.toFixed(3) : '--'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {page.latestCls > 0 ? `最新: ${page.latestCls.toFixed(3)}` : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t.monitoring.metrics.fid}:</span>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {page.averageFid > 0 ? `${page.averageFid.toFixed(0)}ms` : '--'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {page.latestFid > 0 ? `最新: ${page.latestFid.toFixed(0)}ms` : ''}
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">{t.monitoring.visitCount}:</span>
                              <span className="text-lg font-bold text-gray-900 dark:text-white">{page.totalVisits}</span>
                            </div>
                            {page.latestTimestamp > 0 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatRelativeTime(new Date(page.latestTimestamp), params.lang)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
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
          
          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <LoadingSpinner size="lg" className="mb-4" />
              <p>{t.monitoring.loading}</p>
            </div>
          ) : monitorData.length === 0 ? (
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

              {/* API Request Details */}
              <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
                {monitorData.map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMethodColor(item.method)}`}>
                          {item.method}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusCodeColor(item.status_code)}`}>
                          {item.status_code}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatDuration(item.duration)}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">URL:</span>
                        <span className="text-gray-900 dark:text-white font-mono text-xs truncate flex-1">
                          {item.url}
                        </span>
                      </div>
                      {item.query && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">Query:</span>
                          <span className="text-gray-900 dark:text-white font-mono text-xs truncate flex-1">
                            {item.query}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Time:</span>
                        <span className="text-gray-900 dark:text-white text-xs">
                          {formatRelativeTime(item.timestamp, params.lang)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 