import React, { useRef } from 'react';
import { MusicMetadata } from './types';
import { useUploadLogic } from './useUploadLogic';

interface MusicMetadataEditorProps {
  metadata: MusicMetadata;
  onMetadataChange: (metadata: MusicMetadata) => void;
  fileId: string | undefined;
}

export default function MusicMetadataEditor({
  metadata,
  onMetadataChange,
  fileId
}: MusicMetadataEditorProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const {
    handleFileSelect
  } = useUploadLogic();
  const updateMetadata = (updates: Partial<MusicMetadata>) => {
    onMetadataChange({ ...metadata, ...updates });
  };

  // 添加标签
  const addTag = (tag: string) => {
    if (tag.trim() && !metadata.tags.includes(tag.trim())) {
      updateMetadata({
        tags: [...metadata.tags, tag.trim()]
      });
    }
  };

  // 移除标签
  const removeTag = (tagToRemove: string) => {
    updateMetadata({
      tags: metadata.tags.filter(tag => tag !== tagToRemove)
    });
  };


  // 解析歌词文本并提取时间戳
  const parseLyricsText = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsedLyrics: Array<{ time: number; text: string }> = [];

    lines.forEach(line => {
      // 匹配 [分:秒.毫秒] 格式的时间戳，毫秒可以是1-3位
      const timeMatch = line.match(/\[(\d+):(\d{2})\.(\d{1,3})\]/);
      console.log('---timeMatch-',timeMatch);
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1]);
        const seconds = parseInt(timeMatch[2]);
        const milliseconds = parseInt(timeMatch[3]);
        const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;

        // 提取时间戳后的歌词内容
        const lyricText = line.replace(/\[\d+:\d{2}\.\d{1,3}\]/, '').trim();
        console.log('---lyricText-',lyricText);
        if (lyricText) {
          parsedLyrics.push({
            time: Math.round(totalSeconds * 1000) / 1000, // 保留3位小数
            text: lyricText
          });
        }
      }
    });

    return parsedLyrics;
  };

  // 处理歌词文本变化
  const handleLyricsTextChange = (text: string) => {
    console.log('---handleLyricsTextChange-',text);
    const parsedLyrics = parseLyricsText(text);
    console.log('---parsedLyrics-',parsedLyrics);
    updateMetadata({ lyrics: parsedLyrics });
  };

  // 将当前歌词转换为文本格式
  const getLyricsText = () => {
    return metadata.lyrics
      .map(line => {
        const minutes = Math.floor(line.time / 60);
        const seconds = Math.floor(line.time % 60);
        const milliseconds = Math.round((line.time % 1) * 1000);
        return `[${minutes}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}]${line.text}`;
      })
      .join('\n');
  };

  // 处理封面图片上传
  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
      }

      const res = await handleFileSelect(file, fileId);
      if (res.success) {
        const reader = new FileReader();
        reader.onload = (e) => {
          updateMetadata({ cover: e.target?.result as string });
        };
        reader.readAsDataURL(file);
      } else {
        alert('上传失败');
      }

    }
  };

  // 移除封面图片
  const removeCover = () => {
    updateMetadata({ cover: '' });
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-h-[calc(95vh-200px)] overflow-y-auto">
      {/* 封面图片上传 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          封面图片
        </label>
        <div className="flex items-start gap-6">
          {/* 封面预览 */}
          <div className="flex-shrink-0">
            {metadata.cover ? (
              <div className="relative">
                <img
                  src={metadata.cover}
                  alt="封面预览"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                />
                <button
                  onClick={removeCover}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="移除封面"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* 上传按钮和说明 */}
          <div className="flex-1">
            <button
              onClick={() => coverInputRef.current?.click()}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 mb-3"
            >
              {metadata.cover ? '更换封面' : '上传封面'}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              支持 JPG、PNG、GIF 格式，建议尺寸 500x500 像素，最大 5MB
            </p>
          </div>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            歌曲标题 *
          </label>
          <input
            type="text"
            value={metadata.title}
            onChange={(e) => updateMetadata({ title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="输入歌曲标题"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            歌手 *
          </label>
          <input
            type="text"
            value={metadata.artist}
            onChange={(e) => updateMetadata({ artist: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="输入歌手名称"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            专辑
          </label>
          <input
            type="text"
            value={metadata.album}
            onChange={(e) => updateMetadata({ album: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="输入专辑名称"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            音乐类型
          </label>
          <select
            value={metadata.genre}
            onChange={(e) => updateMetadata({ genre: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">选择类型</option>
            <option value="Pop">流行</option>
            <option value="Rock">摇滚</option>
            <option value="Jazz">爵士</option>
            <option value="Classical">古典</option>
            <option value="Electronic">电子</option>
            <option value="Hip-Hop">嘻哈</option>
            <option value="Country">乡村</option>
            <option value="R&B">R&B</option>
            <option value="Folk">民谣</option>
            <option value="Other">其他</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            发行日期
          </label>
          <input
            type="date"
            value={metadata.release_date}
            onChange={(e) => updateMetadata({ release_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            语言
          </label>
          <select
            value={metadata.language}
            onChange={(e) => updateMetadata({ language: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="中文">中文</option>
            <option value="English">英文</option>
            <option value="Japanese">日文</option>
            <option value="Korean">韩文</option>
            <option value="Other">其他</option>
          </select>
        </div>
      </div>

      {/* 其他设置 */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            心情
          </label>
          <select
            value={metadata.mood}
            onChange={(e) => updateMetadata({ mood: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">选择心情</option>
            <option value="Happy">快乐</option>
            <option value="Sad">伤感</option>
            <option value="Energetic">活力</option>
            <option value="Relaxed">放松</option>
            <option value="Romantic">浪漫</option>
            <option value="Mysterious">神秘</option>
          </select>
        </div>
      </div>

      {/* 标签 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          标签
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {metadata.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="添加标签"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addTag(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="添加标签"]') as HTMLInputElement;
              if (input) {
                addTag(input.value);
                input.value = '';
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            添加
          </button>
        </div>
      </div>

      {/* 歌词编辑 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            歌词
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const defaultLyrics = `[0:14.580]暖暖阳光懒懒爬进窗
              [0:20.990]悠悠微醺淡淡咖啡香
              [0:27.200]恍然你又在身旁
              [0:30.560]笑容星一样明亮
              [3:02.450]够不够`;
                handleLyricsTextChange(defaultLyrics);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              示例歌词
            </button>

          </div>
        </div>
        <div className="space-y-4">
          {/* 文本输入区域 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              歌词文本 (支持 [分:秒.毫秒] 格式时间戳)
            </label>
            <textarea
              value={getLyricsText()}
              onChange={(e) => handleLyricsTextChange(e.target.value)}
              className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              placeholder="请输入歌词，格式如：[0:14.580]歌词内容"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              支持 [分:秒.毫秒] 格式的时间戳，每行一首歌词
            </p>
          </div>

          {/* 解析后的歌词预览 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              解析预览 ({metadata.lyrics.length} 行)
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
              {metadata.lyrics.length > 0 ? (
                metadata.lyrics.map((line, index) => (
                  <div key={index} className="flex items-center gap-2 py-1 text-sm">
                    <span className="text-gray-500 dark:text-gray-400 min-w-[60px]">
                      {Math.floor(line.time / 60)}:{String(Math.floor(line.time % 60)).padStart(2, '0')}.{String(Math.round((line.time % 1) * 1000)).padStart(3, '0')}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{line.text}</span>

                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">暂无歌词</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 