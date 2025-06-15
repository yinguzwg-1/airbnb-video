import { UploadFile, UploadConfig } from '../types/upload';

export class UploadService {
  // 生成唯一ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 格式化文件大小
  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 验证文件类型
  public validateFileType(file: File, config: UploadConfig): boolean {
    if (!config.allowedTypes || config.allowedTypes.length === 0) return true;
    
    const fileType = file.type.toLowerCase();
    return config.allowedTypes.some(type => {
      if (type === 'image') return fileType.startsWith('image/');
      if (type === 'video') return fileType.startsWith('video/');
      return false;
    });
  }

  // 验证文件大小
  public validateFileSize(file: File, config: UploadConfig): boolean {
    if (!config.maxSize) return true;
    return file.size <= config.maxSize;
  }

  // 验证文件数量
  public validateFileCount(currentCount: number, newCount: number, config: UploadConfig): boolean {
    if (!config.maxFiles) return true;
    return (currentCount + newCount) <= config.maxFiles;
  }

  // 创建UploadFile对象
  public createUploadFile(file: File): UploadFile {
    return {
      id: this.generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      status: 'pending',
      progress: 0,
    };
  }

  // 验证文件列表
  public validateFiles(
    files: File[], 
    currentFiles: UploadFile[], 
    config: UploadConfig
  ): { valid: UploadFile[]; errors: string[] } {
    const valid: UploadFile[] = [];
    const errors: string[] = [];

    // 检查文件数量
    if (!this.validateFileCount(currentFiles.length, files.length, config)) {
      errors.push(`最多只能上传 ${config.maxFiles} 个文件`);
      return { valid, errors };
    }

    files.forEach(file => {
      const uploadFile = this.createUploadFile(file);

      // 验证文件类型
      if (!this.validateFileType(file, config)) {
        errors.push(`${file.name}: 不支持的文件类型`);
        return;
      }

      // 验证文件大小
      if (!this.validateFileSize(file, config)) {
        errors.push(`${file.name}: 文件大小超过限制 (${this.formatFileSize(config.maxSize || 0)})`);
        return;
      }

      valid.push(uploadFile);
    });

    return { valid, errors };
  }

  // 创建预览URL
  public createPreviewUrl(file: File): string | null {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      return URL.createObjectURL(file);
    }
    return null;
  }

  // 清理预览URL
  public revokePreviewUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  // 模拟上传进度（实际项目中替换为真实的上传逻辑）
  public async simulateUpload(
    file: UploadFile, 
    onProgress: (progress: number) => void
  ): Promise<UploadFile> {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          clearInterval(interval);
          onProgress(100);
          resolve({
            ...file,
            status: 'success',
            progress: 100,
            url: this.createPreviewUrl(file.file) || undefined,
          });
        } else {
          onProgress(progress);
        }
      }, 200 + Math.random() * 300);

      // 模拟错误情况（5%概率）
      if (Math.random() < 0.05) {
        setTimeout(() => {
          clearInterval(interval);
          reject(new Error('Upload failed'));
        }, 1000 + Math.random() * 2000);
      }
    });
  }

  // 实际上传方法（需要根据具体后端API实现）
  public async uploadFile(
    file: UploadFile,
    endpoint: string,
    onProgress: (progress: number) => void
  ): Promise<UploadFile> {
    const formData = new FormData();
    formData.append('file', file.file);

    try {
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve({
                ...file,
                status: 'success',
                progress: 100,
                url: response.url,
              });
            } catch (error) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.open('POST', endpoint);
        xhr.send(formData);
      });
    } catch (error) {
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 批量上传文件
  public async uploadFiles(
    files: UploadFile[],
    endpoint: string,
    onProgress: (fileId: string, progress: number) => void,
    onComplete: (fileId: string, result: UploadFile) => void,
    onError: (fileId: string, error: string) => void
  ): Promise<void> {
    const uploadPromises = files.map(async (file) => {
      try {
        const result = await this.uploadFile(
          file,
          endpoint,
          (progress) => onProgress(file.id, progress)
        );
        onComplete(file.id, result);
      } catch (error) {
        onError(file.id, error instanceof Error ? error.message : 'Upload failed');
      }
    });

    await Promise.allSettled(uploadPromises);
  }
}

// 单例模式
export const uploadService = new UploadService(); 