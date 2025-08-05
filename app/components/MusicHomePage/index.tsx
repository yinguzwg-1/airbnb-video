"use client";
import { Music } from "@/app/types/music";
import { TopBar, UploadMusicModal } from "../";
import { config } from "@/app/config";
import { useEffect, useMemo, useState } from "react";

import { Language, translations } from "@/app/i18n";
import playerManager from "@/app/common/MusicPlayerManager";
import { AudioTrack } from "@/app/types/music-player";
import MusicPlayerControl from "../Common/MusicPlayerControl";

const MusicHomePage = ({ musicList, lang }: { musicList: Music[], lang: Language }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const t = translations[lang];
  // 筛选项数据
  const filterOptions = [
    { id: 'today', label: '今日推荐', icon: '🔥', active: true },
    { id: 'playlist', label: '歌单广场', icon: '📚' },
    { id: 'genre', label: '分类浏览', icon: '🎼' },
    { id: 'artist', label: '歌手专区', icon: '🎤' },
    { id: 'album', label: '专辑推荐', icon: '💿' }
  ]; 
  const musicListMemo = useMemo(() => musicList.map(music => ({
    src: music.mp3,
    title: music.title,
    artist: music.artist,
    album: music.album,
    cover: music.cover,
    genre: music.genre,
    lyrics: music.lyrics
  })), [musicList]);
  const [currentMusic, setCurrentMusic] = useState<AudioTrack | null>(null);
  
  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window === 'undefined') return;
    
    try {
      playerManager.setPlaylist(musicListMemo);
      
      // 监听播放器状态变化
      const player = playerManager.getPlayer();
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleTrackChange = (track: AudioTrack) => {
        setCurrentMusic(track);
        setIsPlaying(false);
      };
      if (!player) return;
      player.on('play', handlePlay);
      player.on('pause', handlePause);
      player.on('trackchange', handleTrackChange);

      return () => {
        player.off('play', handlePlay);
        player.off('pause', handlePause);
        player.off('trackchange', handleTrackChange);
      };
    } catch (error) {
      console.warn('MusicPlayer初始化失败:', error);
    }
  }, [musicListMemo]);

  const handlePlaySong = (music: AudioTrack) => {
    // 确保只在客户端执行
    if (typeof window === 'undefined') return;
    
    try {
      const player = playerManager.getPlayer();
      console.log('---handlePlaySong-',music);
      if (!player) return;
      // 1. 确保播放列表存在
      if (player.playlist.length === 0) {
        console.error('播放列表为空');
        return;
      }
      
      // 2. 如果点击的是当前正在播放的歌曲，则切换播放/暂停状态
      if (currentMusic?.src === music.src) {
        if (player.isPlaying) {
          player.pause();
        } else {
          player.play();
        }
        return;
      }
      
      // 3. 如果是新的歌曲，设置当前音乐并加载
      setCurrentMusic(music);
      
      // 4. 加载并播放新歌曲
      player.load({
        src: music.src,
        title: music.title,
        artist: music.artist,
        album: music.album,
        cover: music.cover,
        duration: music.duration,
        lyrics: music.lyrics
      }).then((success) => {
        if (!success) {
          console.error('音乐加载失败');
          return;
        }
        
        // 5. 播放音频
        player.play();
      }).catch((error) => {
        console.error('音乐加载失败:', error);
      });
    } catch (error) {
      console.warn('MusicPlayer操作失败:', error);
    }
  };

  const handleMusicChange = (music: AudioTrack) => {
    try {
      setCurrentMusic(music);
    } catch (error) {
      console.warn('音乐切换失败:', error);
    }
  };

  // 音频可视化组件
  const AudioVisualizer = () => (
    <div className="flex items-end space-x-0.5">
      <div className="w-0.5 bg-purple-400 rounded-full" style={{ 
        height: '8px', 
        animation: 'audioWaveUp 1s ease-in-out infinite',
        animationDelay: '0ms',
        transformOrigin: 'bottom'
      }}></div>
      <div className="w-0.5 bg-purple-400 rounded-full" style={{ 
        height: '12px', 
        animation: 'audioWaveUp 1s ease-in-out infinite',
        animationDelay: '0.2s',
        transformOrigin: 'bottom'
      }}></div>
      <div className="w-0.5 bg-purple-400 rounded-full" style={{ 
        height: '8px', 
        animation: 'audioWaveUp 1s ease-in-out infinite',
        animationDelay: '0.4s',
        transformOrigin: 'bottom'
      }}></div>
    </div>
  );

  // 检查当前音乐是否正在播放
  const isCurrentMusicPlaying = (music: AudioTrack) => {
    try {
      return currentMusic?.src === music.src && isPlaying;
    } catch (error) {
      console.warn('检查播放状态失败:', error);
      return false;
    }
  };

  return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 pb-32">
    <TopBar lang={lang} title="音乐">
      {/* 搜索栏通过children传入 */}
      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索歌手、歌名或歌词..."
            className="w-full px-4 py-2 pl-10 pr-20 text-gray-900 dark:text-white bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-1 rounded-md text-sm transition-all duration-300 shadow-lg">
            搜索
          </button>
        </div>
      </div>
    </TopBar>

    {/* 音乐内容区域 */}
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 筛选项 */}
      <div className="mb-8">
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${option.active
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-white/20 dark:border-gray-700/50'
                  }`}
              >
                <span className="text-lg">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
          <div className="px-10 py-5">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              上传音乐
            </button>
          </div>
        </div>
      </div>

      {/* 今日推荐内容 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">今日推荐</h3>
          <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium transition-colors duration-300">
            换一批
          </button>
        </div>

        {/* 推荐音乐卡片 - 网格布局一排五个 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {musicListMemo.map((music, index) => {
            const isPlaying = isCurrentMusicPlaying(music);
            return (
              <div
                key={index}
                className="transform transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div 
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-white/20 dark:border-gray-700/50"
                  onClick={() => {
                    try {
                      handlePlaySong(music);
                    } catch (error) {
                      console.warn('播放音乐失败:', error);
                    }
                  }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={music.cover || '/images/default-cover.jpg'}
                      alt={music.title}
                      className="w-full h-56 object-cover transition-transform duration-500"
                      onError={(e) => {
                        // 如果图片加载失败，显示默认图片
                        e.currentTarget.src = '/images/default-cover.jpg';
                      }}
                    />
                    
                    {/* 播放状态指示器 - 左上角 */}
                    {isPlaying && (
                      <div className="absolute top-3 left-3 z-10">
                        <AudioVisualizer />
                      </div>
                    )}
                    
                    {/* 播放按钮覆盖层 */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        {isPlaying ? (
                          <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                        {music.title}
                      </h3>
                      <span className="text-blue-600 dark:text-blue-400 text-xs border border-blue-300 dark:border-blue-600 px-1 rounded whitespace-nowrap">
                        {music.genre}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-1">
                      {music.artist} / 《{music.album}》
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* 播放器控制组件 */}
    <MusicPlayerControl 
      currentMusic={currentMusic}
      onMusicChange={handleMusicChange}
    />

    {/* 上传音乐弹窗 */}
    <UploadMusicModal
      isOpen={isUploadModalOpen}
      onClose={() => setIsUploadModalOpen(false)}
    />

    {/* 自定义CSS动画 */}
    <style jsx>{`
      @keyframes audioWaveUp {
        0%, 100% {
          transform: scaleY(1);
        }
        50% {
          transform: scaleY(2);
        }
      }
    `}</style>
  </div>
};

export default MusicHomePage; 