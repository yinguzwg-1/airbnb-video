import { Music } from "@/app/types/music";
import { useMemo } from "react";
import { AudioTrack } from "@/app/types/music-player";
import MusicCard from "./MusicCard";

// 分类标题组件
const CategoryTitle = ({ 
  icon, 
  title, 
  count, 
  color 
}: { 
  icon: React.ReactNode, 
  title: string, 
  count: number,
  color: string 
}) => (
  <div className={`relative overflow-hidden ${color} rounded-2xl p-6 shadow-lg`}>
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-white/80 mt-1">{count} 个结果</p>
        </div>
      </div>
      <div className="hidden lg:flex items-center gap-2 text-white/80">
        <span className="text-sm">查看全部</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
  </div>
);
interface SearchResultProps {
  searchMusic: { 
    title: Music[], 
    artist: Music[], 
    album: Music[] 
  };
  isCurrentMusicPlaying: (music: AudioTrack) => boolean;
  handlePlaySong: (music: AudioTrack) => void;
  setIsSearch: (value: boolean) => void;
}

const SearchResult = ({ 
  searchMusic, 
  isCurrentMusicPlaying, 
  handlePlaySong,
  setIsSearch 
}: SearchResultProps) => {
  const searchMusicMemo = useMemo(() => {
    return {
      title: searchMusic.title.map((music: Music) => ({
        src: music.mp3,
        title: music.title,
        artist: music.artist,
        album: music.album,
        cover: music.cover,
        duration: Number(music.duration),
        lyrics: music.lyrics,
        genre: music.genre
      })),
      artist: searchMusic.artist.map((music: Music) => ({
        src: music.mp3,
        title: music.title,
        artist: music.artist,
        album: music.album,
        cover: music.cover,
        duration: Number(music.duration),
        lyrics: music.lyrics,
        genre: music.genre
      })),
      album: searchMusic.album.map((music: Music) => ({
        src: music.mp3,
        title: music.title,
        artist: music.artist,
        album: music.album,
        cover: music.cover,
        duration: Number(music.duration),
        lyrics: music.lyrics,
        genre: music.genre
      }))
    };
  }, [searchMusic]);
  const totalResults = searchMusicMemo.title.length + searchMusicMemo.artist.length + searchMusicMemo.album.length;

  if (totalResults === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-lg">暂无搜索结果</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* 简洁的头部 */}
        <div className="flex items-center gap-4 pb-4 border-b dark:border-gray-800">
          <button
            onClick={() => setIsSearch(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-medium text-gray-900 dark:text-white">搜索结果</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">共找到 {totalResults} 个结果</p>
          </div>
        </div>

        <div className="mt-6 space-y-8">
          {/* 歌曲部分 */}
          {searchMusicMemo.title.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">歌曲 ({searchMusicMemo.title.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchMusicMemo.title.map((music: AudioTrack, index: number) => (
                  <MusicCard key={music.src} music={music} index={index} isPlaying={isCurrentMusicPlaying(music)} handlePlaySong={handlePlaySong} />
                ))}
              </div>
            </section>
          )}

          {/* 歌手部分 */}
          {searchMusicMemo.artist.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">歌手 ({searchMusicMemo.artist.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchMusicMemo.artist.map((music: AudioTrack, index: number) => (
                  <MusicCard key={music.src} music={music} index={index} isPlaying={isCurrentMusicPlaying(music)} handlePlaySong={handlePlaySong} />
                ))}
              </div>
            </section>
          )}

          {/* 专辑部分 */}
          {searchMusicMemo.album.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">专辑 ({searchMusicMemo.album.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchMusicMemo.album.map((music: AudioTrack, index: number) => (
                  <MusicCard key={music.src} music={music} index={index} isPlaying={isCurrentMusicPlaying(music)} handlePlaySong={handlePlaySong} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResult;