/**
 * AI 助手事件工具
 * 独立文件，避免在组件文件中导出非组件内容导致 Fast Refresh 退化
 */

/** 通知 AI 助手分析照片（供 PhotoCard 等组件调用） */
export function sendPhotoToAi(imageUrl: string) {
  window.dispatchEvent(new CustomEvent('ai-analyze-photo', { detail: { imageUrl } }));
}
