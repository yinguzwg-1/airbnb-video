# 微前端上传组件

一个功能完整的微前端上传组件，支持图片和视频文件的拖拽上传、预览、批量上传等功能。

## 功能特性

- 🎯 **多种文件类型支持**: 图片、视频等媒体文件
- 🎨 **拖拽上传**: 支持拖拽文件到区域内上传
- 👀 **实时预览**: 图片和视频文件实时预览
- 📊 **上传进度**: 实时显示上传进度和状态
- 🔄 **批量上传**: 支持同时上传多个文件
- ⚙️ **灵活配置**: 可配置文件类型、大小、数量限制
- 🌐 **国际化**: 支持中英文界面
- 🎭 **主题支持**: 支持明暗主题切换
- 📱 **响应式设计**: 适配移动端和桌面端

## 组件架构

```
app/
├── components/upload/
│   ├── MicroUpload.tsx           # 核心上传模态框组件
│   ├── MicroUploadController.tsx # 上传控制器组件
│   └── index.ts                  # 导出文件
├── services/
│   └── uploadService.ts          # 上传服务逻辑
├── types/
│   └── upload.ts                 # 类型定义
└── i18n/
    ├── locales/
    │   ├── zh.ts                 # 中文翻译
    │   └── en.ts                 # 英文翻译
    └── types.ts                  # 翻译类型定义
```

## 快速开始

### 1. 基础用法

```tsx
import { MicroUploadController, UPLOAD_PRESETS } from '@/app/components/upload';

function MyComponent() {
  const handleUploadSuccess = (files: UploadFile[]) => {
    console.log('上传成功:', files);
  };

  const handleUploadError = (error: string) => {
    console.error('上传失败:', error);
  };

  return (
    <MicroUploadController
      config={UPLOAD_PRESETS.MEDIA_MIX}
      onSuccess={handleUploadSuccess}
      onError={handleUploadError}
    />
  );
}
```

### 2. 自定义配置

```tsx
const customConfig = {
  accept: 'image/jpeg,image/png,image/gif',
  maxSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 3,
  multiple: true,
  allowedTypes: ['image']
};

<MicroUploadController
  config={customConfig}
  onSuccess={handleUploadSuccess}
  onError={handleUploadError}
/>
```

### 3. 自定义触发器

```tsx
<MicroUploadController
  config={UPLOAD_PRESETS.IMAGE_ONLY}
  onSuccess={handleUploadSuccess}
  onError={handleUploadError}
  trigger={
    <div className="custom-upload-button">
      <Icon name="upload" />
      <span>点击上传图片</span>
    </div>
  }
/>
```

### 4. 直接使用核心组件

```tsx
import { MicroUpload } from '@/app/components/upload';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        打开上传
      </button>
      
      <MicroUpload
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        config={UPLOAD_PRESETS.MEDIA_MIX}
        callbacks={{
          onSuccess: (files) => {
            console.log('上传成功:', files);
            setIsOpen(false);
          },
          onError: (error) => {
            console.error('上传失败:', error);
          }
        }}
      />
    </>
  );
}
```

## 配置选项

### UploadConfig

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `accept` | `string` | - | 允许的文件类型 (HTML accept 属性) |
| `maxSize` | `number` | - | 单个文件最大大小 (bytes) |
| `maxFiles` | `number` | - | 最大文件数量 |
| `multiple` | `boolean` | `false` | 是否允许多文件选择 |
| `allowedTypes` | `('image' \| 'video')[]` | - | 允许的文件类型数组 |

### 预设配置

```tsx
// 仅图片 (最多5个，每个最大10MB)
UPLOAD_PRESETS.IMAGE_ONLY

// 仅视频 (1个，最大100MB)
UPLOAD_PRESETS.VIDEO_ONLY

// 图片和视频混合 (最多10个，每个最大100MB)
UPLOAD_PRESETS.MEDIA_MIX
```

## 回调函数

### UploadCallbacks

| 属性 | 类型 | 描述 |
|------|------|------|
| `onSuccess` | `(files: UploadFile[]) => void` | 上传成功回调 |
| `onError` | `(error: string) => void` | 上传失败回调 |
| `onProgress` | `(progress: number) => void` | 上传进度回调 |
| `onCancel` | `() => void` | 取消上传回调 |

## 文件对象

### UploadFile

```tsx
interface UploadFile {
  id: string;           // 唯一标识
  name: string;         // 文件名
  size: number;         // 文件大小 (bytes)
  type: string;         // 文件类型
  url?: string;         // 预览URL
  file: File;           // 原始File对象
  progress?: number;    // 上传进度 (0-100)
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;       // 错误信息
}
```

## 服务方法

### uploadService

```tsx
import { uploadService } from '@/app/services/uploadService';

// 格式化文件大小
uploadService.formatFileSize(1024); // "1 KB"

// 验证文件
const { valid, errors } = uploadService.validateFiles(files, [], config);

// 创建预览URL
const previewUrl = uploadService.createPreviewUrl(file);

// 清理预览URL
uploadService.revokePreviewUrl(previewUrl);
```

## 样式定制

组件使用 Tailwind CSS 构建，支持明暗主题。可以通过以下方式定制样式：

### 1. 传入自定义 className

```tsx
<MicroUploadController
  className="custom-upload-modal"
  // ...
/>
```

### 2. 覆盖默认样式

```css
.custom-upload-modal {
  /* 自定义样式 */
}
```

### 3. 主题变量

组件会自动适配项目的主题设置，支持：
- `light` - 浅色主题
- `dark` - 深色主题
- `system` - 跟随系统

## 集成后端API

默认情况下，组件使用模拟上传进行演示。实际项目中，需要替换为真实的上传API：

```tsx
// 在 uploadService.ts 中
export class UploadService {
  // 替换 simulateUpload 为真实上传
  public async uploadFile(
    file: UploadFile,
    endpoint: string,
    onProgress: (progress: number) => void
  ): Promise<UploadFile> {
    // 实现真实的上传逻辑
    // 使用 XMLHttpRequest 或 fetch
  }
}
```

## 演示页面

访问 `/upload-demo` 页面查看完整的功能演示和使用示例。

## 依赖项

- React 18+
- Next.js 14+
- Tailwind CSS
- TypeScript

## 浏览器支持

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

## 许可证

MIT License

## 贡献

欢迎提交 Issues 和 Pull Requests！

## 更新日志

### v1.0.0
- 初始版本
- 支持图片和视频上传
- 拖拽上传功能
- 多语言支持
- 主题切换支持

---

**注意**: 这是一个微前端组件，可以轻松集成到任何 React 项目中。如果你的项目不使用 Next.js，可以移除相关依赖并调整导入路径。 