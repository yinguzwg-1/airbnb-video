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
    type: string;
    genre: string;
    year: string;
    rating: string;
    status: string;
    sort: string;
    all: string;
    allGenres: string;
    allYears: string;
    minRating: string;
    allStatus: string;
    sortBy: string;
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
} 