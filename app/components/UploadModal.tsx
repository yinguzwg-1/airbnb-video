"use client";

import { useState, useEffect } from "react";
import { MdClose, MdCloudUpload, MdDelete } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../stores/useAuthStore";
import { mutate } from "swr";
import { i18n } from "../config/i18n";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
}

interface FileWithPreview {
  file: File;
  preview: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
}

export default function UploadModal({ isOpen, onClose, currentLang }: UploadModalProps) {
  const t = i18n[currentLang as "zh" | "en"] || i18n.zh;
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { token } = useAuthStore();

  // 清理预览 URL 防止内存泄漏
  useEffect(() => {
    if (!isOpen) {
      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles([]);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const remainingSlots = 20 - files.length;
      
      if (remainingSlots <= 0) {
        alert(t.upload.limitReached);
        return;
      }

      const newFiles = selectedFiles.slice(0, remainingSlots).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        status: 'idle' as const
      }));

      setFiles(prev => [...prev, ...newFiles]);
    }
    // 重置 input 以便可以重复选择同一张图（如果需要）
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setIsUploading(true);

    // 并发上传所有文件
    const uploadPromises = files.map(async (fileItem, index) => {
      // 已经上传成功的跳过
      if (fileItem.status === 'success') return true;

      // 更新当前文件状态为上传中
      setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'uploading' } : f));

      const formData = new FormData();
      formData.append("file", fileItem.file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error(t.upload.failed);

        setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'success' } : f));
        return true;
      } catch (error) {
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'error' } : f));
        return false;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successCount = results.filter(Boolean).length;

    if (successCount === files.length) {
      // 先关闭弹窗，再刷新列表（避免 alert 阻塞刷新）
      handleClose();
      // 刷新 SWR 缓存：强制重新验证所有匹配的 key
      mutate(
        (key: string | any[]) => 
          (Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/api/upload/list')) || 
          (typeof key === 'string' && key.includes('/api/upload/list')),
        undefined,
        { revalidate: true }
      );
    } else {
      const failedCount = files.length - successCount;
      alert(t.upload.partialSuccess.replace('{success}', successCount.toString()).replace('{failed}', failedCount.toString()));
    }
    
    setIsUploading(false);
  };

  const handleClose = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={isUploading ? undefined : handleClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.92, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.92, y: 20, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-sky-100/40 dark:border-sky-900/20"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <button 
                onClick={handleClose} 
                disabled={isUploading}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
              >
                <MdClose className="w-6 h-6" />
              </button>
              <h3 className="text-lg font-bold">{t.upload.title} ({files.length}/20)</h3>
              <div className="w-8" />
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleUpload} className="space-y-6">
                {files.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {files.map((fileItem, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 group border border-gray-200 dark:border-gray-600">
                        {fileItem.file.type.startsWith('video/') ? (
                          <>
                            <video 
                              src={fileItem.preview} 
                              className={`w-full h-full object-cover transition-opacity ${fileItem.status === 'uploading' ? 'opacity-50' : 'opacity-100'}`}
                              muted
                              playsInline
                            />
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/50 text-white text-[10px] font-bold rounded uppercase">
                              Video
                            </div>
                          </>
                        ) : (
                          <img 
                            src={fileItem.preview} 
                            alt="preview" 
                            className={`w-full h-full object-cover transition-opacity ${fileItem.status === 'uploading' ? 'opacity-50' : 'opacity-100'}`}
                          />
                        )}
                        
                        {/* 状态遮罩 */}
                        {fileItem.status === 'uploading' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        
                        {fileItem.status === 'success' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                            <div className="bg-green-500 text-white p-1 rounded-full">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                          </div>
                        )}

                        {fileItem.status === 'error' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-rose-500/20">
                            <span className="text-white text-[10px] font-bold bg-rose-500 px-1.5 py-0.5 rounded">{t.upload.retry}</span>
                          </div>
                        )}

                        {!isUploading && (
                          <button 
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 p-1.5 bg-black/50 hover:bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MdDelete className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {files.length < 20 && !isUploading && (
                      <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-all duration-300 bg-gray-50 dark:bg-gray-900/50">
                        <MdCloudUpload className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-400 mt-1">{t.upload.addMore}</span>
                        <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="relative">
                      <input 
                        type="file" 
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="hidden" 
                        id="file-upload"
                        required
                      />
                      <label 
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl cursor-pointer hover:border-sky-400 dark:hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-all duration-300 bg-gray-50 dark:bg-gray-900/50"
                      >
                        <MdCloudUpload className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-400 font-medium">{t.upload.dropzone}</p>
                        <p className="text-xs text-gray-500 mt-1">{t.upload.support}</p>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button 
                    type="button"
                    onClick={handleClose}
                    disabled={isUploading}
                    className="flex-1 py-3 border border-gray-200 dark:border-gray-700 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                  >
                    {t.upload.cancel}
                  </button>
                  <button 
                    type="submit"
                    disabled={files.length === 0 || isUploading}
                    className="flex-[2] py-3 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? t.upload.uploading : t.upload.confirmUpload.replace('{count}', files.length.toString())}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
