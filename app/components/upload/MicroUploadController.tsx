'use client';

import React, { useState, useCallback } from 'react';
import MicroUpload from './MicroUpload';
import { UploadConfig, UploadFile, UploadCallbacks, UPLOAD_PRESETS } from '../../types/upload';

interface MicroUploadControllerProps {
  config?: UploadConfig;
  onSuccess?: (files: UploadFile[]) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  trigger?: React.ReactNode;
  className?: string;
}

const MicroUploadController: React.FC<MicroUploadControllerProps> = ({
  config = UPLOAD_PRESETS.MEDIA_MIX,
  onSuccess,
  onError,
  onCancel,
  trigger,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const callbacks: UploadCallbacks = {
    onSuccess: (files) => {
      onSuccess?.(files);
      handleClose();
    },
    onError: (error) => {
      onError?.(error);
      // 不自动关闭，让用户看到错误信息
    },
    onCancel: () => {
      onCancel?.();
      handleClose();
    },
  };

  return (
    <>
      {/* 触发按钮 */}
      {trigger ? (
        <div onClick={handleOpen} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button
          onClick={handleOpen}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          上传文件
        </button>
      )}

      {/* 上传模态框 */}
      <MicroUpload
        isOpen={isOpen}
        onClose={handleClose}
        config={config}
        callbacks={callbacks}
        className={className}
      />
    </>
  );
};

export default MicroUploadController; 