import { UploadFile, MusicMetadata } from './types';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getStatusIcon = (status: UploadFile['status']) => {
  switch (status) {
    case 'uploading':
      return '⏳';
    case 'completed':
      return '✅';
    case 'error':
      return '❌';
    case 'paused':
      return '⏸️';
    default:
      return '📁';
  }
};

export const getDefaultMusicMetadata = (): MusicMetadata => ({
  title: '',
  artist: '',
  album: '',
  genre: '',
  duration: '',
  release_date: '',
  language: '',
  tags: [],
  mood: '',
  lyrics: [],
  cover: '',
  mp3: ''
}); 