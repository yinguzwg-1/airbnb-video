import { AudioTrack, PlayerEvent, PlayerEventListener } from "../types/music-player";
import { get } from "../utils/apiUtils";

// 播放模式枚举
export enum PlaybackMode {
  TRADITIONAL = 'traditional',  // 传统播放：完整下载后播放
  STREAMING = 'streaming'       // 流式播放：边下载边播放
}

// 缓冲状态枚举
export enum BufferingState {
  IDLE = 'idle',
  BUFFERING = 'buffering',
  READY = 'ready',
  ERROR = 'error'
}

// 基础播放器接口
interface PlayerEngine {
  load(track: AudioTrack): Promise<boolean>;
  play(): boolean;
  pause(): boolean;
  stop(): void;
  seek(time: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  setVolume(volume: number): void;
  cleanup(): void;
  isPlaying: boolean;
}

/**
 * 流式播放引擎实现
 */
class StreamingEngine implements PlayerEngine {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private gainNode: GainNode;

  // 核心流式播放组件
  private audioElement: HTMLAudioElement;
  private mediaSource: MediaSource | null = null;
  private sourceBuffer: SourceBuffer | null = null;

  // 播放状态
  private currentTrack: AudioTrack | null = null;
  isPlaying: boolean = false;
  private bufferingState: BufferingState = BufferingState.IDLE;

  // 数据流管理
  private mediaSourceUrl: string | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private isSourceOpen: boolean = false;
  private isLoadingComplete: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private duration: number = 0;
  // 缓冲区管理
  private bufferQueue: Uint8Array[] = [];
  private bufferSize: number = 0;
  private minBufferSize: number = 256 * 1024; // 最小缓冲区大小 (256KB)
  private targetBufferSize: number = 1024 * 1024; // 目标缓冲区大小 (1MB)

  // 事件系统
  private events: {
    [K in PlayerEvent]: PlayerEventListener<K>[];
  };

  constructor(audioContext: AudioContext, analyser: AnalyserNode, gainNode: GainNode, events: any) {
    this.audioContext = audioContext;
    this.analyser = analyser;
    this.gainNode = gainNode;
    this.events = events;

    // 初始化音频元素
    this.audioElement = new Audio();
    this.setupAudioElement();
  }

  /**
   * 初始化音频元素和事件监听
   */
  private setupAudioElement() {
    this.audioElement.addEventListener('timeupdate', () => {
      this.events.timeupdate.forEach((listener: any) => {
        listener(this.getCurrentTime());
      });
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.events.ended.forEach((listener: any) => listener());
    });

    this.audioElement.addEventListener('error', (e) => {
      this.handleError(`Audio element error: ${(e as any).code}`);
    });

    // 监听缓冲事件
    this.audioElement.addEventListener('waiting', () => {
      if (this.bufferingState !== BufferingState.ERROR) {
        this.bufferingState = BufferingState.BUFFERING;
        this.events.buffering.forEach((listener: any) => listener(true));
      }
    });

    this.audioElement.addEventListener('playing', () => {
      if (this.bufferingState === BufferingState.BUFFERING) {
        this.bufferingState = BufferingState.READY;
        this.events.buffering.forEach((listener: any) => listener(false));
      }
    });
  }

