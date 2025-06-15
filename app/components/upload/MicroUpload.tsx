'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MicroUploadProps, UploadFile, UPLOAD_PRESETS } from '../../types/upload';
import { uploadService } from '../../services/uploadService';
import { useTranslation } from '../../contexts/TranslationContext';

const MicroUpload: React.FC<MicroUploadProps> = ({
  isOpen,
  onClose,
  config = UPLOAD_PRESETS.MEDIA_MIX,
  callbacks,
  className = '',
}) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // 处理文件选择
  const handleFileSelect = useCallback((selectedFiles: File[]) => {
    const { valid, errors: validationErrors } = uploadService.validateFiles(
      selectedFiles,
      files,
      config
    );

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setFiles(prev => [...prev, ...valid]);
    setErrors([]);
  }, [files, config]);

  // 处理文件删除
  const handleFileRemove = useCallback((fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.url) {
        uploadService.revokePreviewUrl(file.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  // 处理拖拽事件
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragActive(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    dragCounterRef.current = 0;

    if (e.dataTransfer?.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

  // 添加拖拽事件监听器
  useEffect(() => {
    if (!isOpen) return;

    const handleEvents = (e: DragEvent) => {
      switch (e.type) {
        case 'dragenter':
          handleDragEnter(e);
          break;
        case 'dragleave':
          handleDragLeave(e);
          break;
        case 'dragover':
          handleDragOver(e);
          break;
        case 'drop':
          handleDrop(e);
          break;
      }
    };

    document.addEventListener('dragenter', handleEvents);
    document.addEventListener('dragleave', handleEvents);
    document.addEventListener('dragover', handleEvents);
    document.addEventListener('drop', handleEvents);

    return () => {
      document.removeEventListener('dragenter', handleEvents);
      document.removeEventListener('dragleave', handleEvents);
      document.removeEventListener('dragover', handleEvents);
      document.removeEventListener('drop', handleEvents);
    };
  }, [isOpen, handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  // 处理文件上传
  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setErrors([]);

    try {
      // 更新文件状态为上传中
      setFiles(prev => prev.map(file => ({
        ...file,
        status: 'uploading' as const,
        progress: 0,
      })));

      // 模拟上传（实际项目中替换为真实的上传API）
      const uploadPromises = files.map(async (file) => {
        try {
          const result = await uploadService.simulateUpload(file, (progress) => {
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, progress } : f
            ));
          });
          
          setFiles(prev => prev.map(f => 
            f.id === file.id ? result : f
          ));
          
          return result;
        } catch (error) {
          const errorFile = {
            ...file,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Upload failed',
          };
          
          setFiles(prev => prev.map(f => 
            f.id === file.id ? errorFile : f
          ));
          
          throw error;
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<UploadFile> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);

      if (successfulUploads.length > 0) {
        callbacks?.onSuccess?.(successfulUploads);
      }

      const failedUploads = results.filter(result => result.status === 'rejected');
      if (failedUploads.length > 0) {
        setErrors(prev => [...prev, `${failedUploads.length} 个文件上传失败`]);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setErrors([errorMessage]);
      callbacks?.onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [files, callbacks]);

  // 处理取消
  const handleCancel = useCallback(() => {
    // 清理预览URL
    files.forEach(file => {
      if (file.url) {
        uploadService.revokePreviewUrl(file.url);
      }
    });
    
    setFiles([]);
    setErrors([]);
    setIsUploading(false);
    callbacks?.onCancel?.();
    onClose();
  }, [files, callbacks, onClose]);

  // 格式化允许的格式
  const formatAllowedTypes = useCallback(() => {
    if (!config.allowedTypes) return '';
    return config.allowedTypes.map(type => {
      switch (type) {
        case 'image': return '图片';
        case 'video': return '视频';
        default: return type;
      }
    }).join('、');
  }, [config.allowedTypes]);

  // 渲染文件预览
  const renderFilePreview = (file: UploadFile) => {
    const previewUrl = file.url || uploadService.createPreviewUrl(file.file);
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    return (
      <div key={file.id} className="relative bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
        {/* 预览区域 */}
        <div className="flex items-start space-x-3">
          {/* 预览图/视频 */}
          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden">
            {isImage && previewUrl ? (
              <img 
                src={previewUrl} 
                alt={file.name}
                className="w-full h-full object-cover"
              />
            ) : isVideo && previewUrl ? (
              <video 
                src={previewUrl}
                className="w-full h-full object-cover"
                muted
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* 文件信息 */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {uploadService.formatFileSize(file.size)}
            </p>
            
            {/* 进度条 */}
            {file.status === 'uploading' && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                  <span>{t.upload.uploading}</span>
                  <span>{Math.round(file.progress || 0)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${file.progress || 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* 状态指示 */}
            {file.status === 'success' && (
              <div className="flex items-center mt-1">
                <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-green-600 dark:text-green-400">{t.upload.uploadSuccess}</span>
              </div>
            )}

            {file.status === 'error' && (
              <div className="flex items-center mt-1">
                <svg className="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-red-600 dark:text-red-400">{file.error || t.upload.uploadError}</span>
              </div>
            )}
          </div>

          {/* 删除按钮 */}
          {file.status !== 'uploading' && (
            <button
              onClick={() => handleFileRemove(file.id)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
              title={t.upload.removeFile}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleCancel}
      />
      
      {/* 模态框内容 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl ${className}`}>
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.upload.title}
            </h3>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 内容区域 */}
          <div className="p-6">
            {/* 上传区域 */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple={config.multiple}
                accept={config.accept}
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileSelect(Array.from(e.target.files));
                  }
                }}
                className="hidden"
              />

              {isDragActive ? (
                <div className="text-blue-600 dark:text-blue-400">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium">{t.upload.dragActive}</p>
                </div>
              ) : (
                <div>
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                    {t.upload.dragDropText} {' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium"
                    >
                      {t.upload.clickToSelect}
                    </button>
                  </p>
                  
                  {/* 配置信息 */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    {config.allowedTypes && (
                      <p>{t.upload.supportedFormats}: {formatAllowedTypes()}</p>
                    )}
                    {config.maxSize && (
                      <p>{t.upload.maxFileSize}: {uploadService.formatFileSize(config.maxSize)}</p>
                    )}
                    {config.maxFiles && (
                      <p>{t.upload.maxFiles} {config.maxFiles} {t.upload.files}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 错误信息 */}
            {errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {errors.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 文件列表 */}
            {files.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  已选择文件 ({files.length})
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {files.map(renderFilePreview)}
                </div>
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t.upload.cancel}
            </button>
            
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? t.upload.uploading : t.upload.confirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 使用 Portal 渲染到 body
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};

export default MicroUpload; 