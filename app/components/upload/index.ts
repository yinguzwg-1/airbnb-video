// 微前端上传组件的入口文件
export { default as MicroUpload } from './MicroUpload';
export { default as MicroUploadController } from './MicroUploadController';
export type { 
  MicroUploadProps, 
  UploadFile, 
  UploadConfig, 
  UploadCallbacks 
} from '../../types/upload';
export { UPLOAD_PRESETS } from '../../types/upload';
export { uploadService } from '../../services/uploadService'; 