"use client";

import { config as configApi } from '@/app/config';
import { sliceFile, uploadChunks } from '@/app/utils/uploadUtils';
import { useState, useRef, useCallback } from 'react';

interface UploadMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'paused' | 'completed' | 'error';
  error?: string;
}

interface MusicMetadata {
  title: string; // 歌曲标题
  artist: string; // 歌手
  album: string; // 专辑
  genre: string; // 流派
  duration: string; // 时长
  releaseDate: string; // 发行日期
  language: string; // 语言
  tags: string[]; // 标签
  mood: string; // 心情
  lyrics: Array<{ time: number; text: string }>; // 歌词
  cover: string; // 封面图片URL
}

export default function UploadMusicModal({ isOpen, onClose }: UploadMusicModalProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'metadata'>('upload');
  const [selectedFile, setSelectedFile] = useState<UploadFile | null>(null);
  const [musicMetadata, setMusicMetadata] = useState<MusicMetadata>({
    title: '',
    artist: '',
    album: '',
    genre: '',
    duration: '',
    releaseDate: '',
    language: '中文',
    tags: [],
    mood: '',
    lyrics: [],
    cover: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const uploadTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 处理文件选择
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;

    // 取出文件列表，并进行分片
    for (const file of Array.from(files)) {
      const chunks = sliceFile(file)
      // 将分片上传到服务器
      const res = await uploadChunks(chunks, `${configApi.NEXT_PUBLIC_API_URL}/upload/chunk`)
      console.log('res', res);
      setUploadFiles(prev => [...prev, {
        ...res,
        size: file.size,
        name: file.name,
      }]);
    }

  }, []);

  // 模拟上传过程
  const simulateUpload = (fileId: string) => {
    const updateProgress = (progress: number) => {
      setUploadFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, progress, status: progress >= 100 ? 'completed' : 'uploading' }
            : file
        )
      );
    };

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        uploadTimeoutsRef.current.delete(fileId);
      }
      updateProgress(progress);
    }, 200);

    uploadTimeoutsRef.current.set(fileId, interval);
  };

  // 暂停上传
  const pauseUpload = (fileId: string) => {
    const timeout = uploadTimeoutsRef.current.get(fileId);
    if (timeout) {
      clearInterval(timeout);
      uploadTimeoutsRef.current.delete(fileId);
    }
    
    setUploadFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, status: 'paused' } : file
      )
    );
  };

  // 继续上传
  const resumeUpload = (fileId: string) => {
    const file = uploadFiles.find(f => f.id === fileId);
    if (file && file.status === 'paused') {
      simulateUpload(fileId);
      setUploadFiles(prev => 
        prev.map(f => 
          f.id === fileId ? { ...f, status: 'uploading' } : f
        )
      );
    }
  };

  // 取消上传
  const cancelUpload = (fileId: string) => {
    const timeout = uploadTimeoutsRef.current.get(fileId);
    if (timeout) {
      clearInterval(timeout);
      uploadTimeoutsRef.current.delete(fileId);
    }
    
    setUploadFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // 编辑音乐元数据
  const editMetadata = (file: UploadFile) => {
    setSelectedFile(file);
    setCurrentStep('metadata');
  };

  // 保存元数据并完成上传
  const saveMetadata = () => {
    if (selectedFile) {
      // 这里可以调用API保存元数据
      console.log('保存音乐元数据:', { file: selectedFile, metadata: musicMetadata });
      setCurrentStep('upload');
      setSelectedFile(null);
             // 重置元数据表单
       setMusicMetadata({
         title: '',
         artist: '',
         album: '',
         genre: '',
         duration: '',
         releaseDate: '',
         language: '中文',
         tags: [],
         mood: '',
         lyrics: [],
         cover: '',
       });
    }
  };

  // 添加标签
  const addTag = (tag: string) => {
    if (tag.trim() && !musicMetadata.tags.includes(tag.trim())) {
      setMusicMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  // 移除标签
  const removeTag = (tagToRemove: string) => {
    setMusicMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 添加歌词行
  const addLyricLine = () => {
    setMusicMetadata(prev => ({
      ...prev,
      lyrics: [...prev.lyrics, { time: 0, text: '' }]
    }));
  };

  // 更新歌词行
  const updateLyricLine = (index: number, field: 'time' | 'text', value: string | number) => {
    setMusicMetadata(prev => ({
      ...prev,
      lyrics: prev.lyrics.map((line, i) => 
        i === index ? { ...line, [field]: value } : line
      )
    }));
  };

  // 移除歌词行
  const removeLyricLine = (index: number) => {
    setMusicMetadata(prev => ({
      ...prev,
      lyrics: prev.lyrics.filter((_, i) => i !== index)
    }));
  };

  // 处理封面图片上传
  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
      }
      
      // 验证文件大小 (最大 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('图片文件大小不能超过 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setMusicMetadata(prev => ({
          ...prev,
          cover: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 移除封面图片
  const removeCover = () => {
    setMusicMetadata(prev => ({
      ...prev,
      cover: ''
    }));
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // 获取状态图标
  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading':
        return (
          <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'paused':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
             {/* 弹窗内容 */}
       <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[95vh] overflow-hidden">
                 {/* 弹窗头部 */}
         <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
           <div className="flex items-center gap-4">
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">
               {currentStep === 'upload' ? '上传音乐' : '编辑音乐信息'}
             </h2>
             {currentStep === 'metadata' && (
               <button
                 onClick={() => setCurrentStep('upload')}
                 className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
               >
                 返回上传列表
               </button>
             )}
           </div>
           <button
             onClick={onClose}
             className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
           >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
         </div>

                 {/* 弹窗主体 */}
         <div className="p-6">
           {currentStep === 'upload' ? (
             <>
               {/* 文件拖拽区域 */}
               <div
                 className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                   isDragging
                     ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                     : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
                 }`}
                 onDragOver={handleDragOver}
                 onDragLeave={handleDragLeave}
                 onDrop={handleDrop}
               >
                 <div className="mb-4">
                   <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                   </svg>
                 </div>
                 <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                   拖拽音频文件到这里
                 </p>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                   支持 MP3, WAV, FLAC, AAC 格式，最大 100MB
                 </p>
                 <button
                   onClick={() => fileInputRef.current?.click()}
                   className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
                 >
                   选择文件
                 </button>
                 <input
                   ref={fileInputRef}
                   type="file"
                   multiple
                   accept=".mp3,.wav,.flac,.aac,.m4a"
                   className="hidden"
                   onChange={(e) => handleFileSelect(e.target.files)}
                 />
               </div>

               {/* 上传列表 */}
               {uploadFiles.length > 0 && (
                 <div className="mt-6">
                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">上传列表</h3>
                   <div className="space-y-4 max-h-64 overflow-y-auto">
                     {uploadFiles.map((file) => (
                       <div
                         key={file.id}
                         className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                       >
                         <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center gap-3">
                             {getStatusIcon(file.status)}
                             <div className="flex-1 min-w-0">
                               <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                 {file.name}
                               </p>
                               <p className="text-xs text-gray-500 dark:text-gray-400">
                                 {formatFileSize(file.size)}
                               </p>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             {file.status === 'completed' && (
                               <button
                                 onClick={() => editMetadata(file)}
                                 className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                 title="编辑音乐信息"
                               >
                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                   <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                 </svg>
                               </button>
                             )}
                             {file.status === 'uploading' && (
                               <button
                                 onClick={() => pauseUpload(file.id)}
                                 className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 p-1"
                               >
                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                   <path d="M6 4h2v16H6zm10 0h2v16h-2z"/>
                                 </svg>
                               </button>
                             )}
                             {file.status === 'paused' && (
                               <button
                                 onClick={() => resumeUpload(file.id)}
                                 className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-1"
                               >
                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                   <path d="M8 5v14l11-7z"/>
                                 </svg>
                               </button>
                             )}
                             <button
                               onClick={() => cancelUpload(file.id)}
                               className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                             >
                               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                 <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                               </svg>
                             </button>
                           </div>
                         </div>
                         
                         {/* 进度条 */}
                         <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                           <div
                             className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                             style={{ width: `${file.progress}%` }}
                           />
                         </div>
                         <div className="flex justify-between items-center mt-2">
                           <span className="text-xs text-gray-500 dark:text-gray-400">
                             {file.progress.toFixed(1)}%
                           </span>
                           <span className="text-xs text-gray-500 dark:text-gray-400">
                             {file.status === 'completed' ? '上传完成' : 
                              file.status === 'paused' ? '已暂停' : 
                              file.status === 'error' ? '上传失败' : '上传中...'}
                           </span>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </>
           ) : (
                           /* 元数据编辑界面 */
              <div className="space-y-6 max-h-[calc(95vh-200px)] overflow-y-auto">
                {/* 封面图片上传 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    封面图片
                  </label>
                  <div className="flex items-start gap-6">
                    {/* 封面预览 */}
                    <div className="flex-shrink-0">
                      {musicMetadata.cover ? (
                        <div className="relative">
                          <img
                            src={musicMetadata.cover}
                            alt="封面预览"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                          />
                          <button
                            onClick={removeCover}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            title="移除封面"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
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
                        {musicMetadata.cover ? '更换封面' : '上传封面'}
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
                     value={musicMetadata.title}
                     onChange={(e) => setMusicMetadata(prev => ({ ...prev, title: e.target.value }))}
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
                     value={musicMetadata.artist}
                     onChange={(e) => setMusicMetadata(prev => ({ ...prev, artist: e.target.value }))}
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
                     value={musicMetadata.album}
                     onChange={(e) => setMusicMetadata(prev => ({ ...prev, album: e.target.value }))}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                     placeholder="输入专辑名称"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     音乐类型
                   </label>
                   <select
                     value={musicMetadata.genre}
                     onChange={(e) => setMusicMetadata(prev => ({ ...prev, genre: e.target.value }))}
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
                     value={musicMetadata.releaseDate}
                     onChange={(e) => setMusicMetadata(prev => ({ ...prev, releaseDate: e.target.value }))}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     语言
                   </label>
                   <select
                     value={musicMetadata.language}
                     onChange={(e) => setMusicMetadata(prev => ({ ...prev, language: e.target.value }))}
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
                       value={musicMetadata.mood}
                       onChange={(e) => setMusicMetadata(prev => ({ ...prev, mood: e.target.value }))}
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
                   {musicMetadata.tags.map((tag, index) => (
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
                   <button
                     onClick={addLyricLine}
                     className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                   >
                     添加歌词行
                   </button>
                 </div>
                 <div className="space-y-2 max-h-64 overflow-y-auto">
                   {musicMetadata.lyrics.map((line, index) => (
                     <div key={index} className="flex gap-2">
                       <input
                         type="number"
                         value={line.time}
                         onChange={(e) => updateLyricLine(index, 'time', parseInt(e.target.value) || 0)}
                         className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs dark:bg-gray-700 dark:text-white"
                         placeholder="时间(秒)"
                       />
                       <input
                         type="text"
                         value={line.text}
                         onChange={(e) => updateLyricLine(index, 'text', e.target.value)}
                         className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs dark:bg-gray-700 dark:text-white"
                         placeholder="歌词内容"
                       />
                       <button
                         onClick={() => removeLyricLine(index)}
                         className="px-2 py-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs"
                       >
                         删除
                       </button>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           )}
         </div>

                 {/* 弹窗底部 */}
         <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
           <button
             onClick={onClose}
             className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
           >
             取消
           </button>
           {currentStep === 'metadata' ? (
             <button
               onClick={saveMetadata}
               className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
             >
               保存信息
             </button>
           ) : (
             <button
               onClick={onClose}
               className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
             >
               完成
             </button>
           )}
         </div>
      </div>
    </div>
  );
} 