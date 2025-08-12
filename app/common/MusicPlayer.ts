import { AudioTrack, PlayerEvent, PlayerEventListener } from "../types/music-player";
import { get } from "../utils/apiUtils";

// 流式播放状态枚举
enum PlaybackMode {
  TRADITIONAL = 'traditional',  // 传统播放：完整下载后播放
  STREAMING = 'streaming'       // 流式播放：边下载边播放
}

// 缓冲状态枚举
enum BufferingState {
  IDLE = 'idle',
  BUFFERING = 'buffering',
  READY = 'ready',
  ERROR = 'error'
}

export class MusicPlayer {
  // 基础音频节点
  private audioContext: AudioContext;
  private audioSource: AudioBufferSourceNode | null = null;
  private analyser: AnalyserNode;
  private gainNode: GainNode;
  
  // 流式播放相关
  private audioElement: HTMLAudioElement | null = null;
  private mediaSource: MediaSource | null = null;
  private sourceBuffer: SourceBuffer | null = null;
  
  // 播放状态
  private currentTrack: AudioTrack | null = null;
  isPlaying: boolean = false;
  startTime: number = 0;
  pauseTime: number = 0;
  volume: number = 0.7;
  playlist: AudioTrack[] = [];
  currentIndex: number = 0;
  
  // 播放模式
  private currentPlaybackMode: PlaybackMode = PlaybackMode.TRADITIONAL;
  private isStreamingMode: boolean = false;
  private isStreamingInitialized: boolean = false;
  
  // 流式播放状态
  private streamingTrack: AudioTrack | null = null;
  private streamingBuffer: ArrayBuffer[] = [];
  private isBuffering: boolean = false;
  private bufferingState: BufferingState = BufferingState.IDLE;
  
  // 定时器和监控
  private timeUpdateInterval: number | null = null;
  private bufferUpdateInterval: number | null = null;
  private networkMonitor: NetworkMonitor;
  private preloadManager: PreloadManager;
  
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
      error: [],
      buffering: [],
      canplay: [],
      canplaythrough: [],
      progress: [],
      bufferupdate: []
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
    
    // 初始化网络监控和预加载管理器
    this.networkMonitor = new NetworkMonitor();
    this.preloadManager = new PreloadManager(this.audioContext);
    
