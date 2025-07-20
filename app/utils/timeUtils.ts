/**
 * 时间处理工具函数
 * 支持+8时区和多种格式化选项
 */

// 获取+8时区的时间
export function getLocalTime(date: Date | string): Date {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  
  // 获取当前时区偏移量（分钟）
  const localOffset = inputDate.getTimezoneOffset();
  
  // +8时区的偏移量（分钟）
  const targetOffset = -8 * 60;
  
  // 计算时区差异
  const offsetDiff = targetOffset - localOffset;
  
  // 创建新的日期对象，应用时区调整
  const localTime = new Date(inputDate.getTime() + offsetDiff * 60 * 1000);
  
  return localTime;
}

// 格式化时间为本地字符串（+8时区）
export function formatLocalTime(
  date: Date | string, 
  options: {
    lang?: 'zh' | 'en';
    format?: 'full' | 'short' | 'time' | 'date' | 'datetime';
    showSeconds?: boolean;
  } = {}
): string {
  const {
    lang = 'zh',
    format = 'datetime',
    showSeconds = false
  } = options;

  const localDate = getLocalTime(date);
  
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US';
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Shanghai' // 明确指定+8时区
  };

  // 根据格式选项调整显示内容
  switch (format) {
    case 'date':
      delete formatOptions.hour;
      delete formatOptions.minute;
      delete formatOptions.second;
      break;
    case 'time':
      delete formatOptions.year;
      delete formatOptions.month;
      delete formatOptions.day;
      break;
    case 'short':
      formatOptions.month = 'numeric';
      delete formatOptions.second;
      break;
    case 'full':
    case 'datetime':
    default:
      if (showSeconds) {
        formatOptions.second = '2-digit';
      }
      break;
  }

  return localDate.toLocaleString(locale, formatOptions);
}

// 格式化相对时间（如：2分钟前、1小时前等）
export function formatRelativeTime(date: Date | string, lang: 'zh' | 'en' = 'zh'): string {
  const localDate = getLocalTime(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - localDate.getTime()) / 1000);

  if (diffInSeconds < 0) {
    return lang === 'zh' ? '刚刚' : 'Just now';
  }

  if (diffInSeconds < 60) {
    return lang === 'zh' ? '刚刚' : 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return lang === 'zh' 
      ? `${diffInMinutes}分钟前` 
      : `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return lang === 'zh' 
      ? `${diffInHours}小时前` 
      : `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return lang === 'zh' 
      ? `${diffInDays}天前` 
      : `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  // 超过7天显示具体日期
  return formatLocalTime(localDate, { lang, format: 'date' });
}

// 格式化持续时间（如：1.5s、500ms）
export function formatDuration(duration: number): string {
  if (duration < 1000) {
    return `${duration}ms`;
  }
  return `${(duration / 1000).toFixed(2)}s`;
}

// 获取时间戳（毫秒）
export function getTimestamp(date: Date | string = new Date()): number {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  return inputDate.getTime();
}

// 检查是否为今天
export function isToday(date: Date | string): boolean {
  const localDate = getLocalTime(date);
  const today = new Date();
  
  return localDate.toDateString() === today.toDateString();
}

// 检查是否为昨天
export function isYesterday(date: Date | string): boolean {
  const localDate = getLocalTime(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return localDate.toDateString() === yesterday.toDateString();
}

// 获取友好的时间显示
export function getFriendlyTime(date: Date | string, lang: 'zh' | 'en' = 'zh'): string {
  const localDate = getLocalTime(date);
  
  if (isToday(localDate)) {
    return formatLocalTime(localDate, { lang, format: 'time' });
  }
  
  if (isYesterday(localDate)) {
    return lang === 'zh' ? '昨天' : 'Yesterday';
  }
  
  return formatLocalTime(localDate, { lang, format: 'short' });
} 