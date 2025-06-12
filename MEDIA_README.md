# 🎬 电影电视剧网站

一个现代化的电影和电视剧展示网站，支持筛选、搜索和分页功能。

## ✨ 功能特性

### 🎯 核心功能
- **🎬 媒体展示** - 精美的电影和电视剧卡片展示
- **🔍 智能搜索** - 支持标题、演员、导演等多维度搜索
- **🎛️ 多重筛选** - 按类型、题材、年份、评分、状态筛选
- **📖 分页浏览** - 高效的分页系统，支持大量数据
- **📱 响应式设计** - 完美适配各种设备屏幕

### 🎨 界面特色
- **现代化UI** - 简洁美观的用户界面
- **流畅动画** - 丰富的交互动效
- **加载优化** - 图片懒加载和骨架屏
- **用户友好** - 直观的操作体验

## 🚀 快速开始

### 访问页面
```bash
# 启动开发服务器
npm run dev

# 访问媒体页面
http://localhost:8080/media
```

### 主要组件
```typescript
// 页面入口
/app/media/page.tsx

// 核心组件
/app/components/media/
├── Header.tsx          # 顶部导航和搜索
├── FilterBar.tsx       # 筛选条件栏
├── MediaGrid.tsx       # 媒体网格布局
├── MediaCard.tsx       # 单个媒体卡片
├── Pagination.tsx      # 分页组件
└── LoadingSpinner.tsx  # 加载动画
```

## 📊 数据结构

### 媒体类型
```typescript
// 电影类型
interface Movie {
  id: string;
  title: string;
  description: string;
  poster: string;         // 海报图片
  backdrop: string;       // 背景图片
  year: number;
  rating: number;
  genres: string[];
  type: 'movie';
  duration: number;       // 时长（分钟）
  director: string;
  cast: string[];
  boxOffice?: number;
}

// 电视剧类型
interface TVShow {
  id: string;
  title: string;
  description: string;
  poster: string;
  backdrop: string;
  year: number;
  rating: number;
  genres: string[];
  type: 'tv';
  seasons: number;        // 季数
  episodes: number;       // 总集数
  creator: string;
  cast: string[];
  network: string;        // 播出平台
}
```

## 🔧 API接口

### 获取媒体列表
```http
GET /api/media?page=1&limit=12&type=movie&genre=动作&year=2022&rating=8.0&sortBy=rating&sortOrder=desc
```

### 搜索媒体
```http
GET /api/media/search?q=阿凡达&page=1&limit=12
```

### 响应格式
```json
{
  "data": [...],          // 媒体数据数组
  "total": 100,           // 总数量
  "page": 1,              // 当前页码
  "totalPages": 9,        // 总页数
  "hasNext": true,        // 是否有下一页
  "hasPrev": false        // 是否有上一页
}
```

## 🎭 Mock数据

### 内置数据
- **6部电影** - 包含最新热门电影
- **6部电视剧** - 涵盖各种类型的优质剧集
- **丰富信息** - 每个媒体包含完整的元数据

### 数据来源
```typescript
// Mock数据位置
/app/data/mockData.ts

// 数据服务
/app/services/mediaService.ts
```

## 🎨 自定义样式

### 主题颜色
- **主色调**: 蓝色系 (`blue-600`)
- **成功**: 绿色系 (`green-600`)
- **警告**: 黄色系 (`yellow-600`)
- **错误**: 红色系 (`red-600`)

### 响应式断点
- **sm**: `640px+` - 手机横屏
- **md**: `768px+` - 平板
- **lg**: `1024px+` - 笔记本
- **xl**: `1280px+` - 桌面

## 🛠️ 扩展功能

### 添加新的筛选条件
```typescript
// 在 FilterParams 接口中添加新字段
export interface FilterParams {
  // ... 现有字段
  language?: string;      // 例：添加语言筛选
  country?: string;       // 例：添加国家筛选
}
```

### 添加新的排序方式
```typescript
// 在 mediaService.ts 中扩展排序逻辑
switch (sortBy) {
  case 'popularity':      // 新增：按热度排序
    aValue = a.popularity;
    bValue = b.popularity;
    break;
  // ... 其他排序方式
}
```

## 📱 移动端优化

### 响应式网格
- **手机**: 1列布局
- **平板**: 2-3列布局  
- **桌面**: 4-6列布局

### 触摸优化
- **筛选栏折叠** - 移动端可展开/收起
- **搜索优化** - 移动端独立搜索栏
- **滑动支持** - 支持触摸滑动操作

## 🎯 性能优化

### 图片优化
- **懒加载** - 图片进入视窗时才加载
- **错误处理** - 图片加载失败时显示占位符
- **缓存策略** - 浏览器缓存优化

### 数据优化
- **分页加载** - 避免一次性加载大量数据
- **搜索防抖** - 减少API调用频率
- **缓存策略** - 合理的数据缓存

## 🐛 调试技巧

### 常见问题
1. **图片不显示** - 检查图片URL是否有效
2. **搜索无结果** - 确认关键词和数据匹配
3. **筛选不生效** - 检查筛选条件是否正确传递

### 调试工具
```bash
# 查看API请求
curl "http://localhost:8080/api/media?page=1&limit=12"

# 查看搜索结果
curl "http://localhost:8080/api/media/search?q=阿凡达"
```

## 🚀 部署说明

### 生产环境构建
```bash
npm run build
npm run start
```

### 环境变量
```env
# 如果需要连接外部API
TMDB_API_KEY=your_api_key_here
NODE_ENV=production
```

---

**享受您的电影电视剧探索之旅！** 🎬✨ 