import React from 'react';

interface FileDropZoneProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: () => void;
}

export default function FileDropZone({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect
}: FileDropZoneProps) {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
        isDragging
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
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
        onClick={onFileSelect}
        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
      >
        选择文件
      </button>
    </div>
  );
} 