  /**
   * 加载音频轨道
   */
  async load(track: AudioTrack): Promise<boolean> {
    // 清理之前的状态
    this.cleanup();

    this.currentTrack = track;
    this.bufferingState = BufferingState.BUFFERING;
    this.isLoadingComplete = false;
    this.retryCount = 0;

    try {
      console.log('开始加载音频轨道:', track.src);
      
      // 初始化MediaSource
      if (!await this.initMediaSource()) {
        console.error('MediaSource初始化失败');
        return false;
      }
      
      // 开始加载音频数据
      const { duration } = await this.startLoading(track.src);
     
      track.duration = duration ? parseFloat(duration) : 0;
      console.log('音频轨道加载完成，时长:', this.duration);
      return true;
    } catch (error) {
      console.error('加载音频轨道失败:', error);
      this.handleError(`Load failed: ${error}`);
      return false;
    }
  }
  /**
   * 初始化MediaSource
   */
  private async initMediaSource(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        console.log('开始初始化MediaSource');
        
        // 检查MediaSource支持
        if (!window.MediaSource) {
          console.error('MediaSource is not supported');
          this.handleError('MediaSource is not supported');
          return resolve(false);
        }

        this.mediaSource = new MediaSource();
        this.mediaSourceUrl = URL.createObjectURL(this.mediaSource);
        // 设置音频元素源为MediaSource URL
        this.audioElement.src = this.mediaSourceUrl;
        console.log('MediaSource URL set:', this.mediaSourceUrl);

        // MediaSource事件
        this.mediaSource.addEventListener('sourceopen', () => {
          console.log('MediaSource opened');
          this.isSourceOpen = true;
          this.attachSourceBuffer().then(resolve).catch(() => {
            console.error('SourceBuffer附加失败');
            resolve(false);
          });
        });

        this.mediaSource.addEventListener('sourceended', () => {
          console.log('MediaSource ended');
        });

        this.mediaSource.addEventListener('error', (e) => {
          console.error('MediaSource error:', (e as any).error);
          this.handleError(`MediaSource error: ${(e as any).error}`);
          resolve(false);
        });
      } catch (error) {
        console.error('MediaSource初始化失败:', error);
        this.handleError(`MediaSource init failed: ${error}`);
        resolve(false);
      }
    });
  }

  /**
   * 创建并附加SourceBuffer
   */
  private async attachSourceBuffer(): Promise<boolean> {
    if (!this.mediaSource || this.mediaSource.readyState !== 'open') {
      console.error('MediaSource未就绪');
      return false;
    }

    console.log('开始创建SourceBuffer');

    // 尝试多种音频格式
    const supportedMimeTypes = [
      'audio/mpeg',
      'audio/mp4; codecs="mp4a.40.2"',
      'audio/aac',
      'audio/ogg; codecs="vorbis"'
    ];

    for (const mimeType of supportedMimeTypes) {
      console.log('尝试MIME类型:', mimeType);
      if (MediaSource.isTypeSupported(mimeType)) {
        try {
          this.sourceBuffer = this.mediaSource.addSourceBuffer(mimeType);
          console.log('SourceBuffer创建成功，MIME类型:', mimeType);
          this.setupSourceBufferEvents();
          return true;
        } catch (error) {
          console.warn(`Failed to create SourceBuffer for ${mimeType}: ${error}`);
        }
      } else {
        console.log('MIME类型不支持:', mimeType);
      }
    }

    console.error('没有找到支持的音频格式');
    this.handleError('No supported audio format found');
    return false;
  }

  /**
   * 设置SourceBuffer事件
   */
  private setupSourceBufferEvents() {
    if (!this.sourceBuffer) return;

    this.sourceBuffer.addEventListener('updateend', () => {
      this.processBufferQueue();

      // 检查是否所有数据都已加载且缓冲区更新完成
      if (this.isLoadingComplete && !this.sourceBuffer?.updating && this.mediaSource) {
        this.mediaSource.endOfStream();
      }
    });

    this.sourceBuffer.addEventListener('error', (e) => {
      this.handleError(`SourceBuffer error: ${(e as any).error}`);
    });
  }

  /**
   * 开始加载音频数据
   */
  private async startLoading(url: string): Promise<{ duration: string | null }> {
    try {
      console.log('开始加载音频数据，URL:', url);
      
      const response = await fetch(`/api${url}`, {
        headers: {
          'Accept': 'audio/*'
        }
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status} ${response.statusText}`);
      }

      // 获取时长和 MIME 类型
      const duration = response.headers.get('x-audio-duration');

      // 验证响应流
      if (!response.body) {
        throw new Error('服务器未返回音频流');
      }

      // 等待MediaSource就绪
      if (!this.mediaSource || this.mediaSource.readyState !== 'open') {
        throw new Error('MediaSource未就绪');
      }

      // 确保SourceBuffer已创建
      if (!this.sourceBuffer) {
        throw new Error('SourceBuffer未创建');
      }

      console.log('开始处理音频流数据');

      // 读取并处理分块数据
      const reader = response.body.getReader();
      let isSourceOpen = true;

      // 处理流取消
      const cleanup = () => {
        isSourceOpen = false;
        reader.cancel().catch(err => console.error('流取消错误:', err));
      };

      // 逐块读取并添加到缓冲区
      const processChunks = async () => {
        let chunkCount = 0;
        while (isSourceOpen && this.mediaSource?.readyState === 'open') {
          const { done, value } = await reader.read();
          if (done) {
            // 流结束，标记媒体源完成
            if (this.mediaSource?.readyState === 'open') {
              this.mediaSource.endOfStream();
            }
            this.isLoadingComplete = true;
            console.log(`音频流处理完成，共处理 ${chunkCount} 个数据块`);
            break;
          }

          chunkCount++;
          console.log(`处理第 ${chunkCount} 个数据块，大小: ${value.byteLength} 字节`);

          // 等待缓冲区可用（避免缓冲区满导致的错误）
          if (this.sourceBuffer?.updating) {
            await new Promise(resolve => this.sourceBuffer?.addEventListener('updateend', resolve, { once: true }));
          }

          // 将数据块添加到缓冲区
          try {
            if (this.sourceBuffer && this.mediaSource?.readyState === 'open') {
              this.sourceBuffer.appendBuffer(value);
              console.log(`第 ${chunkCount} 个数据块已添加到缓冲区`);
            }
          } catch (err) {
            console.error('添加缓冲区错误:', err);
            cleanup();
            break;
          }
        }
      };

      // 启动分块处理
      processChunks().catch(err => {
        console.error('流处理错误:', err);
        this.handleError(`Stream processing error: ${err}`);
      });

      // 返回时长信息
      return {
        duration
      };
    } catch (error) {
      console.error('加载音频数据失败:', error);
      this.handleLoadError(error as Error, url);
      return { duration: null };
    }
  }


  /**
   * 处理加载错误和重试
   */
  private async handleLoadError(error: Error, url: string) {
    this.retryCount++;
    console.error(`Load error (${this.retryCount}/${this.maxRetries}): ${error.message}`);

    if (this.retryCount < this.maxRetries) {
      // 指数退避重试
      const delay = Math.pow(2, this.retryCount) * 1000;
      setTimeout(async () => {
        try {
          await this.startLoading(url);
        } catch (retryError) {
          console.error('重试失败:', retryError);
        }
      }, delay);
    } else {
      this.handleError(`Max retries reached: ${error.message}`);
    }
  }

  /**
   * 处理缓冲区队列
   */
  private processBufferQueue(finalChunk: boolean = false) {
    if (!this.sourceBuffer || this.sourceBuffer.updating || !this.isSourceOpen) {
      return;
    }

    // 只要缓冲区未满就继续添加数据
    while (this.bufferQueue.length > 0 &&
      !this.sourceBuffer.updating &&
      (this.bufferSize > this.minBufferSize || finalChunk)) {

      const chunk = this.bufferQueue.shift()!;
      this.bufferSize -= chunk.byteLength;

      try {
        this.sourceBuffer.appendBuffer(chunk);
      } catch (error) {
        console.error('Error appending buffer:', error);
        // 尝试恢复
        if (this.bufferQueue.length > 0) {
          setTimeout(() => this.processBufferQueue(finalChunk), 100);
        }
        break;
      }
    }
  }

  /**
   * 播放
   */
  play(): boolean {
    if (this.isPlaying || this.bufferingState === BufferingState.ERROR) {
      console.warn('无法播放：正在播放中或存在错误');
      return false;
    }

    if (!this.audioElement.src) {
      console.warn('无法播放：音频源未设置');
      return false;
    }

    try {
      console.log('尝试播放音频，源:', this.audioElement.src);
      this.audioElement.play().then(() => {
        this.isPlaying = true;
        console.log('音频播放成功');
        this.events.play.forEach((listener: any) => listener(this.getCurrentTime()));
      }).catch(error => {
        console.error('播放失败:', error);
        this.handleError(`Playback failed: ${error}`);
      });
      return true;
    } catch (error) {
      console.error('播放错误:', error);
      this.handleError(`Play error: ${error}`);
      return false;
    }
  }

  /**
   * 暂停
   */
  pause(): boolean {
    if (!this.isPlaying) {
      return false;
    }

    this.audioElement.pause();
    this.isPlaying = false;
    this.events.pause.forEach((listener: any) => listener(this.getCurrentTime()));
    return true;
  }

  /**
   * 停止
   */
  stop(): void {
    this.pause();
    this.audioElement.currentTime = 0;
    this.events.stop.forEach((listener: any) => listener());
  }

  /**
   * 跳转
   */
  seek(time: number): void {
    if (!this.audioElement.duration) return;

    // 限制在有效范围内
    const seekTime = Math.max(0, Math.min(time, this.audioElement.duration));
    this.audioElement.currentTime = seekTime;

    // 触发timeupdate事件
    this.events.timeupdate.forEach((listener: any) => listener(seekTime));
  }

  /**
   * 获取当前播放时间
   */
  getCurrentTime(): number {
    return this.audioElement.currentTime;
  }

  /**
   * 获取总时长
   */
  getDuration(): number {
    return this.audioElement.duration || 0;
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.audioElement.volume = clampedVolume;
    this.gainNode.gain.value = clampedVolume;
    this.events.volumechange.forEach((listener: any) => listener(clampedVolume));
  }

  /**
   * 处理错误
   */
  private handleError(message: string) {
    console.error(`Streaming error: ${message}`);
    this.bufferingState = BufferingState.ERROR;
    this.events.error.forEach((listener: any) => listener(new Error(message)));
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    // 停止播放
    this.stop();

    // 取消读取器
    if (this.reader) {
      this.reader.cancel().catch(() => { });
      this.reader = null;
    }

    // 清理MediaSource
    if (this.mediaSource) {
      if (this.mediaSource.readyState === 'open') {
        this.mediaSource.endOfStream();
      }
      this.mediaSource = null;
    }

    // 释放URL对象
    if (this.mediaSourceUrl) {
      URL.revokeObjectURL(this.mediaSourceUrl);
      this.mediaSourceUrl = null;
    }

    // 清理缓冲区
    this.sourceBuffer = null;
    this.bufferQueue = [];
    this.bufferSize = 0;
    this.isSourceOpen = false;
    this.isLoadingComplete = false;

    // 重置音频元素
    this.audioElement.src = '';
    this.audioElement.removeAttribute('src');
    this.audioElement.load();
  }
}

/**
 * 传统播放引擎实现
 */
class TraditionalEngine implements PlayerEngine {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private gainNode: GainNode;

  // 音频节点
  private audioSource: AudioBufferSourceNode | null = null;
  private audioBuffer: AudioBuffer | null = null;

  // 播放状态
  private currentTime: number = 0;
  private startTime: number = 0;
  isPlaying: boolean = false;
  private duration: number = 0;

  // 事件系统
  private events: {
    [K in PlayerEvent]: PlayerEventListener<K>[];
  };

  constructor(audioContext: AudioContext, analyser: AnalyserNode, gainNode: GainNode, events: any) {
    this.audioContext = audioContext;
    this.analyser = analyser;
    this.gainNode = gainNode;
    this.events = events;
  }

  /**
   * 加载音频
   */
  async load(track: AudioTrack): Promise<boolean> {
    this.cleanup();

    try {
      // 检查是否是API路径，如果是则添加前缀
      const url = track.src.startsWith('/api') ? track.src : `/api${track.src}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.duration = this.audioBuffer.duration;

      this.events.canplay.forEach((listener: any) => listener());
      return true;
    } catch (error) {
      this.events.error.forEach((listener: any) => listener(error));
      return false;
    }
  }

  /**
   * 播放
   */
  play(): boolean {
    if (this.isPlaying || !this.audioBuffer) {
      return false;
    }

    // 停止当前播放源
    if (this.audioSource) {
      this.audioSource.stop();
    }

    // 创建新的音频源
    this.audioSource = this.audioContext.createBufferSource();
    this.audioSource.buffer = this.audioBuffer;
    this.audioSource.connect(this.analyser);

    // 记录开始时间和当前偏移
    this.startTime = this.audioContext.currentTime;
    this.audioSource.start(0, this.currentTime);
    this.isPlaying = true;

    // 设置结束事件
    this.audioSource.onended = () => {
      this.isPlaying = false;
      this.currentTime = 0;
      this.events.ended.forEach((listener: any) => listener());
    };

    // 启动时间更新
    this.startTimeUpdates();

    this.events.play.forEach((listener: any) => listener(this.currentTime));
    return true;
  }

  /**
   * 暂停
   */
  pause(): boolean {
    if (!this.isPlaying || !this.audioSource) {
      return false;
    }

    // 记录当前时间
    this.currentTime = this.audioContext.currentTime - this.startTime;
    this.audioSource.stop();
    this.audioSource = null;
    this.isPlaying = false;

    // 停止时间更新
    this.stopTimeUpdates();

    this.events.pause.forEach((listener: any) => listener(this.currentTime));
    return true;
  }

  /**
   * 停止
   */
  stop(): void {
    if (this.isPlaying && this.audioSource) {
      this.audioSource.stop();
      this.audioSource = null;
    }

    this.isPlaying = false;
    this.currentTime = 0;
    this.stopTimeUpdates();

    this.events.stop.forEach((listener: any) => listener());
  }

  /**
   * 跳转
   */
  seek(time: number): void {
    const wasPlaying = this.isPlaying;
    this.stop();

    // 限制在有效范围内
    this.currentTime = Math.max(0, Math.min(time, this.duration));

    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * 获取当前时间
   */
  getCurrentTime(): number {
    if (this.isPlaying && this.audioSource) {
      return (this.audioContext.currentTime - this.startTime) + this.currentTime;
    }
    return this.currentTime;
  }

  /**
   * 获取总时长
   */
  getDuration(): number {
    return this.duration;
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.gainNode.gain.value = clampedVolume;
    this.events.volumechange.forEach((listener: any) => listener(clampedVolume));
  }

  /**
   * 启动时间更新
   */
  private startTimeUpdates() {
    const updateTime = () => {
      if (!this.isPlaying) return;

      this.events.timeupdate.forEach((listener: any) => {
        listener(this.getCurrentTime());
      });
      requestAnimationFrame(updateTime);
    };

    requestAnimationFrame(updateTime);
  }

  /**
   * 停止时间更新
   */
  private stopTimeUpdates() {
    // 由requestAnimationFrame自动处理
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.stop();
    this.audioSource = null;
    this.audioBuffer = null;
    this.currentTime = 0;
    this.duration = 0;
  }
}

/**
 * 音乐播放器主类
 */
export class MusicPlayer {
  // 音频上下文和节点
  audioContext: AudioContext;
  analyser: AnalyserNode;
  gainNode: GainNode;

  // 播放器引擎
  currentEngine: PlayerEngine | null = null;
  streamingEngine: StreamingEngine;
  traditionalEngine: TraditionalEngine;

  // 播放列表管理
  playlist: AudioTrack[] = [];
  currentIndex: number = -1;
  currentTrack: AudioTrack | null = null;

  // 播放配置
  currentPlaybackMode: PlaybackMode = PlaybackMode.STREAMING;
  volume: number = 0.7;

  // 事件系统
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
    // 检查浏览器环境
    if (typeof window === 'undefined') {
      throw new Error('MusicPlayer can only be used in browser environment');
    }

    // 初始化音频上下文
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // 创建音频节点
    this.analyser = this.audioContext.createAnalyser();
    this.gainNode = this.audioContext.createGain();

    // 连接音频节点
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = this.volume;

    // 初始化播放器引擎
    this.streamingEngine = new StreamingEngine(this.audioContext, this.analyser, this.gainNode, this.events);
    this.traditionalEngine = new TraditionalEngine(this.audioContext, this.analyser, this.gainNode, this.events);

    // 默认使用流式引擎
    this.currentEngine = this.streamingEngine;
  }

  /**
   * 设置播放模式
   */
  setPlaybackMode(mode: PlaybackMode): void {
    const wasPlaying = this.isPlaying;
    const currentTime = this.getCurrentTime();

    // 清理当前引擎
    if (this.currentEngine) {
      this.currentEngine.cleanup();
    }

    // 切换引擎
    this.currentPlaybackMode = mode;
    this.currentEngine = mode === PlaybackMode.STREAMING ? this.streamingEngine : this.traditionalEngine;

    // 恢复播放状态
    if (wasPlaying && this.currentTrack) {
      this.load(this.currentTrack).then(() => {
        this.seek(currentTime);
        this.play();
      });
    }
  }

  /**
   * 加载音频轨道
   */
  async load(track: AudioTrack): Promise<boolean> {
    // 更新当前轨道信息
    this.currentTrack = track;

    // 查找轨道在播放列表中的位置
    const index = this.playlist.findIndex(t => t.src === track.src);
    if (index !== -1) {
      this.currentIndex = index;
    }

    // 使用当前引擎加载
    const result = await this.currentEngine!.load(track);
    console.log('result', result);
    if (result) {
      this.events.trackchange.forEach((listener: any) => listener(track));
    }

    return result;
  }

  /**
   * 播放
   */
  play(): boolean {
    if (!this.currentEngine || !this.currentTrack) {
      console.warn('无法播放：引擎或轨道未准备好');
      return false;
    }

    // 确保音频上下文已恢复
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const result = this.currentEngine.play();
    if (result) {
      console.log('开始播放音频');
    } else {
      console.warn('播放失败');
    }
    return result;
  }

  /**
   * 暂停
   */
  pause(): boolean {
    return this.currentEngine ? this.currentEngine.pause() : false;
  }

  /**
   * 停止
   */
  stop(): void {
    if (this.currentEngine) {
      this.currentEngine.stop();
    }
  }

  /**
   * 跳转
   */
  seek(time: number): void {
    if (this.currentEngine) {
      this.currentEngine.seek(time);
    }
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.currentEngine) {
      this.currentEngine.setVolume(this.volume);
    }
  }

  /**
   * 获取当前播放时间
   */
  getCurrentTime(): number {
    return this.currentEngine ? this.currentEngine.getCurrentTime() : 0;
  }

  /**
   * 获取总时长
   */
  getDuration(): number {
    return this.currentEngine ? this.currentEngine.getDuration() : 0;
  }

  /**
   * 播放下一首
   */
  playNext(): void {
    if (this.playlist.length === 0) return;

    const nextIndex = (this.currentIndex + 1) % this.playlist.length;
    this.currentIndex = nextIndex;
    this.load(this.playlist[nextIndex]).then(success => {
      if (success) this.play();
    });
  }

  /**
   * 播放上一首
   */
  playPrevious(): void {
    if (this.playlist.length === 0) return;

    const prevIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.currentIndex = prevIndex;
    this.load(this.playlist[prevIndex]).then(success => {
      if (success) this.play();
    });
  }

  /**
   * 添加到播放列表
   */
  addToPlaylist(track: AudioTrack | AudioTrack[]): void {
    if (Array.isArray(track)) {
      this.playlist.push(...track);
    } else {
      this.playlist.push(track);
    }

    // 如果是第一个轨道，自动设置为当前索引
    if (this.currentIndex === -1 && this.playlist.length > 0) {
      this.currentIndex = 0;
    }
  }

  /**
   * 清空播放列表
   */
  clearPlaylist(): void {
    this.playlist = [];
    this.currentIndex = -1;
    this.currentTrack = null;
    this.stop();
  }

  /**
   * 事件监听
   */
  on<T extends PlayerEvent>(event: T, listener: PlayerEventListener<T>): void {
    this.events[event].push(listener as any);
  }

  /**
   * 移除事件监听
   */
  off<T extends PlayerEvent>(event: T, listener: PlayerEventListener<T>): void {
    const index = this.events[event].indexOf(listener as any);
    if (index !== -1) {
      this.events[event].splice(index, 1);
    }
  }

  /**
   * 获取当前播放状态
   */
  get isPlaying(): boolean {
    return this.currentEngine?.isPlaying || false;
  }

  /**
   * 获取当前播放模式
   */
  getPlaybackMode(): PlaybackMode {
    return this.currentPlaybackMode;
  }

  /**
   * 获取分析器节点（用于可视化）
   */
  getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  /**
   * 销毁播放器
   */
  destroy(): void {
    this.stop();
    this.streamingEngine.cleanup();
    this.traditionalEngine.cleanup();
    this.audioContext.close();
    this.playlist = [];
    this.currentTrack = null;
    this.currentIndex = -1;
  }
}

export default MusicPlayer;