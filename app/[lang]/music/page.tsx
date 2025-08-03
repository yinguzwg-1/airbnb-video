"use client";

import { useState } from 'react';
import { Language, translations } from "../../i18n";
import { TopBar, UploadMusicModal } from "../../components";

interface MusicPageProps {
  params: { lang: Language };
}

export default function MusicPage({ params }: MusicPageProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const t = translations[params.lang];

  // 筛选项数据
  const filterOptions = [
    { id: 'today', label: '今日推荐', icon: '🔥', active: true },
    { id: 'playlist', label: '歌单广场', icon: '📚' },
    { id: 'genre', label: '分类浏览', icon: '🎼' },
    { id: 'artist', label: '歌手专区', icon: '🎤' },
    { id: 'album', label: '专辑推荐', icon: '💿' }
  ];

  const musicList = [
    { id: '1', title: 'Shape of You', artist: 'Ed Sheeran', album: '÷ (Divide)', cover: 'https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Shape+of+You', genre: 'Pop', duration: '3:53' },
    { id: '2', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', cover: 'https://via.placeholder.com/300x300/DC2626/FFFFFF?text=Blinding+Lights', genre: 'Synth-pop', duration: '3:20' },
    { id: '3', title: 'Dance Monkey', artist: 'Tones and I', album: 'The Kids Are Coming', cover: 'https://via.placeholder.com/300x300/059669/FFFFFF?text=Dance+Monkey', genre: 'Pop', duration: '3:29' },
    { id: '4', title: 'Someone Like You', artist: 'Adele', album: '21', cover: 'https://via.placeholder.com/300x300/7C3AED/FFFFFF?text=Someone+Like+You', genre: 'Soul', duration: '4:45' },
    { id: '5', title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', album: 'Uptown Special', cover: 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Uptown+Funk', genre: 'Funk', duration: '3:56' },
    { id: '6', title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', album: 'Vida', cover: 'https://via.placeholder.com/300x300/EF4444/FFFFFF?text=Despacito', genre: 'Latin Pop', duration: '4:41' },
    { id: '7', title: 'Bad Guy', artist: 'Billie Eilish', album: 'When We All Fall Asleep, Where Do We Go?', cover: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Bad+Guy', genre: 'Alternative', duration: '3:14' },
    { id: '8', title: 'Old Town Road', artist: 'Lil Nas X', album: '7', cover: 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=Old+Town+Road', genre: 'Country Rap', duration: '2:37' }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800">
      <TopBar lang={params.lang} title="音乐搜索">
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">发现音乐</h2>
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
            {musicList.map((music, index) => (
              <div 
                key={index} 
                className="transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fade-in-up"
                style={{ 
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-white/20 dark:border-gray-700/50">
                  <div className="relative overflow-hidden">
                    <img
                      src={music.cover}
                      alt={music.title}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* 播放按钮遮罩 */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
                        <div className="w-16 h-16 bg-white bg-opacity-95 rounded-full flex items-center justify-center shadow-2xl">
                          <svg className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 text-white text-xs">
                      {music.duration}
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
                      {music.artist} / {music.album}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 上传音乐弹窗 */}
      <UploadMusicModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
} 