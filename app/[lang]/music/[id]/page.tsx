import { Language, translations } from "../../../i18n";
import { TopBar } from "../../../components";

interface MusicDetailPageProps {
  params: { lang: Language; id: string };
}

export default async function MusicDetailPage({ params }: MusicDetailPageProps) {
  const t = translations[params.lang];

  // 模拟音乐数据
  const musicData = {
    id: params.id,
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    cover: 'https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=Shape+of+You',
    genre: 'Pop',
    duration: '3:53',
    releaseDate: '2017-01-06',
    lyrics: [
      { time: 0, text: 'The club isn\'t the best place to find a lover' },
      { time: 4, text: 'So the bar is where I go' },
      { time: 8, text: 'Me and my friends at the table doing shots' },
      { time: 12, text: 'Drinking fast and then we talk slow' },
      { time: 16, text: 'You come over and start up a conversation with just me' },
      { time: 20, text: 'And trust me I\'ll give it a chance now' },
      { time: 24, text: 'Take my hand, stop, put Van the Man on the jukebox' },
      { time: 28, text: 'And then we start to dance, and now I\'m singing like' },
      { time: 32, text: 'Girl, you know I want your love' },
      { time: 36, text: 'Your love was handmade for somebody like me' },
      { time: 40, text: 'Come on now, follow my lead' },
      { time: 44, text: 'I may be crazy, don\'t mind me' },
      { time: 48, text: 'Say, boy, let\'s not talk too much' },
      { time: 52, text: 'Grab on my waist and put that body on me' },
      { time: 56, text: 'Come on now, follow my lead' },
      { time: 60, text: 'Come, come on now, follow my lead' }
    ]
  };

  // 模拟评论数据
  const comments = [
    {
      id: 1,
      user: '音乐爱好者',
      avatar: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=音',
      content: '这首歌的旋律太棒了，每次听都让人心情愉悦！',
      time: '2小时前',
      likes: 24
    },
    {
      id: 2,
      user: 'Ed粉丝',
      avatar: 'https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=E',
      content: 'Ed Sheeran的嗓音真的太有感染力了，这首歌循环播放中！',
      time: '5小时前',
      likes: 18
    },
    {
      id: 3,
      user: '流行音乐控',
      avatar: 'https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=流',
      content: '2017年的神曲，现在听依然不过时，经典就是经典！',
      time: '1天前',
      likes: 32
    },
    {
      id: 4,
      user: '节奏达人',
      avatar: 'https://via.placeholder.com/40x40/EF4444/FFFFFF?text=节',
      content: '这个节奏感太强了，适合运动时听，很有动力！',
      time: '2天前',
      likes: 15
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800">
      <TopBar lang={params.lang} title={musicData.title} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 左侧播放器 */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/50">
            <div className="text-center">
              {/* 专辑封面 */}
              <div className="relative mb-6">
                <img
                  src={musicData.cover}
                  alt={musicData.title}
                  className="w-80 h-80 mx-auto rounded-2xl shadow-2xl"
                />
                {/* 播放按钮 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-purple-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* 音乐信息 */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {musicData.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">
                  {musicData.artist}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {musicData.album} • {musicData.genre}
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>发行时间: {musicData.releaseDate}</span>
                  <span>时长: {musicData.duration}</span>
                </div>
              </div>

              {/* 进度条 */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">0:00</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-1/3"></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{musicData.duration}</span>
                </div>
              </div>

              {/* 控制按钮 */}
              <div className="flex items-center justify-center gap-6">
                <button className="p-3 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>
                <button className="p-3 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h2v16H6zm10 0h2v16h-2z"/>
                  </svg>
                </button>
                <button className="p-3 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>
                <button className="p-3 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* 右侧歌词展示 */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">歌词</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {musicData.lyrics.map((line, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg transition-all duration-300 cursor-pointer ${
                    index === 2 ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    {Math.floor(line.time / 60)}:{(line.time % 60).toString().padStart(2, '0')}
                  </p>
                  <p className="text-gray-900 dark:text-white leading-relaxed">
                    {line.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 评论区域 */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">评论 ({comments.length})</h2>
            <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium transition-colors duration-300">
              写评论
            </button>
          </div>

          {/* 评论列表 */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <img
                  src={comment.avatar}
                  alt={comment.user}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {comment.user}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {comment.time}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span className="text-sm">{comment.likes}</span>
                    </button>
                    <button className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm">
                      回复
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
