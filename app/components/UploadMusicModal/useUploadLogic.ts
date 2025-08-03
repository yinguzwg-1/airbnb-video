import { useState, useRef, useCallback } from 'react';
import { config as configApi } from '@/app/config';
import { sliceFile, uploadChunks, checkFileExists, calculateFileHash } from '@/app/utils/uploadUtils';
import { UploadFile, ChunkInfo } from './types';

export function useUploadLogic() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // 清理所有状态
  const clearAllStates = useCallback(() => {
    // 取消所有正在进行的上传
    abortControllersRef.current.forEach((controller) => {
      controller.abort();
    });
    abortControllersRef.current.clear();
    
    // 清理所有定时器
    uploadTimeoutsRef.current.forEach((timeout) => {
      clearInterval(timeout);
    });
    uploadTimeoutsRef.current.clear();
    
    // 清空文件列表和展开状态
    setUploadFiles([]);
    setExpandedFiles(new Set());
    
    // 清空文件输入框
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 处理文件选择
  const handleFileSelect = useCallback(async (file: File | null, belongId?: string | undefined) => {
      if (!file) return;
      const chunks = await sliceFile(file);
      const totalChunks = chunks.length;
      // 创建文件上传记录 - 使用文件名、大小和哈希值作为稳定的标识符
      const fileHash = await calculateFileHash(file);
      const fileId = `${file.name}-${file.size}-${fileHash}`;
      // 检查文件是否已经存在
      const fileExists = await checkFileExists(fileId, `${configApi.NEXT_PUBLIC_API_URL}/upload`, belongId);
      let chunkInfos: ChunkInfo[];
      let initialStatus: 'uploading' | 'paused' | 'completed' | 'error';
      let initialProgress: number;
      let uploadedChunks: number;
      let res 
      if (fileExists.exists && fileExists.isCompleted) {
        // 文件已存在且已完成，直接标记为完成
        chunkInfos = chunks.map((_, index) => ({
          index,
          progress: 100,
          status: 'completed' as const,
          serverResponse: {
            success: true,
            message: '文件已存在',
            chunkCount: index + 1,
            totalChunks: totalChunks,
            id: fileId,
            progress: 100,
            status: 'completed'
          }
        }));
        initialStatus = 'completed';
        initialProgress = 100;
        uploadedChunks = totalChunks;
      } else if (fileExists.exists && !fileExists.isCompleted) {
        // 文件存在但未完成，标记已上传的分片为完成
        chunkInfos = chunks.map((_, index) => ({
          index,
          progress: index < fileExists.progress ? 100 : 0,
          status: index < fileExists.progress ? 'completed' as const : 'pending'
        }));
        initialStatus = 'paused';
        initialProgress = (fileExists.progress / totalChunks) * 100;
        uploadedChunks = fileExists.progress;
      } else {
        // 文件不存在，正常上传
        chunkInfos = chunks.map((_, index) => ({
          index,
          progress: 0,
          status: 'pending'
        }));
        initialStatus = 'uploading';
        initialProgress = 0;
        uploadedChunks = 0;
      }
      
      const uploadFile: UploadFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        file: file,
        progress: initialProgress,
        status: initialStatus,
        chunks: chunkInfos,
        totalChunks,
        uploadedChunks
      };
      setUploadFiles(prev => [...prev, uploadFile]);
      
      // 如果文件不存在或未完成，则开始上传
      if (!fileExists.exists || !fileExists.isCompleted) {
        
       res = await uploadFileWithChunks(fileId, chunks, totalChunks, uploadedChunks, belongId);
      } else {
        res = {
          success: true,
          message: '文件已存在',
     
        }
      }
      
    
    // 清空文件输入框的值，这样下次选择同一个文件时也能触发onChange事件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    return res;
  }, []);

  // 使用真实的上传接口进行分片上传
  const uploadFileWithChunks = useCallback(async (fileId: string, chunks: any[], totalChunks: number, startIndex: number = 0, belongId?: string) => {
    // 创建 AbortController
    const abortController = new AbortController();
    abortControllersRef.current.set(fileId, abortController);
    let res
    try {
      // 调用真实的上传接口，带进度回调
      res = await uploadChunks(
        {
          chunks,
          belongId,
        }, 
        `${configApi.NEXT_PUBLIC_API_URL}/upload/chunk`,
        (chunkIndex, progress, chunkResponse) => {
          // 更新分片进度
          setUploadFiles(prev => 
            prev.map(file => {
              if (file.id !== fileId) return file;
              
              const updatedChunks = file.chunks?.map((c, index) => 
                index === chunkIndex 
                  ? { 
                      ...c, 
                      status: 'completed' as const, 
                      progress: 100, 
                      serverResponse: chunkResponse 
                    }
                  : c
              );
              
              const completedChunks = updatedChunks?.filter(c => c.status === 'completed').length || 0;
              const newProgress = (completedChunks / totalChunks) * 100;
              
              return {
                ...file,
                chunks: updatedChunks,
                uploadedChunks: completedChunks,
                progress: newProgress
              };
            })
          );
        },
        abortController,
        startIndex
      ); 
      // 最终更新文件状态为完成
      setUploadFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { 
                ...file, 
                status: 'completed', 
                progress: 100
              }
            : file
        )
      );
      return res;
    } catch (error) {
      console.error('上传失败:', error);
      
      // 检查是否是取消操作
      if (error instanceof Error && (
        error.message === 'Upload cancelled' || 
        error.message === 'canceled' ||
        error.name === 'AbortError'
      )) {
        console.log('上传已取消');
        // 不更新文件状态，保持当前状态（可能是 paused）
        return;
      }
      
      // 更新文件状态为错误
      setUploadFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, status: 'error', error: error instanceof Error ? error.message : '上传失败' }
            : file
        )
      );
      return res;
    } finally {
      // 清理 AbortController
      abortControllersRef.current.delete(fileId);
    }
  }, []);

  // 暂停上传
  const pauseUpload = useCallback((fileId: string) => {
    // 取消正在进行的请求
    const abortController = abortControllersRef.current.get(fileId);
    if (abortController) {
      abortController.abort();
      abortControllersRef.current.delete(fileId);
    }
    
    // 清理定时器（如果有的话）
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
  }, []);

  // 继续上传
  const resumeUpload = useCallback(async (fileId: string) => {
    const file = uploadFiles.find(f => f.id === fileId);
    if (file && file.status === 'paused') {
      // 获取已上传的分片索引
      const completedChunks = file.chunks?.filter(c => c.status === 'completed') || [];
      const lastCompletedIndex = completedChunks.length > 0 
        ? Math.max(...completedChunks.map(c => c.index))
        : -1;
      
      // 从下一个分片开始上传
      const startIndex = lastCompletedIndex + 1;
      
      // 重新开始真实的上传，从已上传的分片后面继续
      const chunks = await sliceFile(file.file);
      const totalChunks = chunks.length;
      
      setUploadFiles(prev => 
        prev.map(f => 
          f.id === fileId ? { ...f, status: 'uploading' } : f
        )
      );
      
      uploadFileWithChunks(fileId, chunks, totalChunks, startIndex);
    }
  }, [uploadFiles, uploadFileWithChunks]);

  // 取消上传
  const cancelUpload = useCallback((fileId: string) => {
    // 取消正在进行的请求
    const abortController = abortControllersRef.current.get(fileId);
    if (abortController) {
      abortController.abort();
      abortControllersRef.current.delete(fileId);
    }
    
    // 清理定时器（如果有的话）
    const timeout = uploadTimeoutsRef.current.get(fileId);
    if (timeout) {
      clearInterval(timeout);
      uploadTimeoutsRef.current.delete(fileId);
    }
    
    // 清理展开状态
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
    
    setUploadFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  // 切换文件展开状态
  const toggleFileExpanded = useCallback((fileId: string) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  return {
    uploadFiles,
    expandedFiles,
    fileInputRef,
    clearAllStates,
    handleFileSelect,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    toggleFileExpanded,
  };
} 