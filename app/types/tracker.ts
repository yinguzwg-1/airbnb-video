// 埋点事件属性接口
export interface TrackerProperties {
  url?: string;
  route?: string;
  language?: string;
  page_url?: string;
  referrer?: string;
  module_id?: string;
  timestamp?: string;
  user_agent?: string;
  screen_width?: number;
  screen_height?: number;
  module_name?: string;
  // 性能指标
  lcp?: number;
  fcp?: number;
  ttfb?: number;
  cls?: number;
  fid?: number;
  performance_timestamp?: string;
  page_name?: string;
  page_title?: string;
}

// 埋点事件接口
export interface TrackerEvent {
  id: number;
  event_id?: string;
  event_time?: Date;
  user_id?: string;
  session_id?: string;
  module?: string;
  properties?: TrackerProperties;
  sdk_version?: string;
  app_id?: string;
  created_at: Date;
  updated_at: Date;
}

// 埋点事件创建接口（用于创建新事件）
export interface CreateTrackerEvent {
  event_id?: string;
  event_time?: Date;
  user_id?: string;
  session_id?: string;
  module?: string;
  properties?: TrackerProperties;
  sdk_version?: string;
  app_id?: string;
}

// 埋点事件更新接口
export interface UpdateTrackerEvent {
  event_id?: string;
  event_time?: Date;
  user_id?: string;
  session_id?: string;
  module?: string;
  properties?: TrackerProperties;
  sdk_version?: string;
  app_id?: string;
}

// 筛选参数接口
export interface TrackerFilterParams {
  event_id?: string;
  user_id?: string;
  session_id?: string;
  app_id?: string;
  start_time?: Date;
  end_time?: Date;
  sortBy?: 'event_time' | 'created_at' | 'id';
  order?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
}

// 分页参数
export interface TrackerPaginationParams {
  page: number;
  pageSize: number;
}

// API响应类型
export interface TrackerResponse {
  data: TrackerEvent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}

// 统计信息接口
export interface TrackerStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
  unique_users: number;
  unique_sessions: number;
}

// 模块统计接口
export interface ModuleStats {
  name: string;
  id: string;
  count: number;
  routes: string[];
}

// 设备统计接口
export interface DeviceStats {
  web: number;
  mobile: number;
  unknown: number;
}

// 用户事件统计接口
export interface UserEventStats {
  totalEvents: number;
  uniqueSessions: number;
  todayEvents: number;
  moduleStats: ModuleStats[];
  deviceStats: DeviceStats;
  uniqueUsers: number;
}

// 用户事件响应接口
export interface UserEventsResponse {
  events: TrackerEvent[];
  total: number;
  hasMore: boolean;
  stats: UserEventStats;

}

// 通用API响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
} 