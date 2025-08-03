"use client";

import React, { useState } from 'react';
import { UploadMusicModalProps, UploadFile, MusicMetadata } from './types';
import { getDefaultMusicMetadata } from './utils';
import { useUploadLogic } from './useUploadLogic';
import FileDropZone from './FileDropZone';
import UploadFileItem from './UploadFileItem';
import MusicMetadataEditor from './MusicMetadataEditor';
import { saveMusicMetadata } from '@/app/utils/uploadUtils';

export default function UploadMusicModal({ isOpen, onClose }: UploadMusicModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'metadata'>('upload');
  const [selectedFile, setSelectedFile] = useState<UploadFile | null>(null);
  const [musicMetadata, setMusicMetadata] = useState<MusicMetadata>(getDefaultMusicMetadata());

  const {
    uploadFiles,
    expandedFiles,
    fileInputRef,
    clearAllStates,
    handleFileSelect,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    toggleFileExpanded,
  } = useUploadLogic();

  // 编辑音乐元数据
  const editMetadata = (file: UploadFile) => {
    setSelectedFile(file);
    setCurrentStep('metadata');
    
  };

  // 保存元数据并完成上传
  const saveMetadata = async () => {
    if (selectedFile) {
      console.log('保存音乐元数据:', selectedFile, musicMetadata);
      musicMetadata.cover = '';
      const res = await saveMusicMetadata(selectedFile.id, musicMetadata);
      if (res.code === 200) {
        console.log('保存成功');
        setCurrentStep('upload');
        setSelectedFile(null);
        // 重置元数据表单
        setMusicMetadata(getDefaultMusicMetadata());
      }
      // 这里可以调用API保存元数据
      // setCurrentStep('upload');
      // setSelectedFile(null);
      // // 重置元数据表单
      // setMusicMetadata(getDefaultMusicMetadata());
       
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
    handleFileSelect(e.dataTransfer.files?.[0] || null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          clearAllStates();
          onClose();
        }}
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
            onClick={() => {
              clearAllStates();
              onClose();
            }}
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
              <FileDropZone
                isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onFileSelect={() => fileInputRef.current?.click()}
              />

              {/* 隐藏的文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".mp3,.wav,.flac,.aac,.m4a"
                className="hidden"
                onChange={(e) => {
                  handleFileSelect(e.target.files?.[0] || null);
                }}
              />

              {/* 上传列表 */}
              {uploadFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">上传列表</h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {uploadFiles.map((file) => (
                      <UploadFileItem
                        key={file.id}
                        file={file}
                        isExpanded={expandedFiles.has(file.id)}
                        onToggleExpanded={() => toggleFileExpanded(file.id)}
                        onPause={() => pauseUpload(file.id)}
                        onResume={() => resumeUpload(file.id)}
                        onCancel={() => cancelUpload(file.id)}
                        onEditMetadata={() => editMetadata(file)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* 元数据编辑界面 */
            <MusicMetadataEditor
              metadata={musicMetadata}
              onMetadataChange={setMusicMetadata}
              fileId={selectedFile?.id}
            />
          )}
        </div>

        {/* 弹窗底部 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              clearAllStates();
              onClose();
            }}
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
              onClick={() => {
                clearAllStates();
                onClose();
              }}
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
