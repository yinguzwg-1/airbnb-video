
export interface AudioTrack {
  src: string;
  title?: string;
  artist?: string;
  album?: string;
  cover?: string;
  duration?: number;
  buffer?: AudioBuffer;
  genre?: string;
  lyrics?: { time: number; text: string; }[];
}

// 流式播放相关类型
export interface StreamingTrack extends AudioTrack {
  isStreaming: boolean;
  bufferSize: number;
  bufferedRanges: TimeRanges | null;
  downloadProgress: number;
}

export interface BufferStats {
  buffered: TimeRanges | null;
  currentTime: number;
  duration: number;
  bufferSize: number;
  downloadProgress: number;
  isBuffering: boolean;
}

export interface NetworkQuality {
  bandwidth: number; // Mbps
  latency: number;   // ms
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface PlayerEventMap {
  play: (currentTime: number) => void;
  pause: (currentTime: number) => void;
  stop: () => void;
  ended: () => void;
  timeupdate: (currentTime: number) => void;
  volumechange: (volume: number) => void;
  trackchange: (track: AudioTrack) => void;
  error: (error: Error) => void;
  // 流式播放相关事件
  buffering: (isBuffering: boolean) => void;
  canplay: () => void;
  canplaythrough: () => void;
  progress: (progress: number) => void;
  bufferupdate: (stats: BufferStats) => void;
}

type PlayerEvent = keyof PlayerEventMap;
type PlayerEventListener<T extends PlayerEvent> = PlayerEventMap[T];