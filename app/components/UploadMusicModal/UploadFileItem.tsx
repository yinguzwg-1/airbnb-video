import React from 'react';
import { UploadFile, ChunkInfo } from './types';
import { formatFileSize, getStatusIcon } from './utils';

interface UploadFileItemProps {
  file: UploadFile;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onEditMetadata: () => void;
}

export default function UploadFileItem({
  file,
  isExpanded,
  onToggleExpanded,
  onPause,
  onResume,
  onCancel,
  onEditMetadata
}: UploadFileItemProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getStatusIcon(file.status)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {file.name}
              </p>
              {file.chunks && file.chunks.length > 0 && (
                <button
                  onClick={onToggleExpanded}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {isExpanded ? '收起' : '详情'}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {file.status === 'completed' && (
            <button
              onClick={onEditMetadata}
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
              onClick={onPause}
              className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 p-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h2v16H6zm10 0h2v16h-2z"/>
              </svg>
            </button>
          )}
          {file.status === 'paused' && (
            <button
              onClick={onResume}
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          )}
          <button
            onClick={onCancel}
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
           file.status === 'error' ? '上传失败' : 
           `${file.uploadedChunks || 0}/${file.totalChunks || 0} 分片`}
        </span>
      </div>
      
      {/* 分片进度显示 */}
      {file.chunks && file.chunks.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">分片进度</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {file.chunks.filter(c => c.status === 'completed').length}/{file.chunks.length}
            </span>
          </div>
          <div className="grid grid-cols-8 gap-1">
            {file.chunks.map((chunk, index) => (
              <div
                key={index}
                className={`h-2 rounded text-xs flex items-center justify-center ${
                  chunk.status === 'completed' 
                    ? 'bg-green-500' 
                    : chunk.status === 'uploading'
                    ? 'bg-blue-500 animate-pulse'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                title={`分片 ${index + 1}: ${chunk.progress.toFixed(0)}%`}
              >
                {chunk.status === 'completed' && (
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 详细分片信息 */}
      {isExpanded && file.chunks && file.chunks.length > 0 && (
        <ChunkDetails chunks={file.chunks} />
      )}
    </div>
  );
}

// 分片详情组件
function ChunkDetails({ chunks }: { chunks: ChunkInfo[] }) {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">分片详情</h4>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {chunks.map((chunk, index) => (
          <div key={index} className="p-2 bg-white dark:bg-gray-600 rounded border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  分片 {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  {chunk.status === 'completed' && (
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                  {chunk.status === 'uploading' && (
                    <svg className="w-3 h-3 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {chunk.status === 'pending' && (
                    <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {chunk.status === 'completed' ? '已完成' : 
                     chunk.status === 'uploading' ? '上传中' : '等待中'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${chunk.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                  {chunk.progress.toFixed(0)}%
                </span>
              </div>
            </div>
            
            {/* 服务器响应信息 */}
            {chunk.serverResponse && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">服务器响应:</span>
                  <span className={`px-1 py-0.5 rounded text-xs ${
                    chunk.serverResponse.success 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {chunk.serverResponse.success ? '成功' : '等待'}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  {chunk.serverResponse.message}
                </p>
                <div className="text-gray-500 dark:text-gray-500">
                  分片: {chunk.serverResponse.chunkCount}/{chunk.serverResponse.totalChunks} | 
                  进度: {chunk.serverResponse.progress.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 