import { TranslationKeys } from '../types';

export const zh: TranslationKeys = {
  common: {
    search: '搜索',
    filter: '筛选',
    clear: '清除',
    loading: '加载中',
    error: '错误',
    retry: '重试',
    prev: '上一页',
    next: '下一页',
    page: '第',
    total: '共',
    results: '个结果',
    noResults: '无结果',
    viewDetails: '查看详情',
  },

  home: {
    title: '电影避难所',
    subtitle: '发现精彩的电影和电视剧',
    welcomeTitle: '电影避难所',
    welcomeSubtitle: '发现精彩内容',
    exploreButton: '🎬 立即探索电影避难所',
    autoRedirect: '自动跳转中',
    features: {
      content: {
        title: '丰富内容',
        description: '精选电影和电视剧',
      },
      search: {
        title: '智能搜索',
        description: '快速找到你喜爱的内容',
      },
      interface: {
        title: '精美界面',
        description: '现代化用户体验',
      },
    },
    stats: {
      movies: '精选电影',
      tvShows: '热门剧集',
      free: '免费观看',
      quality: '高清画质',
    },
  },

  media: {
    title: '电影避难所',
    subtitle: '发现精彩内容',
    searchPlaceholder: '搜索电影、电视剧、演员、导演...',
    filterTitle: '筛选选项',
    clearFilters: '清除筛选',
    expandFilters: '展开筛选',
    collapseFilters: '收起筛选',
    currentFilters: '当前筛选：',
    found: '找到',
    searching: '搜索中...',
  },

  filters: {
    type: '类型',
    genre: '类型',
    year: '年份',
    rating: '最低评分',
    status: '状态',
    sort: '排序',
    all: '全部',
    allGenres: '所有类型',
    allYears: '所有年份',
    minRating: '不限',
    allStatus: '所有状态',
    sortBy: '排序方式',
    ascending: '↑',
    descending: '↓',
    clear: '清除',
  },

  mediaTypes: {
    movie: '电影',
    tv: '电视剧',
    all: '全部',
  },

  status: {
    released: '已完结',
    ongoing: '连载中',
    upcoming: '即将上映',
  },

  sortOptions: {
    year: '年份',
    rating: '评分',
    title: '标题',
  },

  card: {
    director: '导演',
    creator: '创作者',
    cast: '演员',
    duration: '时长',
    seasons: '季',
    episodes: '集',
    minutes: '分钟',
    imageLoadError: '图片加载失败',
  },

  noResults: {
    title: '未找到内容',
    searchMessage: '未找到包含',
    filterMessage: '当前筛选条件下没有结果',
    clearButton: '清除所有筛选',
  },

  footer: {
    title: '🎬 电影避难所',
    subtitle: '发现精彩内容，享受观影时光',
    copyright: '© 2024 电影避难所. 数据仅供展示使用.',
    totalContent: '总内容数',
    movies: '电影',
    tvShows: '电视剧',
    averageRating: '平均评分',
  },

  nav: {
    home: '首页',
    movies: '电影',
    tvShows: '电视剧',
    rankings: '排行榜',
    language: '语言',
    theme: '主题',
  },

  theme: {
    light: '浅色',
    dark: '深色',
    system: '跟随系统',
    switchTheme: '切换主题',
    lightDescription: '浅色主题',
    darkDescription: '深色主题',
    systemDescription: '跟随系统设置',
  },

  upload: {
    title: '上传',
    dragDropText: '拖放文件到此处',
    clickToSelect: '点击选择文件',
    supportedFormats: '支持的文件格式',
    maxFileSize: '最大文件大小',
    maxFiles: '最大文件数量',
    files: '文件',
    selectFiles: '选择文件',
    uploading: '上传中',
    uploadSuccess: '上传成功',
    uploadError: '上传失败',
    cancel: '取消',
    confirm: '确认',
    close: '关闭',
    removeFile: '移除文件',
    fileRemoved: '文件已移除',
    dragActive: '拖放文件',
    preview: '预览',
    fileName: '文件名',
    fileSize: '文件大小',
    fileType: '文件类型',
    progress: '进度',
    retry: '重试',
    errors: {
      fileTypeNotSupported: '不支持的文件类型',
      fileSizeExceeded: '文件大小超出限制',
      maxFilesExceeded: '超出最大文件数量限制',
      uploadFailed: '上传失败',
      networkError: '网络错误',
      serverError: '服务器错误',
    },
  },
}; 