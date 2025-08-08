"use client";
import { Music } from "@/app/types/music";
import { TopBar, UploadMusicModal } from "../";
import { config } from "@/app/config";
import { useEffect, useMemo, useState } from "react";

import { Language, translations } from "@/app/i18n";
import playerManager from "@/app/common/MusicPlayerManager";
import { AudioTrack } from "@/app/types/music-player";
import MusicPlayerControl from "../Common/MusicPlayerControl";
import { get } from "@/app/utils/apiUtils";
import MusicMain from "./components/MusicMain";
import SearchResult from "./components/SearchResult";

const MusicHomePage = ({ musicList, lang }: { musicList: Music[], lang: Language }) => {
 
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const t = translations[lang];
  const [isSearch, setIsSearch] = useState(false);
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
  const [searchMusic, setSearchMusic] = useState<{
    title: Music[],
    artist: Music[],
    album: Music[]
  }>({
    title: [],
    artist: [],
    album: []
  });
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


  // 检查当前音乐是否正在播放
  const isCurrentMusicPlaying = (music: AudioTrack) => {
    try {
      return currentMusic?.src === music.src && isPlaying;
    } catch (error) {
      console.warn('检查播放状态失败:', error);
      return false;
    }
  };
  const handleSearch = async () => {
    console.log('[DEBUG] 搜索:', searchValue);
    const res = await get('/api/music/search', {
      params: { 
        keyword: searchValue
      }
    });
    console.log('[DEBUG] 搜索结果:', res);
    setSearchMusic(res.data);
    setIsSearch(true);
  }
  return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 pb-32">
    <TopBar lang={lang} title="音乐">
      {/* 搜索栏通过children传入 */}
      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative">
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            type="text"
            placeholder="搜索歌手、歌名或专辑..."
            className="w-full px-4 py-2 pl-10 pr-20 text-gray-900 dark:text-white bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-lg outline-none focus:border-purple-500 transition-all duration-300"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button onClick={handleSearch} className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-1 rounded-md text-sm transition-all duration-300 shadow-lg">
            搜索
          </button>
        </div>
      </div>
    </TopBar>

    {/* 音乐内容区域 */}
    {isSearch ? <SearchResult searchMusic={searchMusic} isCurrentMusicPlaying={isCurrentMusicPlaying} handlePlaySong={handlePlaySong} setIsSearch={setIsSearch} /> : <MusicMain musicListMemo={musicListMemo} isCurrentMusicPlaying={isCurrentMusicPlaying} handlePlaySong={handlePlaySong} />}   

    {/* 播放器控制组件 */}
    <MusicPlayerControl 
      currentMusic={currentMusic} 
      onMusicChange={handleMusicChange}
    />
  </div>
};

export default MusicHomePage; 