    // 初始化流式播放支持
    this.initStreamingSupport();
  }

  /**
   * 初始化流式播放支持
   */
  private initStreamingSupport(): void {
    try {
      // 检查浏览器是否支持MediaSource
      if (typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported('audio/mpeg')) {
        this.isStreamingMode = true;
        console.log('[MusicPlayer] 流式播放模式已启用');
      } else {
        console.log('[MusicPlayer] 浏览器不支持流式播放，将使用传统播放模式');
      }
    } catch (error) {
      console.warn('[MusicPlayer] 流式播放初始化失败:', error);
      this.isStreamingMode = false;
    }
  }

  async load(src: string | AudioTrack): Promise<boolean> {
    try {
      // 清理之前的状态
      this.cleanupCurrentState();
      
      const track = typeof src === 'string' ? { src } : src;
      
              // 智能选择播放模式
        this.currentPlaybackMode = await this.selectPlaybackMode(track);
        
        if (this.currentPlaybackMode === PlaybackMode.STREAMING) {
          return await this.loadStreaming(track);
        } else {
          return await this.loadTraditional(track);
        }
    } catch (error: any) {
      console.error('[ERROR] 加载失败:', error);
      this.emit('error', error);
      return false;
    }
  }

  /**
   * 智能选择播放模式
   */
  private async selectPlaybackMode(track: AudioTrack): Promise<PlaybackMode> {
    if (!this.isStreamingMode) {
      console.log('[MusicPlayer] 浏览器不支持流式播放，使用传统模式');
      return PlaybackMode.TRADITIONAL;
    }

    try {
      // 检查网络状况
      const networkQuality = await this.networkMonitor.getNetworkQuality();
      
      // 如果网络状况良好且文件较大，使用流式播放
      if (networkQuality.isStable && networkQuality.bandwidth > 1000000) { // 1MB/s
        console.log('[MusicPlayer] 网络状况良好，使用流式播放模式');
        return PlaybackMode.STREAMING;
      } else {
        console.log('[MusicPlayer] 网络状况不佳，使用传统播放模式');
        return PlaybackMode.TRADITIONAL;
      }
    } catch (error) {
      console.warn('[MusicPlayer] 网络检测失败，使用传统播放模式:', error);
      return PlaybackMode.TRADITIONAL;
    }
  }

  /**
   * 传统播放模式：完整下载后播放
   */
  private async loadTraditional(track: AudioTrack): Promise<boolean> {
    try {
      console.log('[MusicPlayer] 使用传统播放模式加载:', track.src);
      
      const response = await fetch(track.src, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
          'Access-Control-Expose-Headers': 'Content-Length, Content-Range, X-Total-Count',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      if (!arrayBuffer.byteLength) {
        throw new Error('空的ArrayBuffer');
      }

      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.currentTrack = {
        ...track,
        buffer: audioBuffer,
        duration: audioBuffer.duration,
        lyrics: track.lyrics || []
      };
      
      this.emit('trackchange', this.currentTrack);
      
      // 预加载下一首
      this.preloadManager.preloadNext(this.playlist, this.currentIndex);
      
      return true;
    } catch (error: any) {
      console.error('[ERROR] 传统播放模式加载失败:', error);
      this.currentTrack = null;
      throw error;
    }
  }

  /**
   * 流式播放模式：边下载边播放
   */
  private async loadStreaming(track: AudioTrack): Promise<boolean> {
    try {
      console.log('[MusicPlayer] 使用流式播放模式加载:', track.src);
      
      this.streamingTrack = track;
      this.streamingBuffer = [];
      this.bufferingState = BufferingState.BUFFERING;
      
      // 设置MediaSource
      await this.setupMediaSource();
      
      // 开始流式加载
      await this.startStreamingLoad(track);
      
      return true;
    } catch (error: any) {
      console.error('[ERROR] 流式播放模式加载失败:', error);
      this.cleanupStreamingState();
      throw error;
    }
  }

  /**
   * 设置MediaSource
   */
  private async setupMediaSource(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.mediaSource = new MediaSource();
        this.audioElement = new Audio();
        
        this.audioElement.src = URL.createObjectURL(this.mediaSource);
        this.audioElement.volume = this.volume;
        
        this.setupAudioElementEvents();
        this.setupMediaSourceEvents(resolve, reject);
        
        // 设置音频元素连接到分析器
        const source = this.audioContext.createMediaElementSource(this.audioElement);
        source.connect(this.analyser);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 设置音频元素事件
   */
  private setupAudioElementEvents(): void {
    if (!this.audioElement) return;
    
    this.audioElement.addEventListener('canplay', () => {
      this.emit('canplay');
      this.bufferingState = BufferingState.READY;
    });
    
    this.audioElement.addEventListener('canplaythrough', () => {
      this.emit('canplaythrough');
    });
    
    this.audioElement.addEventListener('progress', () => {
      this.emit('progress', 0);
    });
    
    this.audioElement.addEventListener('error', (e) => {
      console.error('[ERROR] 音频元素错误:', e);
      this.emit('error', new Error('音频播放错误'));
    });
  }

  /**
   * 设置MediaSource事件
   */
  private setupMediaSourceEvents(resolve: () => void, reject: (error: any) => void): void {
    if (!this.mediaSource) return;
    
    this.mediaSource.addEventListener('sourceopen', () => {
      try {
        this.sourceBuffer = this.mediaSource!.addSourceBuffer('audio/mpeg');
        this.setupSourceBufferEvents();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
    
    this.mediaSource.addEventListener('sourceended', () => {
      console.log('[MusicPlayer] MediaSource已结束');
    });
    
    this.mediaSource.addEventListener('error', (e) => {
      console.error('[ERROR] MediaSource错误:', e);
      reject(new Error('MediaSource错误'));
    });
  }

  /**
   * 设置SourceBuffer事件
   */
  private setupSourceBufferEvents(): void {
    if (!this.sourceBuffer) return;
    
    this.sourceBuffer.addEventListener('updateend', () => {
      this.checkBufferingStatus();
    });
    
    this.sourceBuffer.addEventListener('error', (e) => {
      console.error('[ERROR] SourceBuffer错误:', e);
      this.emit('error', new Error('SourceBuffer错误'));
    });
  }

  /**
   * 开始流式加载
   */
  private async startStreamingLoad(track: AudioTrack): Promise<void> {
    try {
      const response = await fetch(track.src, {
        headers: {
          'Range': 'bytes=0-',
          'Accept': 'audio/mpeg'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }
      
      let totalBytes = 0;
      const contentLength = response.headers.get('content-length');
      const totalSize = contentLength ? parseInt(contentLength) : 0;
      
      // 设置更小的初始缓冲阈值，实现快速播放
      const initialBufferThreshold = 2 * 128000; // 2秒的音频数据
      let hasStartedPlayback = false;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        if (value) {
          totalBytes += value.length;
          const arrayBuffer = value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
          if (arrayBuffer instanceof ArrayBuffer) {
            this.streamingBuffer.push(arrayBuffer);
          }
          
          // 更新下载进度
          this.emit('progress', totalSize > 0 ? totalBytes / totalSize : 0);
          
          // 检查是否可以开始播放（降低初始缓冲阈值）
          if (!hasStartedPlayback && this.shouldStartPlayback(initialBufferThreshold)) {
            console.log('[MusicPlayer] 初始缓冲完成，开始播放');
            hasStartedPlayback = true;
            await this.startStreamingPlayback();
          }
          
          // 继续监控缓冲状态
          if (hasStartedPlayback && this.shouldStartPlayback()) {
            this.updateStreamingBuffer();
          }
        }
      }
      
      // 完成加载
      await this.finalizeStreamingLoad();
      
    } catch (error) {
      console.error('[ERROR] 流式加载失败:', error);
      throw error;
    }
  }

  /**
   * 检查是否可以开始播放
   */
  private shouldStartPlayback(customThreshold?: number): boolean {
    if (!this.sourceBuffer || this.bufferingState !== BufferingState.BUFFERING) {
      return false;
    }
    
    // 检查缓冲区大小
    const bufferSize = this.calculateBufferSize();
    const targetSize = customThreshold || this.calculateTargetBufferSize();
    
    return bufferSize >= targetSize;
  }

  /**
   * 更新流式缓冲区
   */
  private updateStreamingBuffer(): void {
    if (!this.sourceBuffer || this.sourceBuffer.updating) return;
    
    try {
      // 将缓冲的数据添加到SourceBuffer
      for (const buffer of this.streamingBuffer) {
        if (this.sourceBuffer && !this.sourceBuffer.updating) {
          this.sourceBuffer.appendBuffer(buffer);
        }
      }
      
      // 清空已处理的缓冲区
      this.streamingBuffer = [];
      
    } catch (error) {
      console.warn('[MusicPlayer] 更新流式缓冲区失败:', error);
    }
  }

  /**
   * 开始流式播放
   */
  private async startStreamingPlayback(): Promise<void> {
    try {
      if (!this.audioElement || !this.sourceBuffer) return;
      
      console.log('[MusicPlayer] 开始流式播放');
      
      // 等待SourceBuffer准备就绪
      await this.waitForSourceBufferReady();
      
      // 开始播放
      await this.audioElement.play();
      
      this.isPlaying = true;
      this.bufferingState = BufferingState.READY;
      this.emit('play', 0);
      
      // 设置时间更新
      this.setupTimeUpdate();
      
      // 开始缓冲监控
      this.startBufferMonitoring();
      
      // 立即开始处理缓冲数据
      this.updateStreamingBuffer();
      
    } catch (error) {
      console.error('[ERROR] 开始流式播放失败:', error);
      throw error;
    }
  }

  /**
   * 等待SourceBuffer准备就绪
   */
  private async waitForSourceBufferReady(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.sourceBuffer || !this.sourceBuffer.updating) {
        resolve();
        return;
      }
      
      const checkReady = () => {
        if (!this.sourceBuffer!.updating) {
          resolve();
        } else {
          setTimeout(checkReady, 10);
        }
      };
      
      checkReady();
    });
  }

  /**
   * 完成流式加载
   */
  private async finalizeStreamingLoad(): Promise<void> {
    try {
      if (!this.sourceBuffer) return;
      
      // 等待SourceBuffer准备就绪
      await this.waitForSourceBufferReady();
      
      // 标记加载完成
      if (this.mediaSource && this.mediaSource.readyState === 'open') {
        this.mediaSource.endOfStream();
      }
      
      console.log('[MusicPlayer] 流式加载完成');
      
    } catch (error) {
      console.error('[ERROR] 完成流式加载失败:', error);
    }
  }

  /**
   * 开始缓冲监控
   */
  private startBufferMonitoring(): void {
    this.clearBufferUpdate();
    
    this.bufferUpdateInterval = window.setInterval(() => {
      this.updateBufferStats();
    }, 1000);
  }

  /**
   * 更新缓冲统计
   */
  private updateBufferStats(): void {
    if (!this.audioElement) return;
    
    const buffered = this.audioElement.buffered;
    if (buffered.length > 0) {
      const currentTime = this.audioElement.currentTime;
      const bufferedEnd = buffered.end(buffered.length - 1);
      
      // 检查是否需要缓冲
      if (bufferedEnd - currentTime < 3) { // 3秒缓冲（原来是5秒）
        this.isBuffering = true;
        this.bufferingState = BufferingState.BUFFERING;
        this.emit('buffering', true);
        
        // 尝试继续加载数据
        this.continueStreamingLoad();
      } else {
        this.isBuffering = false;
        this.bufferingState = BufferingState.READY;
      }
      
      this.emit('bufferupdate', {
        buffered: buffered,
        currentTime: currentTime,
        duration: this.audioElement?.duration || 0,
        bufferSize: this.calculateBufferSize(),
        downloadProgress: 0,
        isBuffering: this.isBuffering
      });
    }
  }

  /**
   * 计算缓冲区大小
   */
  private calculateBufferSize(): number {
    return this.streamingBuffer.reduce((total, buffer) => total + buffer.byteLength, 0);
  }

  /**
   * 计算目标缓冲区大小
   */
  private calculateTargetBufferSize(): number {
    // 降低目标缓冲区大小，实现更快的播放启动
    return 3 * 128000; // 3秒的音频数据（原来是5秒）
  }

  /**
   * 继续流式加载
   */
  private continueStreamingLoad(): void {
    // 如果缓冲区不足，尝试预加载更多数据
    if (this.streamingBuffer.length > 0) {
      this.updateStreamingBuffer();
    }
  }

  /**
   * 检查缓冲状态
   */
  private checkBufferingStatus(): void {
    if (this.isBuffering && this.bufferingState === BufferingState.READY) {
      this.isBuffering = false;
      this.emit('canplay');
    }
  }

  play(): boolean {
    if (this.currentPlaybackMode === PlaybackMode.STREAMING) {
      return this.playStreaming();
    } else {
      return this.playTraditional();
    }
  }

  /**
   * 传统播放模式
   */
  private playTraditional(): boolean {
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

  /**
   * 流式播放模式
   */
  private playStreaming(): boolean {
    if (!this.audioElement || this.bufferingState !== BufferingState.READY) {
      return false;
    }

    if (!this.isPlaying) {
      this.audioElement.play().then(() => {
        this.isPlaying = true;
        this.emit('play', this.getCurrentTime());
        this.setupTimeUpdate();
      }).catch((error) => {
        console.error('[ERROR] 流式播放失败:', error);
        this.emit('error', error);
      });
      
      return true;
    }
    return false;
  }

  pause(): boolean {
    if (this.currentPlaybackMode === PlaybackMode.STREAMING) {
      return this.pauseStreaming();
    } else {
      return this.pauseTraditional();
    }
  }

  /**
   * 传统暂停模式
   */
  private pauseTraditional(): boolean {
    if (this.isPlaying && this.audioSource) {
      this.pauseTime = this.audioContext.currentTime - this.startTime;
      this.audioSource.onended = null;
      this.audioSource.stop();
      this.isPlaying = false;
      this.emit('pause', this.pauseTime);
      return true;
    }
    return false;
  }

  /**
   * 流式暂停模式
   */
  private pauseStreaming(): boolean {
    if (this.isPlaying && this.audioElement) {
      this.audioElement.pause();
      this.pauseTime = this.audioElement.currentTime;
      this.isPlaying = false;
      this.emit('pause', this.pauseTime);
      return true;
    }
    return false;
  }

  stop(): void {
    if (this.currentPlaybackMode === PlaybackMode.STREAMING) {
      this.stopStreaming();
    } else {
      this.stopTraditional();
    }
  }

  /**
   * 传统停止模式
   */
  private stopTraditional(): void {
    if (this.audioSource) {
      this.audioSource.onended = null;
      this.audioSource.stop();
      this.audioSource = null;
    }
    this.isPlaying = false;
    this.startTime = 0;
    this.pauseTime = 0;
    this.emit('stop');
  }

  /**
   * 流式停止模式
   */
  private stopStreaming(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
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
    
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    
    this.emit('volumechange', this.volume);
  }

  getCurrentTime(): number {
    if (!this.currentTrack) return 0;

    if (this.currentPlaybackMode === PlaybackMode.STREAMING) {
      return this.audioElement?.currentTime || 0;
    } else {
      if (this.isPlaying) {
        return this.audioContext.currentTime - this.startTime;
      } else {
        return this.pauseTime;
      }
    }
  }

  getDuration(): number {
    if (this.currentPlaybackMode === PlaybackMode.STREAMING) {
      return this.audioElement?.duration || 0;
    } else {
      return this.currentTrack?.duration || 0;
    }
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

  /**
   * 清除缓冲更新
   */
  private clearBufferUpdate(): void {
    if (this.bufferUpdateInterval !== null) {
      clearInterval(this.bufferUpdateInterval);
      this.bufferUpdateInterval = null;
    }
  }

  /**
   * 清理当前状态
   */
  private cleanupCurrentState(): void {
    this.stop();
    this.clearTimeUpdate();
    this.clearBufferUpdate();
    
    if (this.currentPlaybackMode === PlaybackMode.STREAMING) {
      this.cleanupStreamingState();
    }
  }

  /**
   * 清理流式播放状态
   */
  private cleanupStreamingState(): void {
    // 清理音频元素
    if (this.audioElement) {
      // 清理URL对象（在设置为null之前）
      if (this.audioElement.src && this.audioElement.src.startsWith('blob:')) {
        URL.revokeObjectURL(this.audioElement.src);
      }
      
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
    
    // 清理MediaSource
    if (this.mediaSource) {
      if (this.mediaSource.readyState === 'open') {
        this.mediaSource.endOfStream();
      }
      this.mediaSource = null;
    }
    
    // 清理SourceBuffer
    this.sourceBuffer = null;
    
    // 清理流式状态
    this.streamingTrack = null;
    this.streamingBuffer = [];
    this.isStreamingInitialized = false;
    this.isBuffering = false;
    this.bufferingState = BufferingState.IDLE;
  }

  /**
   * 强制清理所有音频资源
   */
  forceCleanupAllAudio(): void {
    this.stop();
    this.clearTimeUpdate();
    this.clearBufferUpdate();
    this.cleanupStreamingState();
    
    // 清理传统播放资源
    if (this.audioSource) {
      this.audioSource.onended = null;
      this.audioSource.stop();
      this.audioSource = null;
    }
    
    this.currentTrack = null;
    this.isPlaying = false;
    this.startTime = 0;
    this.pauseTime = 0;
  }

  /**
   * 重置所有状态
   */
  resetAllState(): void {
    this.forceCleanupAllAudio();
    this.currentIndex = 0;
    this.playlist = [];
  }

  /**
   * 获取播放器状态
   */
  getPlayerStatus(): any {
    return {
      isPlaying: this.isPlaying,
      currentTrack: this.currentTrack,
      currentIndex: this.currentIndex,
      playlistLength: this.playlist.length,
      playbackMode: this.currentPlaybackMode,
      bufferingState: this.bufferingState,
      isBuffering: this.isBuffering,
      volume: this.volume,
      currentTime: this.getCurrentTime(),
      duration: this.getDuration()
    };
  }

  /**
   * 获取缓冲状态
   */
  getBufferingStatus(): any {
    if (this.currentPlaybackMode !== PlaybackMode.STREAMING) {
      return { isStreaming: false };
    }
    
    return {
      isStreaming: true,
      bufferingState: this.bufferingState,
      isBuffering: this.isBuffering,
      bufferSize: this.calculateBufferSize(),
      targetBufferSize: this.calculateTargetBufferSize()
    };
  }

  /**
   * 获取当前播放模式
   */
  getCurrentPlaybackMode(): PlaybackMode {
    return this.currentPlaybackMode;
  }

  /**
   * 是否支持流式播放
   */
  isStreamingSupported(): boolean {
    return this.isStreamingMode;
  }

  /**
   * 强制使用流式播放模式
   */
  forceStreamingMode(force: boolean): void {
    this.isStreamingMode = force;
  }

  // 音频可视化相关方法
  getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  // 销毁播放器
  destroy(): void {
    this.forceCleanupAllAudio();
    this.audioContext.close();
    
    // 清理网络监控和预加载管理器
    if (this.networkMonitor) {
      this.networkMonitor.destroy();
    }
    if (this.preloadManager) {
      this.preloadManager.destroy();
    }
  }
}

export default MusicPlayer;

/**
 * 网络监控器 - 监控网络状况和带宽
 */
class NetworkMonitor {
  private connection: any;
  private isDestroyed: boolean = false;

  constructor() {
    this.initNetworkMonitoring();
  }

  /**
   * 初始化网络监控
   */
  private initNetworkMonitoring(): void {
    try {
      // 检查是否支持网络信息API
      if ('connection' in navigator) {
        this.connection = (navigator as any).connection;
      } else if ('mozConnection' in navigator) {
        this.connection = (navigator as any).mozConnection;
      } else if ('webkitConnection' in navigator) {
        this.connection = (navigator as any).webkitConnection;
      }
    } catch (error) {
      console.warn('[NetworkMonitor] 网络监控初始化失败:', error);
    }
  }

  /**
   * 获取网络质量信息
   */
  async getNetworkQuality(): Promise<{
    isStable: boolean;
    bandwidth: number;
    latency: number;
    connectionType: string;
  }> {
    try {
      const connectionInfo = await this.getConnectionInfo();
      const bandwidth = await this.measureBandwidth();
      const latency = await this.measureLatency();

      return {
        isStable: this.isConnectionStable(connectionInfo, bandwidth, latency),
        bandwidth,
        latency,
        connectionType: connectionInfo.type || 'unknown'
      };
    } catch (error) {
      console.warn('[NetworkMonitor] 获取网络质量失败:', error);
      return {
        isStable: false,
        bandwidth: 0,
        latency: 1000,
        connectionType: 'unknown'
      };
    }
  }

  /**
   * 获取连接信息
   */
  private async getConnectionInfo(): Promise<any> {
    if (this.connection) {
      return {
        type: this.connection.effectiveType || this.connection.type,
        downlink: this.connection.downlink,
        rtt: this.connection.rtt
      };
    }

    // 如果没有网络信息API，返回默认值
    return {
      type: 'unknown',
      downlink: 0,
      rtt: 0
    };
  }

  /**
   * 测量带宽
   */
  private async measureBandwidth(): Promise<number> {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/bandwidth-test', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          const size = parseInt(contentLength);
          const endTime = performance.now();
          const duration = (endTime - startTime) / 1000; // 转换为秒
          return size / duration; // bytes per second
        }
      }
    } catch (error) {
      // 如果带宽测试失败，使用默认值
    }

    // 默认带宽：1MB/s
    return 1000000;
  }

  /**
   * 测量延迟
   */
  private async measureLatency(): Promise<number> {
    try {
      const startTime = performance.now();
      await fetch('/api/ping', { method: 'HEAD' });
      const endTime = performance.now();
      return endTime - startTime;
    } catch (error) {
      // 如果延迟测试失败，使用默认值
      return 100;
    }
  }

  /**
   * 判断连接是否稳定
   */
  private isConnectionStable(connectionInfo: any, bandwidth: number, latency: number): boolean {
    // 带宽大于500KB/s且延迟小于200ms认为稳定
    return bandwidth > 500000 && latency < 200;
  }

  /**
   * 监听网络变化
   */
  onNetworkChange(callback: (quality: any) => void): void {
    if (this.connection && !this.isDestroyed) {
      this.connection.addEventListener('change', () => {
        this.getNetworkQuality().then(callback);
      });
    }
  }

  /**
   * 销毁网络监控器
   */
  destroy(): void {
    this.isDestroyed = true;
    this.connection = null;
  }
}

/**
 * 预加载管理器 - 管理音频文件的预加载
 */
class PreloadManager {
  private audioContext: AudioContext;
  private preloadCache: Map<string, AudioBuffer> = new Map();
  private maxCacheSize: number = 100 * 1024 * 1024; // 100MB
  private currentCacheSize: number = 0;
  private isDestroyed: boolean = false;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  /**
   * 预加载下一首歌曲
   */
  async preloadNext(playlist: AudioTrack[], currentIndex: number): Promise<void> {
    if (this.isDestroyed || playlist.length === 0) return;

    const nextIndex = (currentIndex + 1) % playlist.length;
    const nextTrack = playlist[nextIndex];

    if (nextTrack && !this.preloadCache.has(nextTrack.src)) {
      try {
        await this.preloadTrack(nextTrack);
      } catch (error) {
        console.warn('[PreloadManager] 预加载失败:', error);
      }
    }
  }

  /**
   * 预加载指定歌曲
   */
  async preloadTrack(track: AudioTrack): Promise<void> {
    if (this.isDestroyed || this.preloadCache.has(track.src)) return;

    try {
      console.log('[PreloadManager] 开始预加载:', track.src);

      const response = await fetch(track.src);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // 检查缓存大小
      this.manageCacheSize(arrayBuffer.byteLength);

      // 添加到缓存
      this.preloadCache.set(track.src, audioBuffer);
      this.currentCacheSize += arrayBuffer.byteLength;

      console.log('[PreloadManager] 预加载完成:', track.src);
    } catch (error) {
      console.error('[PreloadManager] 预加载失败:', track.src, error);
      throw error;
    }
  }

  /**
   * 管理缓存大小
   */
  private manageCacheSize(newSize: number): void {
    if (this.currentCacheSize + newSize > this.maxCacheSize) {
      // 移除最旧的缓存项
      const entries = Array.from(this.preloadCache.entries());
      if (entries.length > 0) {
        const [oldestSrc, oldestBuffer] = entries[0];
        this.preloadCache.delete(oldestSrc);
        // AudioBuffer没有length属性，使用duration * sampleRate * numberOfChannels * 2来估算大小
        const estimatedSize = oldestBuffer.duration * oldestBuffer.sampleRate * oldestBuffer.numberOfChannels * 2;
        this.currentCacheSize -= estimatedSize;
        console.log('[PreloadManager] 清理缓存:', oldestSrc);
      }
    }
  }

  /**
   * 获取预加载的音频缓冲区
   */
  getPreloadedBuffer(src: string): AudioBuffer | undefined {
    return this.preloadCache.get(src);
  }

  /**
   * 检查是否已预加载
   */
  isPreloaded(src: string): boolean {
    return this.preloadCache.has(src);
  }

  /**
   * 清理指定缓存
   */
  clearCache(src?: string): void {
    if (src) {
      const buffer = this.preloadCache.get(src);
      if (buffer) {
        this.currentCacheSize -= buffer.length;
        this.preloadCache.delete(src);
      }
    } else {
      this.preloadCache.clear();
      this.currentCacheSize = 0;
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    cacheSize: number;
    currentCacheSize: number;
    maxCacheSize: number;
    preloadedCount: number;
  } {
    return {
      cacheSize: this.currentCacheSize,
      currentCacheSize: this.currentCacheSize,
      maxCacheSize: this.maxCacheSize,
      preloadedCount: this.preloadCache.size
    };
  }

  /**
   * 销毁预加载管理器
   */
  destroy(): void {
    this.isDestroyed = true;
    this.clearCache();
    this.audioContext = null as any;
  }
}