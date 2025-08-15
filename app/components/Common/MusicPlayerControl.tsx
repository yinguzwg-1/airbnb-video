'use client';

import { useEffect, useState } from 'react';
import { AudioTrack } from '@/app/types/music-player';
import playerManager from '@/app/common/MusicPlayerManager';

interface MusicPlayerControlProps {
  currentMusic: AudioTrack | null;
  onMusicChange: (music: AudioTrack) => void;
}

const MusicPlayerControl = ({ currentMusic, onMusicChange }: MusicPlayerControlProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);

  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window === 'undefined') return;
    
    try {
      const player = playerManager.getPlayer();
      if (!player) return;
      // 监听播放器事件
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleTimeUpdate = (time: number) => {
        setCurrentTime(time);
        // 更新当前歌词索引
        if (currentMusic?.lyrics && Array.isArray(currentMusic.lyrics)) {
          let newIndex = -1;
          for (let i = 0; i < currentMusic.lyrics.length; i++) {
            const lyric = currentMusic.lyrics[i];
            const nextLyric = currentMusic.lyrics[i + 1];
            
            if (time >= lyric.time && (!nextLyric || time < nextLyric.time)) {
              newIndex = i;
              break;
            }
          }
          setCurrentLyricIndex(newIndex);
          
          // 调试信息
          if (newIndex !== -1) {
            console.log('当前时间:', time, '当前歌词:', currentMusic.lyrics[newIndex]);
          }
        }
      };
      const handleTrackChange = (track: AudioTrack) => {
        console.log('track', track);
        setDuration(track.duration || 0);
        setCurrentTime(0);
        setCurrentLyricIndex(-1);
      };

      player.on('play', handlePlay);
      player.on('pause', handlePause);
      player.on('timeupdate', handleTimeUpdate);
      player.on('trackchange', handleTrackChange);

      return () => {
        player.off('play', handlePlay);
        player.off('pause', handlePause);
        player.off('timeupdate', handleTimeUpdate);
        player.off('trackchange', handleTrackChange);
      };
    } catch (error) {
      console.warn('MusicPlayer初始化失败:', error);
    }
  }, [currentMusic]);

  useEffect(() => {
    if (currentMusic) {
      setDuration(currentMusic.duration || 0);
      setCurrentLyricIndex(-1);
    }
  }, [currentMusic]);

  const handlePlayPause = () => {
    try {
      const player = playerManager.getPlayer();
      if (!player) return;
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    } catch (error) {
      console.warn('MusicPlayer操作失败:', error);
    }
  };

  const handlePrevious = () => {
    try {
      const player = playerManager.getPlayer();
      if (!player) return;
      player.playPrevious();
      const playlist = player.playlist;
      const newIndex = (player.currentIndex - 1 + playlist.length) % playlist.length;
      onMusicChange(playlist[newIndex]);
    } catch (error) {
      console.warn('MusicPlayer操作失败:', error);
    }
  };

  const handleNext = () => {
    try {
      const player = playerManager.getPlayer();
      if (!player) return;
      player.playNext();
      const playlist = player.playlist;
      const newIndex = (player.currentIndex + 1) % playlist.length;
      onMusicChange(playlist[newIndex]);
    } catch (error) {
      console.warn('MusicPlayer操作失败:', error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const player = playerManager.getPlayer();
      if (!player) return;
      const newTime = parseFloat(e.target.value);
      player.seek(newTime);
      setCurrentTime(newTime);
    } catch (error) {
      console.warn('MusicPlayer操作失败:', error);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const player = playerManager.getPlayer();
      if (!player) return;
      const newVolume = parseFloat(e.target.value);
      player.setVolume(newVolume);
      setVolume(newVolume);
    } catch (error) {
      console.warn('MusicPlayer操作失败:', error);
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: 实现收藏到我的歌单功能
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 获取当前歌词和前后歌词
  const getCurrentLyrics = () => {
    if (!currentMusic?.lyrics || !Array.isArray(currentMusic.lyrics) || currentLyricIndex === -1) {
      return [];
    }
    
    const lyrics = currentMusic.lyrics;
    const current = lyrics[currentLyricIndex];
    const prev = currentLyricIndex > 0 ? lyrics[currentLyricIndex - 1] : null;
    const next = currentLyricIndex < lyrics.length - 1 ? lyrics[currentLyricIndex + 1] : null;
    
    return [prev, current, next].filter((lyric): lyric is NonNullable<typeof lyric> => lyric !== null);
  };

  // 渲染歌词文字
  const renderLyricText = (text: string, isCurrent: boolean) => {
    if (isCurrent) {
      return <span className="text-blue-400 dark:text-blue-300 font-medium">{text}</span>;
    }
    return <span className="text-gray-600 dark:text-gray-400">{text}</span>;
  };

  if (!currentMusic) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50" style={{ bottom: '40px' }}>
      {/* 歌词显示区域 */}
      {showLyrics && (
        <div className="flex justify-center mb-2.5">
          <div className="bg-white/30 dark:bg-black/40 backdrop-blur-xl border border-white/30 dark:border-white/20 rounded-2xl shadow-lg w-full max-w-4xl mx-4">
            <div className="px-6 py-4">
              <div className="flex flex-col space-y-3">
                {(() => {
                  const lyrics = getCurrentLyrics();
                  
                  // 如果没有歌词数据，显示歌曲信息
                  if (!currentMusic.lyrics || !Array.isArray(currentMusic.lyrics) || currentMusic.lyrics.length === 0) {
                    return (
                      <>
                        <div className="text-center">
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            {currentMusic.title}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {currentMusic.artist}
                          </p>
                        </div>
                      </>
                    );
                  }
                  
                  // 如果歌词数据存在但没有当前歌词索引
                  if (currentLyricIndex === -1) {
                    return (
                      <>
                        <div className="text-center">
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            {currentMusic.title}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {currentMusic.artist}
                          </p>
                        </div>
                      </>
                    );
                  }
                  
                  // 显示歌词
                  const currentLyric = currentMusic.lyrics[currentLyricIndex];
                  const nextLyric = currentMusic.lyrics[currentLyricIndex + 1];
                  
                  return (
                    <>
                      {/* 当前歌词 */}
                      <div className="text-center">
                        <p className="text-lg font-medium min-h-[1.5rem]">
                          {currentLyric ? (
                            renderLyricText(
                              currentLyric.text, 
                              true
                            )
                          ) : (
                            <span className="text-gray-400">等待歌词...</span>
                          )}
                        </p>
                      </div>
                      
                      {/* 下一句歌词 */}
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 min-h-[1.25rem]">
                          {nextLyric ? nextLyric.text : ''}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 播放器控制区域 */}
      <div className="flex justify-center">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-black/10 w-full max-w-4xl mx-4">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between" style={{ height: '50px' }}>
              {/* 左侧：封面和音乐信息 */}
              <div className="flex items-center space-x-4 min-w-0">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-md">
                  {currentMusic.cover ? (
                    <img
                      src={currentMusic.cover}
                      alt={currentMusic.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center ${currentMusic.cover ? 'hidden' : ''}`}>
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                </div>
                <div className="min-w-0 flex-1 hidden sm:block">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {currentMusic.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {currentMusic.artist}
                  </p>
                </div>
              </div>

              {/* 中间：播放控制按钮 */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrevious}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>
                
                <button
                  onClick={handlePlayPause}
                  className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                
                <button
                  onClick={handleNext}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>
              </div>

              {/* 右侧：进度条、音量、歌词、收藏 */}
              <div className="flex items-center space-x-4 flex-1 justify-end min-w-0">
                {/* 进度条 */}
                <div className="flex items-center space-x-2 flex-1 max-w-xs min-w-0 hidden md:flex">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8 flex-shrink-0 font-mono">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer min-w-0 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-pink-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:shadow-xl [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-br [&::-moz-range-thumb]:from-purple-500 [&::-moz-range-thumb]:to-pink-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-200 [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:hover:shadow-xl"
                      style={{
                        background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(currentTime / (duration || 1)) * 100}%, #e5e7eb ${(currentTime / (duration || 1)) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8 flex-shrink-0 font-mono">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* 音量控制 */}
                <div className="flex items-center space-x-2 flex-shrink-0 hidden lg:flex">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-pink-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:shadow-lg [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-br [&::-moz-range-thumb]:from-purple-500 [&::-moz-range-thumb]:to-pink-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-200 [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:hover:shadow-lg"
                    style={{
                      background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>

                {/* 歌词按钮 */}
                <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  className={`px-3 py-1.5 rounded-full transition-all duration-200 flex-shrink-0 hover:scale-105 text-xs font-medium ${
                    showLyrics 
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 shadow-md' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  歌词
                </button>

                {/* 收藏按钮 */}
                <button
                  onClick={handleFavorite}
                  className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 hover:scale-105 ${
                    isFavorite 
                      ? 'text-red-500 hover:text-red-600 shadow-md' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                >
                  <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerControl; 