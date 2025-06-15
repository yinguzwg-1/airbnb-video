'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../contexts/TranslationContext';
import MicroUploadController from '../../components/upload/MicroUploadController';
import { UploadFile, UPLOAD_PRESETS } from '../../types/upload';

export default function UploadDemoPage() {
  const { t } = useTranslation();
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleUploadSuccess = (files: UploadFile[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    showMessage(`成功上传 ${files.length} 个文件！`, 'success');
  };

  const handleUploadError = (error: string) => {
    showMessage(`上传失败: ${error}`, 'error');
  };

  const handleClearFiles = () => {
    setUploadedFiles([]);
    showMessage('已清空上传列表', 'info');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            微前端上传组件演示
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            展示如何在项目中集成和使用微前端上传组件
          </p>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
            messageType === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
            'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        {/* 功能演示区域 */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* 基础上传 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              基础上传
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              支持图片和视频文件上传，最多10个文件，每个文件最大100MB
            </p>
            <MicroUploadController
              config={UPLOAD_PRESETS.MEDIA_MIX}
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
            />
          </div>

          {/* 仅图片上传 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              仅图片上传
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              仅支持图片文件，最多5个文件，每个文件最大10MB
            </p>
            <MicroUploadController
              config={UPLOAD_PRESETS.IMAGE_ONLY}
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
            />
          </div>

          {/* 仅视频上传 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              仅视频上传
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              仅支持视频文件，单个文件，最大100MB
            </p>
            <MicroUploadController
              config={UPLOAD_PRESETS.VIDEO_ONLY}
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
            />
          </div>

          {/* 自定义触发器 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              自定义触发器
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              使用自定义按钮或元素作为上传触发器
            </p>
            <MicroUploadController
              config={UPLOAD_PRESETS.MEDIA_MIX}
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
              trigger={
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-medium">自定义上传按钮</span>
                  </div>
                </div>
              }
            />
          </div>
        </div>

        {/* 上传结果展示 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              上传结果 ({uploadedFiles.length})
            </h2>
            {uploadedFiles.length > 0 && (
              <button
                onClick={handleClearFiles}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                清空列表
              </button>
            )}
          </div>

          {uploadedFiles.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                还没有上传任何文件
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  {/* 预览 */}
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
                    {file.type.startsWith('image/') && file.url ? (
                      <img 
                        src={file.url} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : file.type.startsWith('video/') && file.url ? (
                      <video 
                        src={file.url}
                        className="w-full h-full object-cover"
                        controls
                        muted
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* 文件信息 */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {file.type} • {Math.round(file.size / 1024)} KB
                    </p>
                    <div className="flex items-center mt-2">
                      <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs text-green-600 dark:text-green-400">上传成功</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            使用说明
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <h3>基础用法</h3>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
              <code>{`import { MicroUploadController, UPLOAD_PRESETS } from '@/app/components/upload';

<MicroUploadController
  config={UPLOAD_PRESETS.MEDIA_MIX}
  onSuccess={(files) => console.log('上传成功:', files)}
  onError={(error) => console.error('上传失败:', error)}
/>`}</code>
            </pre>

            <h3>自定义配置</h3>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
              <code>{`const customConfig = {
  accept: 'image/*',
  maxSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 3,
  multiple: true,
  allowedTypes: ['image']
};

<MicroUploadController
  config={customConfig}
  onSuccess={handleSuccess}
  onError={handleError}
/>`}</code>
            </pre>

            <h3>自定义触发器</h3>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
              <code>{`<MicroUploadController
  config={UPLOAD_PRESETS.IMAGE_ONLY}
  onSuccess={handleSuccess}
  onError={handleError}
  trigger={
    <button className="custom-button">
      自定义上传按钮
    </button>
  }
/>`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 