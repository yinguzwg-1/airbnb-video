# 国际化功能说明 (Internationalization Guide)

## 功能概述

本项目现已支持完整的中英双语切换功能，所有文本内容都可以在中文和英文之间自由切换，并且支持基于URL的语言路由。

## 特性

- ✅ 支持中文和英文两种语言
- ✅ **URL语言路由**: `/zh/` 和 `/en/` 路径结构
- ✅ 自动语言重定向和中间件处理
- ✅ 语言设置自动保存到本地存储
- ✅ 页面所有文本内容完全国际化
- ✅ 优雅的语言切换界面
- ✅ 响应式设计，移动端友好
- ✅ TypeScript 类型安全
- ✅ 性能优化，避免不必要的重渲染
- ✅ SEO友好的多语言URL结构

## 文件结构

```
app/
├── [lang]/                   # 动态语言路由
│   ├── layout.tsx           # 语言特定的布局
│   ├── page.tsx             # 首页 (支持 /zh 和 /en)
│   └── media/
│       └── page.tsx         # 媒体页面 (支持 /zh/media 和 /en/media)
├── i18n/
│   ├── types.ts             # 翻译类型定义
│   ├── index.ts             # 导出所有翻译相关内容
│   └── locales/
│       ├── zh.ts            # 中文翻译
│       └── en.ts            # 英文翻译
├── contexts/
│   └── TranslationContext.tsx # 翻译上下文和Hook
├── components/
│   └── LanguageSwitcher.tsx   # 语言切换组件
├── page.tsx                 # 根页面重定向
├── layout.tsx               # 根布局
└── middleware.ts            # 语言路由中间件
```

## URL 结构

现在网站支持以下URL结构：

- `/` → 自动重定向到 `/zh` (默认语言)
- `/zh` → 中文首页
- `/en` → 英文首页
- `/zh/media` → 中文媒体页面
- `/en/media` → 英文媒体页面
- `/media` → 自动重定向到 `/zh/media`

## 使用方法

### 1. 在组件中使用翻译

```tsx
import { useT } from '@/app/contexts/TranslationContext';

export default function MyComponent() {
  const t = useT();
  
  return (
    <div>
      <h1>{t.home.title}</h1>
      <p>{t.home.subtitle}</p>
    </div>
  );
}
```

### 2. 使用完整的翻译上下文

```tsx
import { useTranslation } from '@/app/contexts/TranslationContext';

export default function MyComponent() {
  const { language, setLanguage, t, isLoading } = useTranslation();
  
  const switchLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <button onClick={switchLanguage}>
        {language === 'zh' ? 'English' : '中文'}
      </button>
      <h1>{t.home.title}</h1>
    </div>
  );
}
```

### 3. 使用语言切换组件

```tsx
import LanguageSwitcher from '@/app/components/LanguageSwitcher';

export default function Header() {
  return (
    <header>
      {/* 其他内容 */}
      <LanguageSwitcher />
    </header>
  );
}
```

### 4. 在组件中获取当前语言参数

```tsx
import { Language } from '@/app/i18n';

interface PageProps {
  params: { lang: Language };
}

export default function MyPage({ params }: PageProps) {
  const currentLang = params.lang; // 'zh' 或 'en'
  
  return (
    <div>当前语言: {currentLang}</div>
  );
}
```

### 5. 在组件中生成语言相关的链接

```tsx
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Navigation() {
  const params = useParams();
  const currentLang = params.lang as Language;
  
  return (
    <nav>
      <Link href={`/${currentLang}/media`}>媒体中心</Link>
      <Link href={`/${currentLang}/about`}>关于我们</Link>
    </nav>
  );
}
```

## 翻译键值结构

所有翻译内容按功能模块组织：

- `common` - 通用词汇 (搜索、筛选、清除等)
- `home` - 首页内容
- `media` - 媒体页面内容
- `filters` - 筛选相关
- `mediaTypes` - 媒体类型 (电影、电视剧)
- `status` - 状态信息 (已完结、连载中等)
- `sortOptions` - 排序选项
- `card` - 媒体卡片信息
- `noResults` - 无结果页面
- `footer` - 页脚信息
- `nav` - 导航菜单

## 添加新的翻译

### 1. 更新类型定义

在 `app/i18n/types.ts` 中添加新的翻译键：

```typescript
export interface TranslationKeys {
  // 现有内容...
  newSection: {
    newKey: string;
    anotherKey: string;
  };
}
```

### 2. 添加中文翻译

在 `app/i18n/locales/zh.ts` 中添加：

```typescript
export const zh: TranslationKeys = {
  // 现有内容...
  newSection: {
    newKey: '新的键值',
    anotherKey: '另一个键值',
  },
};
```

### 3. 添加英文翻译

在 `app/i18n/locales/en.ts` 中添加：

```typescript
export const en: TranslationKeys = {
  // 现有内容...
  newSection: {
    newKey: 'New Key',
    anotherKey: 'Another Key',
  },
};
```

## 语言切换组件功能

语言切换组件提供以下功能：

- 🌐 显示当前语言的国旗和名称
- 📱 支持下拉菜单选择
- 💾 自动保存语言偏好到 localStorage
- ✨ 平滑的过渡动画
- 📱 移动端友好的交互设计

## 本地存储

用户的语言选择会自动保存到浏览器的 localStorage 中，键名为 `language`。下次访问时会自动恢复用户的语言偏好。

## 支持的语言

目前支持的语言：

- 🇨🇳 中文 (zh)
- 🇺🇸 English (en)

## 扩展其他语言

要添加新语言（如日语），需要：

1. 在 `app/i18n/types.ts` 中更新 `Language` 类型
2. 在 `app/i18n/locales/` 中创建新的语言文件
3. 在 `app/i18n/index.ts` 中添加新语言的配置
4. 更新 `supportedLanguages` 数组

## 最佳实践

1. **保持翻译键值的一致性** - 使用有意义的键名
2. **避免硬编码文本** - 所有用户可见的文本都应该国际化
3. **考虑文本长度差异** - 不同语言的文本长度可能差异很大
4. **测试所有语言** - 确保在所有支持的语言下界面都正常显示
5. **使用语义化的翻译键** - 便于维护和理解

## 性能考虑

- 翻译文件在应用启动时一次性加载
- 使用 React Context 避免 prop drilling
- 语言切换时组件会重新渲染，但不会重新加载翻译文件
- localStorage 用于持久化语言偏好，避免每次都重新选择

---

现在您可以在整个应用中享受完整的中英双语体验！🎉 