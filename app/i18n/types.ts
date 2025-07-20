export type Language = 'zh' | 'en';

export interface TranslationKeys {
  // 通用
  common: {
    search: string;
    filter: string;
    clear: string;
    loading: string;
    error: string;
    retry: string;
    prev: string;
    next: string;
    page: string;
    total: string;
    results: string;
    noResults: string;
    viewDetails: string;
  };

  // 首页
  home: {
    title: string;
    subtitle: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    exploreButton: string;
    autoRedirect: string;
    modules: {
      media: {
        title: string;
        description: string;
      };
      blog: {
        title: string;
        description: string;
      };
      burrypoint: {
        title: string;
        description: string;
      };
      about: {
        title: string;
        description: string;
      };
      monitoring: {
        title: string;
        description: string;
      };
    };
    features: {
      content: {
        title: string;
        description: string;
      };
      search: {
        title: string;
        description: string;
      };
      interface: {
        title: string;
        description: string;
      };
    };
    stats: {
      movies: string;
      tvShows: string;
      free: string;
      quality: string;
    };
  };

  // 媒体页面
  media: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterTitle: string;
    clearFilters: string;
    expandFilters: string;
    collapseFilters: string;
    currentFilters: string;
    found: string;
    searching: string;
  };

  // 筛选选项
  filters: {
  
    title: string;
    more: string;
    clear: string;
    active: string;
    results: string;
    type: string;
    allTypes: string;
    movies: string;
    tvShows: string;
    sortBy: string;
    ratingHigh: string;
    ratingLow: string;
    yearNew: string;
    yearOld: string;
    ascending: string;
    descending: string;
  };

  // 媒体类型
  mediaTypes: {
    movie: string;
    tv: string;
    all: string;
  };

  // 媒体状态
  status: {
    released: string;
    ongoing: string;
    upcoming: string;
  };

  // 排序选项
  sortOptions: {
    year: string;
    rating: string;
    title: string;
  };

  // 媒体卡片
  card: {
    director: string;
    creator: string;
    cast: string;
    duration: string;
    seasons: string;
    episodes: string;
    minutes: string;
    imageLoadError: string;
  };

  // 无结果页面
  noResults: {
    title: string;
    searchMessage: string;
    filterMessage: string;
    clearButton: string;
  };

  // 页脚
  footer: {
    title: string;
    subtitle: string;
    copyright: string;
    totalContent: string;
    movies: string;
    tvShows: string;
    averageRating: string;
  };

  // 导航
  nav: {
    home: string;
    movies: string;
    tvShows: string;
    rankings: string;
    language: string;
    theme: string;
  };

  // 主题
  theme: {
    light: string;
    dark: string;
    system: string;
    switchTheme: string;
    lightDescription: string;
    darkDescription: string;
    systemDescription: string;
    switchToLight: string;
    switchToDark: string;
    switchToLanguage: string;
  };

  // 上传功能
  upload: {
    title: string;
    dragDropText: string;
    clickToSelect: string;
    supportedFormats: string;
    maxFileSize: string;
    maxFiles: string;
    files: string;
    selectFiles: string;
    uploading: string;
    uploadSuccess: string;
    uploadError: string;
    cancel: string;
    confirm: string;
    close: string;
    removeFile: string;
    fileRemoved: string;
    dragActive: string;
    preview: string;
    fileName: string;
    fileSize: string;
    fileType: string;
    progress: string;
    retry: string;
    errors: {
      fileTypeNotSupported: string;
      fileSizeExceeded: string;
      maxFilesExceeded: string;
      uploadFailed: string;
      networkError: string;
      serverError: string;
    };
  };

  pagination: {
    showing: string;
    of: string;
    to: string;
    results: string;
    previous: string;
    next: string;
    first: string;
    last: string;
    items: string;
  };

  // 媒体详情页面
  mediaDetail: string;
  comingSoon: string;

  // 监控页面
  monitoring: {
    title: string;
    frontendMonitoring: string;
    backendMonitoring: string;
    apiStatus: string;
    responseTime: string;
    statusCode: string;
    requestMethod: string;
    requestUrl: string;
    requestParams: string;
    requestBody: string;
    averageResponseTime: string;
    totalRequests: string;
    successRate: string;
    errorRate: string;
    lastUpdated: string;
    noData: string;
    loading: string;
    status: {
      success: string;
      error: string;
      warning: string;
    };
    // 前端性能监控
    performanceMetrics: string;
    pagePerformance: string;
    visitCount: string;
    overallGrade: string;
    averageMetrics: string;
    latestMetrics: string;
    lastCollected: string;
    performanceGrade: {
      good: string;
      needsImprovement: string;
      poor: string;
      unknown: string;
    };
    metrics: {
      lcp: string;
      fcp: string;
      ttfb: string;
      cls: string;
      fid: string;
    };
    noPerformanceData: string;
    noPerformanceDataDesc: string;
    // 通知相关
    syncComplete: string;
    syncCompleteMessage: string;
    dataUpdate: string;
    dataUpdateMessage: string;
    update: string;
    updateMessage: string;
    jobs: string;
    requests: string;
    errors: string;
    records: string;
  };

  // 埋点数据页面
  burrypoint: {
    title: string;
    totalEvents: string;
    totalUsers: string;
    totalSessions: string;
    todayEvents: string;
    moduleStats: string;
    deviceStats: string;
    recentEvents: string;
    webAccess: string;
    mobileAccess: string;
    unknownDevice: string;
    eventTime: string;
    user: string;
    session: string;
    module: string;
    route: string;
    noData: string;
    loading: string;
    pageView: string;
    clickEvent: string;
    customEvent: string;
    accessCount: string;
    webAccessDesc: string;
    mobileAccessDesc: string;
    unknownDeviceDesc: string;
    routes: string;
    moreRoutes: string;
    configuration: string;
    pageTracking: string;
    pageTrackingDesc: string;
    clickTracking: string;
    clickTrackingDesc: string;
    customTracking: string;
    customTrackingDesc: string;
    backToHome: string;
    unknownModule: string;
    moduleId: string;
  };
} 