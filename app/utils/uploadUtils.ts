import { MusicMetadata } from "../components/UploadMusicModal/types";
import { post, get } from "./apiUtils";
import {config as configApi} from "@/app/config";

export async function sliceFile(file: File, chunkSize = 5 * 1024 * 1024) { // 默认5MB一片
  const chunks = [];
  let start = 0;
  const fileHash = await calculateFileHash(file);
  const fileId = `${file.name}-${file.size}-${fileHash}`;
  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    chunks.push({
      chunk,
      index: chunks.length,
      start,
      end,
      hash: fileId, // 可以用更复杂的哈希算法
      filename: file.name,
      total: Math.ceil(file.size / chunkSize)
    });
    start = end;
  }

  return chunks;
}
export async function uploadChunks(
  data: {
    chunks: {
      chunk: File,
      index: number,
      start: number,
      end: number,
      hash: string, // 可以用更复杂的哈希算法
      filename: string,
      total: number
    }[],
    belongId?: string
  }, 
  url: string, 
  onProgress?: (chunkIndex: number, progress: number, response: any) => void,
  abortController?: AbortController,
  startIndex: number = 0
) {
  let res;
  for (let i = startIndex; i < data.chunks.length; i++) {
    const chunk = data.chunks[i];
    const formData = new FormData();
    // 创建文件上传记录 - 使用文件名、大小和哈希值作为稳定的标识符
   
    formData.append('fileId', chunk.hash);
    formData.append('chunkIndex', chunk.index.toString());
    formData.append('chunkData', chunk.chunk);
    formData.append('totalChunks', chunk.total.toString());
    formData.append('belongId', data.belongId || '');
    try {
      // 检查是否已取消
      if (abortController?.signal.aborted) {
        throw new Error('Upload cancelled');
      }
      
      const result: any = await post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000, // 5分钟超时
        signal: abortController?.signal // 添加 abort signal
      });
      res = result;
      // 调用进度回调
      if (onProgress) {
        onProgress(chunk.index, 100, result);
      }
      
    } catch (error) {
      console.error(`切片 ${chunk.index} 上传失败`, error);
      
      // 如果是取消操作，抛出特定的错误信息
      if (error instanceof Error && (
        error.name === 'AbortError' || 
        error.message.includes('canceled') ||
        error.message.includes('aborted')
      )) {
        throw new Error('Upload cancelled');
      }
      
      throw error; // 或者实现重试逻辑
    }
  }

  return res;
}

// 检查文件是否已经存在
export async function checkFileExists(fileId: string, url: string, belongId?: string | undefined) {
  try {
    const response = await get(`${url}/check/${fileId}?belongId=${belongId ? belongId : ''}`);
    return response;
  } catch (error) {
    console.error('检查文件存在性失败:', error);
    return { exists: false, isCompleted: false, progress: 0, totalChunks: 0 };
  }
}

// 计算文件的简单哈希值（用于更精确的文件识别）
export async function calculateFileHash(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // 简单的哈希算法：取前1KB、中间1KB、最后1KB的数据进行哈希
      let hash = 0;
      const chunkSize = Math.min(1024, Math.floor(uint8Array.length / 3));
      
      // 前1KB
      for (let i = 0; i < chunkSize; i++) {
        hash = ((hash << 5) - hash + uint8Array[i]) & 0xffffffff;
      }
      
      // 中间1KB
      const middleStart = Math.floor(uint8Array.length / 2) - chunkSize / 2;
      for (let i = middleStart; i < middleStart + chunkSize; i++) {
        hash = ((hash << 5) - hash + uint8Array[i]) & 0xffffffff;
      }
      
      // 最后1KB
      const endStart = uint8Array.length - chunkSize;
      for (let i = endStart; i < uint8Array.length; i++) {
        hash = ((hash << 5) - hash + uint8Array[i]) & 0xffffffff;
      }
      
      resolve(hash.toString(16));
    };
    reader.readAsArrayBuffer(file);
  });
}

export async function saveMusicMetadata(fileId: string, metadata: MusicMetadata) {
  const res = await post(`${configApi.NEXT_PUBLIC_API_URL}/upload/save_music`, {
    fileId,
    metadata
  });
  return res;
} 