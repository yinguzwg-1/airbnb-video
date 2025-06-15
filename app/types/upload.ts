// 上传文件类型
export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file: File;
  progress?: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

// 上传配置
export interface UploadConfig {
  accept?: string;
  maxSize?: number; // bytes
  maxFiles?: number;
  multiple?: boolean;
  allowedTypes?: ('image' | 'video')[];
}

// 上传回调函数
export interface UploadCallbacks {
  onSuccess?: (files: UploadFile[]) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
  onCancel?: () => void;
}

// 微前端上传组件属性
export interface MicroUploadProps {
  isOpen: boolean;
  onClose: () => void;
  config?: UploadConfig;
  callbacks?: UploadCallbacks;
  className?: string;
}

// 预设配置
export const UPLOAD_PRESETS: Record<string, UploadConfig> = {
  IMAGE_ONLY: {
    accept: 'image/*',
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    multiple: true,
    allowedTypes: ['image']
  },
  VIDEO_ONLY: {
    accept: 'video/*',
    maxSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 1,
    multiple: false,
    allowedTypes: ['video']
  },
  MEDIA_MIX: {
    accept: 'image/*,video/*',
    maxSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 10,
    multiple: true,
    allowedTypes: ['image', 'video']
  }
}; 