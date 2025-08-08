import { useState } from "react";
import UploadMusicModal from "../../UploadMusicModal";
import MusicCard from "./MusicCard";
import { AudioTrack } from "@/app/types/music-player";
const filterOptionsType = {
  Today: 1,
  Playlist: 2,
  Genre: 3,
  Artist: 4,
  Album: 5
}
const MusicMain = ({ musicListMemo, isCurrentMusicPlaying, handlePlaySong }: { musicListMemo: AudioTrack[], isCurrentMusicPlaying: (music: AudioTrack) => boolean, handlePlaySong: (music: AudioTrack) => void }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterOption, setFilterOption] = useState(filterOptionsType.Today);
  // 筛选项数据
  const filterOptions = [
    { id: filterOptionsType.Today, label: '今日推荐', icon: '🔥', active: true },
    { id: filterOptionsType.Playlist, label: '歌单广场', icon: '📚' },
    { id: filterOptionsType.Genre, label: '分类浏览', icon: '🎼' },
    { id: filterOptionsType.Artist, label: '歌手专区', icon: '🎤' },
    { id: filterOptionsType.Album, label: '专辑推荐', icon: '💿' }
  ]; 
  return <div className="max-w-7xl mx-auto px-4 py-8">
    {/* 筛选项 */}
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              className={`flex box-border items-center gap-2 px-4 py-2 rounded-xl ${option.id === filterOption
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
                }`}
              onClick={() => setFilterOption(option.id)}
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
             <MusicCard            
              key={index} 
              music={music}
              index={index}
              isPlaying={isPlaying}
              handlePlaySong={handlePlaySong}

            />
          );
        })}
      </div>
    </div>
    {/* 上传音乐弹窗 */}
    <UploadMusicModal
      isOpen={isUploadModalOpen}
      onClose={() => setIsUploadModalOpen(false)}
    />
  </div>;
};

export default MusicMain;