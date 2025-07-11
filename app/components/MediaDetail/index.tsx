"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { MediaItem, MediaType } from '@/app/types/media';
import { useT } from '@/app/contexts/TranslationContext';
import { FiHeart, FiShare2, FiMessageCircle, FiStar, FiClock, FiCalendar, FiTv, FiFilm, FiSend, FiSmile, FiMoreVertical, FiUsers, FiMic, FiMicOff, FiLoader } from 'react-icons/fi';
import Player from 'xgplayer';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'system' | 'user_join' | 'user_leave';
  isCurrentUser?: boolean;
}

interface MediaDetailProps {
  media?: MediaItem;
}

export default function MediaDetail({ media }: MediaDetailProps) {
  const params = useParams();
  const t = useT();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<Player | null>(null);
  
  // 从路由参数中获取语言设置
  const currentLang = params?.lang as string || 'zh';
  const isEn = currentLang === 'en';
  // 播放器状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);

  // 聊天室状态
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'system',
      username: '系统',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=system',
      content: '欢迎来到观影聊天室！',
      timestamp: new Date().toISOString(),
      type: 'system'
    },
    {
      id: '2',
      userId: 'user1',
      username: '电影爱好者',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
      content: '大家好！这部电影真的很震撼',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      type: 'text'
    },
    {
      id: '3',
      userId: 'user2',
      username: '科幻迷',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
      content: '诺兰的镜头语言太棒了，每一帧都是艺术品',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      type: 'text'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(42);
  const [isMicOn, setIsMicOn] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const currentMedia = media;



  // 初始化西瓜播放器
  useEffect(() => {
    if (!playerRef.current || !currentMedia) return;

    // 模拟视频URL（实际项目中应该从API获取）
    const videoUrl = 'https://sf1-cdn-tos.douyinstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4';
    
    const player = new Player({
      el: playerRef.current,
      url: videoUrl,
      poster: currentMedia.poster,
      width: '100%',
      height: '100%',
      autoplay: false,
      volume: 0.6,
      fluid: true,
      playsinline: true,
      pip: true,
      screenShot: true,
      download: true,
      lang: 'zh-cn',
      whitelist: ['*'],
      ignores: ['time', 'volume', 'play'],
      customType: {
        m3u8: function (video: any, url: string) {
          // 可以在这里处理m3u8格式
        }
      }
    });

    // 播放器事件监听
    player.on('ready', () => {
      setIsLoading(false);
      setDuration(player.duration);
    });

    player.on('play', () => {
      setIsPlaying(true);
    });

    player.on('pause', () => {
      setIsPlaying(false);
    });

    player.on('timeupdate', () => {
      setCurrentTime(player.currentTime);
    });

    player.on('volumechange', () => {
      setVolume(player.volume);
      setIsMuted(player.muted);
    });

    player.on('ended', () => {
      setIsPlaying(false);
    });

    player.on('error', (err: any) => {
      setPlayerError('视频加载失败，请稍后重试');
      setIsLoading(false);
      console.error('Player error:', err);
    });

    playerInstanceRef.current = player;

    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
      }
    };
  }, [currentMedia]);

  const toggleLike = () => setIsLiked(!isLiked);
  const toggleMic = () => setIsMicOn(!isMicOn);

  // 发送消息
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: 'currentUser',
      username: '我',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentUser',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
      isCurrentUser: true
    };

    setMessages([...messages, message]);
    setNewMessage('');
    
    // 滚动到底部
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  // 处理回车发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 格式化聊天时间
  const formatChatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 自动滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  // 如果没有媒体数据，显示加载状态
  if (!currentMedia) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-responsive">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-responsive">加载中...</p>
        </div>
      </div>
    );
  }
  // 如果没有媒体数据，显示加载状态
  if (!currentMedia) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-responsive">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-responsive">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部信息栏 */}
      <div className="header-info">
        <div className="container mx-auto px-responsive py-responsive">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
              {currentMedia.poster && (
                <img 
                  src={currentMedia.poster} 
                  alt={currentMedia.title}
                  className="w-12 h-16 md:w-16 md:h-24 object-cover rounded-lg shadow-md flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="title text-responsive-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                  {isEn ? currentMedia.title_en : currentMedia.title}
                </h1>
                <div className="meta flex items-center space-x-2 md:space-x-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {currentMedia.rating && (
                    <span className="flex items-center text-nowrap">
                      <FiStar className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 mr-1 flex-shrink-0" />
                      <span className="text-nowrap">{currentMedia.rating}</span>
                    </span>
                  )}
                  {currentMedia.year && (
                    <span className="flex items-center text-nowrap">
                      <FiCalendar className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />
                      <span className="text-nowrap">{currentMedia.year}</span>
                    </span>
                  )}
                  {currentMedia.type === MediaType.MOVIE && 'duration' in currentMedia && currentMedia.duration && (
                    <span className="flex items-center text-nowrap">
                      <FiFilm className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />
                      <span className="text-nowrap">{currentMedia.duration}分钟</span>
                    </span>
                  )}
                  {currentMedia.type === MediaType.TV && 'seasons' in currentMedia && currentMedia.seasons && (
                    <span className="flex items-center text-nowrap">
                      <FiTv className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />
                      <span className="text-nowrap">{currentMedia.seasons}季</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="button-group flex-shrink-0">
              <button
                onClick={toggleLike}
                className={`p-2 rounded-full transition-colors ${
                  isLiked 
                    ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                <FiHeart className={`w-4 h-4 md:w-5 md:h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <FiShare2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="container mx-auto px-responsive py-responsive">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* 左侧播放器区域 */}
          <div className="lg:col-span-2">
            <div className="player-container">
              {/* 西瓜播放器 */}
              <div className="relative aspect-video bg-gray-900">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="text-center text-white">
                      <FiLoader className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p className="text-responsive">视频加载中...</p>
                    </div>
                  </div>
                )}
                
                {playerError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="text-center text-white p-responsive">
                      <p className="mb-2 text-responsive">{playerError}</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="btn-mobile px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        重新加载
                      </button>
                    </div>
                  </div>
                )}
                
                <div ref={playerRef} className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* 右侧聊天室 */}
          <div className="lg:col-span-1">
            <div className="chat-container">
              {/* 聊天室头部 */}
              <div className="p-responsive border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiMessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-responsive">观影聊天室</h3>
                      <div className="flex items-center space-x-2 text-xs md:text-sm text-blue-100">
                        <FiUsers className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="text-nowrap">{onlineUsers} 人在线</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors flex-shrink-0">
                    <FiMoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 聊天消息区域 */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-responsive space-y-3 md:space-y-4"
              >
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex ${message.isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[85%] md:max-w-[80%]`}>
                      {!message.isCurrentUser && message.type !== 'system' && (
                        <img
                          src={message.avatar}
                          alt={message.username}
                          className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0"
                        />
                      )}
                      
                      <div className={`flex flex-col ${message.isCurrentUser ? 'items-end' : 'items-start'} flex-1 min-w-0`}>
                        {message.type !== 'system' && !message.isCurrentUser && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-nowrap">
                            {message.username}
                          </span>
                        )}
                        
                        <div className={`px-3 py-2 rounded-lg text-sm chat-message ${
                          message.type === 'system' 
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-center'
                            : message.isCurrentUser
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}>
                          {message.content}
                        </div>
                        
                        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-nowrap">
                          {formatChatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">正在输入...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 输入区域 */}
              <div className="p-responsive border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                <div className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="发送消息..."
                      className="input-mobile"
                      rows={1}
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <FiSmile className="w-4 h-4" />
                      </button>
                      <button
                        onClick={toggleMic}
                        className={`p-1 transition-colors ${
                          isMicOn 
                            ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300' 
                            : 'text-red-500 hover:text-red-600'
                        }`}
                      >
                        {isMicOn ? <FiMic className="w-4 h-4" /> : <FiMicOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="btn-mobile p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <FiSend className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  按 Enter 发送，Shift + Enter 换行
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}