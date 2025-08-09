import { AudioTrack } from "@/app/types/music-player";

const MusicCard = ({ music, index, isPlaying, handlePlaySong }: { music: AudioTrack, index: number, isPlaying: boolean, handlePlaySong: (music: AudioTrack) => void }) => {
  // 音频可视化组件
  const AudioVisualizer = () => (
    <div className="flex items-end space-x-0.5">
      <div 
        className="w-0.5 h-2 bg-purple-400 rounded-full origin-bottom animate-audio-wave"
        style={{ animationDelay: '0ms' }}
      ></div>
      <div 
        className="w-0.5 h-3 bg-purple-400 rounded-full origin-bottom animate-audio-wave"
        style={{ animationDelay: '0.2s' }}
      ></div>
      <div 
        className="w-0.5 h-2 bg-purple-400 rounded-full origin-bottom animate-audio-wave"
        style={{ animationDelay: '0.4s' }}
      ></div>
    </div>
  );

  return <div
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
          src={music.cover}
          alt={music.title}
          className="w-full h-56 object-cover transition-transform duration-500"
          crossOrigin="anonymous"
          
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
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
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
          {music.genre && (
            <span className="text-blue-600 dark:text-blue-400 text-xs border border-blue-300 dark:border-blue-600 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              {music.genre}
            </span>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-1">
          {music.artist} / 《{music.album}》
        </p>
      </div>
    </div>
  </div>;
};

export default MusicCard;