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
  abortLoading(): void;
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
  // 请求控制
  private abortController: AbortController | null = null;
  private isAborted: boolean = false;

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
    await this.cleanup();

    // 重置中止状态
    this.isAborted = false;
    
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
      this.processBufferQueue().catch(err => {
        console.error('处理缓冲区队列失败:', err);
      });

      // 检查是否所有数据都已加载且缓冲区更新完成
      if (this.isLoadingComplete && !this.sourceBuffer?.updating && this.mediaSource) {
        this.safeEndOfStream();
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
      
      // 创建新的 AbortController
      this.abortController = new AbortController();
      this.isAborted = false;
      
      const response = await fetch(`/api${url}`, {
        headers: {
          'Accept': 'audio/*'
        },
        signal: this.abortController.signal
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
        while (isSourceOpen && this.mediaSource?.readyState === 'open' && !this.isAborted) {
          try {
            const { done, value } = await reader.read();
            
            // 检查是否被中止
            if (this.isAborted) {
              console.log('音频加载被中止，停止处理数据块');
              break;
            }
            
            if (done) {
              // 流结束，标记媒体源完成
              this.isLoadingComplete = true;
              if (this.mediaSource?.readyState === 'open') {
                this.safeEndOfStream();
              }
              console.log(`音频流处理完成，共处理 ${chunkCount} 个数据块`);
              break;
            }

            chunkCount++;
            console.log(`处理第 ${chunkCount} 个数据块，大小: ${value.byteLength} 字节`);

            // 使用安全的缓冲区添加方法
            const success = await this.safeAppendBuffer(value);
            if (success) {
              console.log(`第 ${chunkCount} 个数据块已添加到缓冲区`);
            } else {
              console.warn(`第 ${chunkCount} 个数据块添加失败，跳过`);
            }
          } catch (error) {
            if (this.isAborted) {
              console.log('音频加载被中止，停止处理数据块');
              break;
            }
            console.error('处理数据块时出错:', error);
            break;
          }
        }
      };

      // 启动分块处理
      processChunks().catch(err => {
        if (!this.isAborted) {
          console.error('流处理错误:', err);
          this.handleError(`Stream processing error: ${err}`);
        }
      });

      // 返回时长信息
      return {
        duration
      };
    } catch (error) {
      // 检查是否是中止错误
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('音频加载请求被中止');
        return { duration: null };
      }
      
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
   * 安全地调用 endOfStream
   */
  private safeEndOfStream(): void {
    if (!this.mediaSource || this.mediaSource.readyState !== 'open') {
      return;
    }

    // 检查所有 SourceBuffer 是否都不在 updating 状态
    if (this.sourceBuffer && this.sourceBuffer.updating) {
      // 如果正在更新，等待更新完成后再调用 endOfStream
      this.sourceBuffer.addEventListener('updateend', () => {
        this.safeEndOfStream();
      }, { once: true });
      return;
    }

    try {
      this.mediaSource.endOfStream();
      console.log('MediaSource endOfStream 调用成功');
    } catch (error) {
      console.error('endOfStream 调用失败:', error);
      // 如果仍然失败，延迟重试
      setTimeout(() => this.safeEndOfStream(), 100);
    }
  }

  /**
   * 安全地添加数据到 SourceBuffer
   */
  private async safeAppendBuffer(data: Uint8Array): Promise<boolean> {
    if (!this.sourceBuffer || !this.mediaSource || this.mediaSource.readyState !== 'open') {
      return false;
    }

    // 最大重试次数
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // 等待 SourceBuffer 完全就绪
        if (!(await this.waitForSourceBufferReady())) {
          console.warn('SourceBuffer 未就绪，跳过数据块');
          return false;
        }

        // 检查缓冲区大小，如果过大则主动清理
        await this.checkBufferSize();

        // 最终状态检查
        if (!this.sourceBuffer || this.sourceBuffer.updating || this.mediaSource.readyState !== 'open') {
          return false;
        }

        // 尝试添加数据
        this.sourceBuffer.appendBuffer(data);
        return true;

      } catch (error) {
        retryCount++;
        console.error(`safeAppendBuffer 失败 (尝试 ${retryCount}/${maxRetries}):`, error);
        
        if (error instanceof Error) {
          if (error.name === 'QuotaExceededError') {
            console.log('缓冲区已满，尝试清理空间...');
            if (await this.cleanupSourceBuffer()) {
              // 清理成功后继续重试
              continue;
            } else {
              console.error('清理缓冲区失败');
              return false;
            }
          } else if (error.name === 'InvalidStateError') {
            console.log('SourceBuffer 状态错误，等待更新完成...');
            // 等待更长时间
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
          }
        }
        
        // 如果是最后一次重试，返回失败
        if (retryCount >= maxRetries) {
          console.error('达到最大重试次数，放弃添加数据');
          return false;
        }
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 50 * retryCount));
      }
    }
    
    return false;
  }

  /**
   * 清理 SourceBuffer 以释放空间
   */
  private async cleanupSourceBuffer(): Promise<boolean> {
    if (!this.sourceBuffer || this.sourceBuffer.updating) {
      return false;
    }

    try {
      // 获取当前播放时间
      const currentTime = this.audioElement.currentTime;
      const duration = this.audioElement.duration || 0;
      
      if (duration > 0) {
        // 保留当前播放位置前后各 10 秒的数据
        const keepStart = Math.max(0, currentTime - 10);
        const keepEnd = Math.min(duration, currentTime + 10);
        
        // 清理开始部分
        if (keepStart > 0) {
          try {
            this.sourceBuffer.remove(0, keepStart);
            console.log(`清理开始部分: 0 - ${keepStart}`);
          } catch (error) {
            console.warn('清理开始部分失败:', error);
          }
        }
        
        // 清理结束部分
        if (keepEnd < duration) {
          try {
            this.sourceBuffer.remove(keepEnd, duration);
            console.log(`清理结束部分: ${keepEnd} - ${duration}`);
          } catch (error) {
            console.warn('清理结束部分失败:', error);
          }
        }
        
        return true;
      }
    } catch (error) {
      console.error('清理 SourceBuffer 失败:', error);
    }
    
    return false;
  }

  /**
   * 检查缓冲区大小，如果过大则主动清理
   */
  private async checkBufferSize(): Promise<void> {
    if (!this.sourceBuffer || this.sourceBuffer.updating) {
      return;
    }

    try {
      const buffered = this.sourceBuffer.buffered;
      if (buffered.length === 0) return;

      // 计算总缓冲区大小
      let totalBufferSize = 0;
      for (let i = 0; i < buffered.length; i++) {
        totalBufferSize += buffered.end(i) - buffered.start(i);
      }

      // 如果缓冲区超过 60 秒，主动清理
      if (totalBufferSize > 60) {
        console.log(`缓冲区过大 (${totalBufferSize.toFixed(1)}秒)，主动清理...`);
        await this.cleanupSourceBuffer();
      }
    } catch (error) {
      console.error('检查缓冲区大小失败:', error);
    }
  }

  /**
   * 等待 SourceBuffer 完全就绪
   */
  private async waitForSourceBufferReady(): Promise<boolean> {
    if (!this.sourceBuffer) return false;

    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      if (!this.sourceBuffer.updating && 
          this.mediaSource?.readyState === 'open' && 
          this.isSourceOpen) {
        return true;
      }

      // 等待更新完成
      if (this.sourceBuffer.updating) {
        await new Promise<void>((resolve) => {
          const handleUpdateEnd = () => {
            this.sourceBuffer?.removeEventListener('updateend', handleUpdateEnd);
            resolve();
          };
          this.sourceBuffer?.addEventListener('updateend', handleUpdateEnd);
        });
      }

      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    console.warn('等待 SourceBuffer 就绪超时');
    return false;
  }

  /**
   * 处理缓冲区队列
   */
  private async processBufferQueue(finalChunk: boolean = false) {
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
        // 使用安全的缓冲区添加方法
        const success = await this.safeAppendBuffer(chunk);
        if (!success) {
          // 如果添加失败，将数据块放回队列
          this.bufferQueue.unshift(chunk);
          this.bufferSize += chunk.byteLength;
          break;
        }
      } catch (error) {
        console.error('Error appending buffer:', error);
        // 将数据块放回队列
        this.bufferQueue.unshift(chunk);
        this.bufferSize += chunk.byteLength;
        break;
      }
    }
  }

  /**
   * 中止音频加载
   */
  abortLoading(): void {
    if (this.abortController) {
      console.log('手动中止音频加载');
      this.abortController.abort();
      this.isAborted = true;
      this.abortController = null;
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
  async cleanup(): Promise<void> {
    // 中止正在进行的请求
    if (this.abortController) {
      console.log('中止正在进行的音频加载请求');
      this.abortController.abort();
      this.isAborted = true;
      this.abortController = null;
    }

    // 停止播放
    this.stop();

    // 取消读取器
    if (this.reader) {
      this.reader.cancel().catch(() => { });
      this.reader = null;
    }

    // 清理 SourceBuffer
    if (this.sourceBuffer && this.mediaSource?.readyState === 'open') {
      try {
        // 等待 SourceBuffer 完成当前操作
        if (this.sourceBuffer.updating) {
          await new Promise<void>((resolve) => {
            const handleUpdateEnd = () => {
              this.sourceBuffer?.removeEventListener('updateend', handleUpdateEnd);
              resolve();
            };
            this.sourceBuffer?.addEventListener('updateend', handleUpdateEnd);
          });
        }

        // 清理所有缓冲区数据
        if (this.sourceBuffer.buffered.length > 0) {
          const buffered = this.sourceBuffer.buffered;
          for (let i = 0; i < buffered.length; i++) {
            const start = buffered.start(i);
            const end = buffered.end(i);
            try {
              // 再次检查状态
              if (!this.sourceBuffer.updating) {
                this.sourceBuffer.remove(start, end);
                console.log(`清理缓冲区段: ${start} - ${end}`);
                
                // 等待移除操作完成
                if (this.sourceBuffer.updating) {
                  await new Promise<void>((resolve) => {
                    const handleUpdateEnd = () => {
                      this.sourceBuffer?.removeEventListener('updateend', handleUpdateEnd);
                      resolve();
                    };
                    this.sourceBuffer?.addEventListener('updateend', handleUpdateEnd);
                  });
                }
              }
            } catch (error) {
              console.warn('清理缓冲区段失败:', error);
              // 如果清理失败，等待一段时间再继续
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
        }
      } catch (error) {
        console.error('清理 SourceBuffer 失败:', error);
      }
    }

    // 清理MediaSource
    if (this.mediaSource) {
      if (this.mediaSource.readyState === 'open') {
        this.safeEndOfStream();
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

  /**
   * 中止音频加载（传统引擎不需要实现，但为了接口兼容性）
   */
  abortLoading(): void {
    // 传统引擎不需要实现中止功能
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
  async setPlaybackMode(mode: PlaybackMode): Promise<void> {
    const wasPlaying = this.isPlaying;
    const currentTime = this.getCurrentTime();

    // 清理当前引擎
    if (this.currentEngine) {
      await this.currentEngine.cleanup();
    }

    // 切换引擎
    this.currentPlaybackMode = mode;
    this.currentEngine = mode === PlaybackMode.STREAMING ? this.streamingEngine : this.traditionalEngine;

    // 恢复播放状态
    if (wasPlaying && this.currentTrack) {
      await this.load(this.currentTrack);
      this.seek(currentTime);
      this.play();
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
   * 中止当前音频加载
   */
  abortLoading(): void {
    if (this.currentEngine) {
      this.currentEngine.abortLoading();
    }
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