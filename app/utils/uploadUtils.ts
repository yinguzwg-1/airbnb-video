import { post } from "./apiUtils";

export function sliceFile(file: File, chunkSize = 5 * 1024 * 1024) { // 默认5MB一片
  const chunks = [];
  let start = 0;

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    chunks.push({
      chunk,
      index: chunks.length,
      start,
      end,
      hash: file.name, // 可以用更复杂的哈希算法
      filename: file.name,
      total: Math.ceil(file.size / chunkSize)
    });
    start = end;
  }

  return chunks;
}
export async function uploadChunks(chunks: any[], url: string) {
  let res;
  for (const chunk of chunks) {
    const formData = new FormData();
    formData.append('fileId', chunk.hash);
    formData.append('chunkIndex', chunk.index);
    formData.append('chunkData', chunk.chunk);
    formData.append('totalChunks', chunk.total);
    console.log('formData', formData);
    try {
      const result = await post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      res = result;
    } catch (error) {
      console.error(`切片 ${chunk.index} 上传失败`, error);
      throw error; // 或者实现重试逻辑
    }
  }

  return res;
}