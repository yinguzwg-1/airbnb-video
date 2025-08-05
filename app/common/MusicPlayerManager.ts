
import { AudioTrack } from '../types/music-player';
import MusicPlayer from './MusicPlayer';

class PlayerManager {
  private static instance: PlayerManager;
  private player: MusicPlayer | null = null;

  private constructor() {
    // 延迟初始化，只在客户端创建
  }

  public static getInstance(): PlayerManager {
    if (!PlayerManager.instance) {
      PlayerManager.instance = new PlayerManager();
    }
    return PlayerManager.instance;
  }

  public getPlayer(): MusicPlayer | null {
    if (!this.player) {
      // 只在客户端创建MusicPlayer实例
      if (typeof window !== 'undefined') {
        this.player = new MusicPlayer();
      } else {
        // 在服务器端抛出错误，避免创建无效对象
        return null;
      }
    }
    return this.player;
  }

  // 添加其他管理方法...
  public playTrack(track: AudioTrack): Promise<boolean> {
    // 确保只在客户端执行
    if (typeof window === 'undefined') {
      return Promise.resolve(false);
    }
    
    const player = this.getPlayer();
    if (!player) return Promise.resolve(false);
    return player.load(track).then((success) => {
      if (success) {
        return player.play();
      }
      return false;
    });
  }

  public getPlaylist(): AudioTrack[] {
    if (!this.player || typeof window === 'undefined') return [];
    return [...this.player.playlist];
  }

  public setPlaylist(playlist: AudioTrack[], startPlaying: boolean = false): void {
    if (!this.player || typeof window === 'undefined') return;
    this.player.clearPlaylist();
    this.player.addToPlaylist(playlist);
    if (startPlaying && playlist.length > 0) {
      this.playTrack(playlist[0]);
    }
  }
}

const playerManager = PlayerManager.getInstance();
export default playerManager;