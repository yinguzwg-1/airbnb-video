// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 获取状态图标
export const getStatusIcon = (status: 'uploading' | 'paused' | 'completed' | 'error') => {
  switch (status) {
    case 'uploading':
      return (
        <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    case 'paused':
      return (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      );
    case 'completed':
      return (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      );
    case 'error':
      return (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      );
  }
};

// 默认音乐元数据
export const getDefaultMusicMetadata = () => ({
  title: '',
  artist: '',
  album: '',
  genre: '',
  duration: '',
  release_date: '',
  language: '中文',
  tags: [],
  mood: '',
  lyrics: [],
  cover: '',
  mp3: '',
}); 