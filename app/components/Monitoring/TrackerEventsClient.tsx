'use client';

import { useState } from 'react';
import { Language } from '@/app/i18n';
import { formatRelativeTime } from '@/app/utils/timeUtils';
import { config } from '@/app/config';

interface TrackerEvent {
  id: number;
  event_id: string;
  event_time: string;
  user_id: string;
  session_id: string;
  properties: any;
  created_at: string;
}

interface TrackerEventsClientProps {
  lang: Language;
  initialEvents: TrackerEvent[];
  totalEvents: number;
}

export default function TrackerEventsClient({ 
  lang, 
  initialEvents, 
  totalEvents 
}: TrackerEventsClientProps) {
  const [events, setEvents] = useState<TrackerEvent[]>(initialEvents);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(totalEvents > initialEvents.length);

  const fetchEvents = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${config.NEXT_PUBLIC_API_URL}/events?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        setEvents(data.data.events || []);
        setHasMore(data.data.hasMore || false);
      }
    } catch (error) {
      console.error('Failed to fetch tracker events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchEvents(page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    fetchEvents(1, size);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">📊</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">埋点事件监控</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">实时查看用户行为埋点数据</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">总事件数</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">{totalEvents}</div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>加载埋点数据中...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg font-medium mb-2">暂无埋点数据</p>
          <p className="text-sm">用户还没有产生埋点事件</p>
        </div>
      ) : (
        <>
          {/* Page Size Selector */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">每页显示:</span>
              <select
                value={pageSize}
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
              第 {currentPage} 页，共 {Math.ceil(totalEvents / pageSize)} 页
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide mb-6">
            {events.map((event) => (
              <div key={event.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                      {event.event_id}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      用户: {event.user_id}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatRelativeTime(new Date(event.event_time), lang)}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">会话ID:</span>
                    <span className="text-gray-900 dark:text-white font-mono text-xs truncate flex-1">
                      {event.session_id}
                    </span>
                  </div>
                  {event.properties && Object.keys(event.properties).length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">属性:</span>
                      <div className="text-gray-900 dark:text-white text-xs flex-1">
                        <pre className="whitespace-pre-wrap break-words">
                          {JSON.stringify(event.properties, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              显示 {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalEvents)} 条，共 {totalEvents} 条记录
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
                {currentPage} / {Math.ceil(totalEvents / pageSize)}
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
        </>
      )}
    </div>
  );
} 