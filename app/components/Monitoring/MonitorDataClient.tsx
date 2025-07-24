'use client';

import { useState, useEffect } from 'react';
import { monitoringService } from '@/app/services/monitoringService';
import { formatRelativeTime } from '@/app/utils/timeUtils';
import { MonitorData } from '@/app/types';

interface MonitorDataClientProps {
  lang: "zh" | "en";
  initialData: MonitorData[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function MonitorDataClient({ lang, initialData, initialPagination }: MonitorDataClientProps) {
  const [monitorData, setMonitorData] = useState<MonitorData[]>(initialData);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPagination.page);

  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      const result = await monitoringService.getMonitoringDataWithPagination(page, pagination.limit);
      setMonitorData(result.data);
      setPagination(result.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('获取监控数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchData(page);
    }
  };

  // 工具函数
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

  // 生成页码数组
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div>
      {/* API Request Details */}
      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide mb-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
          </div>
        ) : (
          monitorData.map((item) => (
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
                    {formatRelativeTime(item.timestamp, lang)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            显示第 {((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} 条，
            共 {pagination.total} 条记录
          </div>
          <div className="flex items-center space-x-2">
            {/* 上一页 */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrev || loading}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pagination.hasPrev && !loading
                  ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700'
              }`}
            >
              上一页
            </button>

            {/* 页码 */}
            {generatePageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={loading}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  page === currentPage
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                }`}
              >
                {page}
              </button>
            ))}

            {/* 下一页 */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext || loading}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pagination.hasNext && !loading
                  ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700'
              }`}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 