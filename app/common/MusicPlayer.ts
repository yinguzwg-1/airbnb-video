import { AudioTrack, PlayerEvent, PlayerEventListener } from "../types/music-player";

export class MusicPlayer {
  private audioContext: AudioContext;
  private audioSource: AudioBufferSourceNode | null = null;
  private analyser: AnalyserNode;
  private gainNode: GainNode;
  private currentTrack: AudioTrack | null = null;
  isPlaying: boolean = false;
  startTime: number = 0;
  pauseTime: number = 0;
  volume: number = 0.7;
  playlist: AudioTrack[] = [];
  currentIndex: number = 0;
  timeUpdateInterval: number | null = null;
  events: {
    [K in PlayerEvent]: PlayerEventListener<K>[];
  } = {
      play: [],
      pause: [],
      stop: [],
      ended: [],
      timeupdate: [],
      volumechange: [],
      trackchange: [],
      error: []
    };

  constructor() {
    // 检查是否在浏览器环境中
    if (typeof window === 'undefined') {
      throw new Error('MusicPlayer只能在浏览器环境中使用');
    }
    
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.gainNode = this.audioContext.createGain();

    // 初始化音频节点连接
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = this.volume;
  }

  async load(src: string | AudioTrack): Promise<boolean> {
    try {
      this.stop();
      const track = typeof src === 'string' ? { src } : src;

      // 1. 测试网络请求
      console.log('[DEBUG] 开始加载音频:', track.src);
      const response = await fetch(track.src);

      if (!response.ok) {
        console.error('[ERROR] 响应状态异常:', response.status, response.statusText);
        return false;
      }

      // 2. 测试ArrayBuffer转换
      const arrayBuffer = await response.arrayBuffer();
      if (!arrayBuffer.byteLength) {
        console.error('[ERROR] 空的ArrayBuffer');
        return false;
      }

      // 3. 测试音频解码
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
        .catch(decodeError => {
          console.error('[ERROR] 音频解码失败:', decodeError);
          throw decodeError;
        });

      console.log('[DEBUG] 音频加载成功, 时长:', audioBuffer.duration);

      this.currentTrack = {
        ...track,
        buffer: audioBuffer,
        duration: audioBuffer.duration,
        lyrics: track.lyrics || []
      };
      this.emit('trackchange', this.currentTrack);
      return true;

    } catch (error: any) {
      console.error('[ERROR] 加载全流程失败:', {
        error: error.message,
        stack: error.stack,
        src: this.currentTrack?.src
      });
      this.emit('error', error);
      return false;
    }
  }

  play(): boolean {
    if (!this.currentTrack?.buffer) return false;

    if (!this.isPlaying) {
      this.audioSource = this.audioContext.createBufferSource();
      this.audioSource.buffer = this.currentTrack.buffer;
      this.audioSource.connect(this.analyser);

      const offset = this.pauseTime || 0;
      this.audioSource.start(0, offset);
      this.startTime = this.audioContext.currentTime - offset;
      this.isPlaying = true;

      this.audioSource.onended = () => {
        this.isPlaying = false;
        this.emit('ended');
        this.playNext();
      };

      this.emit('play', this.getCurrentTime());
      this.setupTimeUpdate();
      return true;
    }
    return false;
  }

  pause(): boolean {
    if (this.isPlaying && this.audioSource) {
      this.pauseTime = this.audioContext.currentTime - this.startTime;
      // 清除 onended 回调，避免触发 playNext
      this.audioSource.onended = null;
      this.audioSource.stop();
      this.isPlaying = false;
      this.emit('pause', this.pauseTime);
      return true;
    }
    return false;
  }

  stop(): void {
    if (this.audioSource) {
      // 清除 onended 回调，避免触发 playNext
      this.audioSource.onended = null;
      this.audioSource.stop();
      this.audioSource = null;
    }
    this.isPlaying = false;
    this.startTime = 0;
    this.pauseTime = 0;
    this.emit('stop');
  }

  seek(time: number): void {
    if (!this.currentTrack) return;

    const wasPlaying = this.isPlaying;
    this.stop();
    this.pauseTime = Math.max(0, Math.min(time, this.currentTrack.duration || 0));

    if (wasPlaying) {
      this.play();
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.gainNode.gain.value = this.volume;
    this.emit('volumechange', this.volume);
  }

  getCurrentTime(): number {
    if (!this.currentTrack) return 0;

    if (this.isPlaying) {
      return this.audioContext.currentTime - this.startTime;
    } else {
      return this.pauseTime;
    }
  }

  getDuration(): number {
    return this.currentTrack?.duration || 0;
  }

  playNext(): void {
    if (this.playlist.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
      this.load(this.playlist[this.currentIndex]).then(() => this.play());
    }
  }

  playPrevious(): void {
    if (this.playlist.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
      this.load(this.playlist[this.currentIndex]).then(() => this.play());
    }
  }

  addToPlaylist(track: AudioTrack | AudioTrack[]): void {
    if (Array.isArray(track)) {
      this.playlist.push(...track);
    } else {
      this.playlist.push(track);
    }
  }

  clearPlaylist(): void {
    this.playlist = [];
    this.currentIndex = 0;
  }

  on<T extends PlayerEvent>(event: T, listener: PlayerEventListener<T>): void {
    this.events[event].push(listener as any);
  }

  off<T extends PlayerEvent>(event: T, listener: PlayerEventListener<T>): void {
    const index = this.events[event].indexOf(listener as any);
    if (index !== -1) {
      this.events[event].splice(index, 1);
    }
  }

  private emit<T extends PlayerEvent>(event: T, ...args: Parameters<PlayerEventListener<T>>): void {
    this.events[event].forEach(listener => {
      try {
        (listener as any)(...args);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });

    // 特殊处理timeupdate事件
    if (event === 'play') {
      this.setupTimeUpdate();
    } else if (event === 'pause' || event === 'stop') {
      this.clearTimeUpdate();
    }
  }

  private setupTimeUpdate(): void {
    this.clearTimeUpdate();

    this.timeUpdateInterval = window.setInterval(() => {
      if (this.isPlaying) {
        this.emit('timeupdate', this.getCurrentTime());
      }
    }, 1000);
  }

  private clearTimeUpdate(): void {
    if (this.timeUpdateInterval !== null) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  // 音频可视化相关方法
  getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  // 销毁播放器
  destroy(): void {
    this.stop();
    this.clearTimeUpdate();
    this.audioContext.close();
  }
}

export default MusicPlayer;