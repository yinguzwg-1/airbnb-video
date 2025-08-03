export interface UploadMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface UploadFile {
  id: string;
  name: string;
  size: number;
  file: File; // 添加原始文件对象
  progress: number;
  status: 'uploading' | 'paused' | 'completed' | 'error';
  error?: string;
  chunks?: ChunkInfo[];
  totalChunks?: number;
  uploadedChunks?: number;
  hash?: string;
}

export interface ChunkInfo {
  index: number;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  serverResponse?: {
    success: boolean;
    message: string;
    chunkCount: number;
    totalChunks: number;
    id: string;
    progress: number;
    status: string;
  };
}

export interface MusicMetadata {
  title: string; // 歌曲标题
  artist: string; // 歌手
  album: string; // 专辑
  genre: string; // 流派
  duration: string; // 时长
  release_date: string; // 发行日期
  language: string; // 语言
  tags: string[]; // 标签
  mood: string; // 心情
  lyrics: Array<{ time: number; text: string }>; // 歌词
  mp3: string; // 歌曲文件路径
  cover: string; // 封面图片URL
} 