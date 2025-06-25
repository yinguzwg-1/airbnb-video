# 页面埋点事件文档

## 概述
本文档记录了在媒体页面中添加的所有埋点事件，用于追踪用户行为和页面交互。

## 埋点事件列表

### 1. 爬取事件
- **事件名**: `crawl_click`
- **触发位置**: Header.tsx - 爬取按钮
- **事件数据**:
  ```javascript
  {
    page: number, // 当前爬取的页码
  }
  ```

### 2. 媒体卡片点击
- **事件名**: `media_card_click`
- **触发位置**: MediaCard.tsx - 媒体卡片点击
- **事件数据**:
  ```javascript
  {
    media_id: string,        // 媒体ID
    media_title: string,     // 媒体标题
    media_type: string,      // 媒体类型 (movie/tv)
    media_year: number,      // 发布年份
    media_rating: number,    // 评分
    page_url: string,        // 当前页面URL
  }
  ```

### 3. 分页操作
- **事件名**: `pagination_click`
- **触发位置**: Pagination.tsx - 分页按钮点击
- **事件数据**:
  ```javascript
  {
    current_page: number,    // 当前页码
    target_page: number,     // 目标页码
    total_pages: number,     // 总页数
    page_size: number,       // 每页显示数量
    total_items: number,     // 总项目数
    page_url: string,        // 当前页面URL
  }
  ```

### 4. 页面大小变更
- **事件名**: `page_size_change`
- **触发位置**: Pagination.tsx - 页面大小选择器
- **事件数据**:
  ```javascript
  {
    old_page_size: number,   // 旧的页面大小
    new_page_size: number,   // 新的页面大小
    current_page: number,    // 当前页码
    total_items: number,     // 总项目数
    page_url: string,        // 当前页面URL
  }
  ```

### 5. 搜索操作
- **事件名**: `search_submit`
- **触发位置**: SearchBar.tsx - 搜索提交
- **事件数据**:
  ```javascript
  {
    search_query: string,    // 搜索关键词
    search_type: string,     // 搜索类型 (media)
    current_page: number,    // 当前页码
    total_items: number,     // 总项目数
    page_url: string,        // 当前页面URL
  }
  ```

### 6. 清除搜索
- **事件名**: `search_clear`
- **触发位置**: SearchBar.tsx - 清除搜索按钮
- **事件数据**:
  ```javascript
  {
    previous_query: string,  // 之前的搜索关键词
    current_page: number,    // 当前页码
    total_items: number,     // 总项目数
    page_url: string,        // 当前页面URL
  }
  ```

### 7. 排序方式变更
- **事件名**: `filter_sort_by_change`
- **触发位置**: FilterBar.tsx - 排序方式选择器
- **事件数据**:
  ```javascript
  {
    old_sort_by: string,     // 旧的排序方式
    new_sort_by: string,     // 新的排序方式
    current_order: string,   // 当前排序顺序
    result_count: number,    // 结果数量
    page_url: string,        // 当前页面URL
  }
  ```

### 8. 排序顺序变更
- **事件名**: `filter_order_change`
- **触发位置**: FilterBar.tsx - 排序顺序选择器
- **事件数据**:
  ```javascript
  {
    sort_by: string,         // 排序方式
    old_order: string,       // 旧的排序顺序
    new_order: string,       // 新的排序顺序
    result_count: number,    // 结果数量
    page_url: string,        // 当前页面URL
  }
  ```

### 9. 清除过滤器
- **事件名**: `filter_clear`
- **触发位置**: FilterBar.tsx - 清除过滤器按钮
- **事件数据**:
  ```javascript
  {
    current_filters: object, // 当前过滤器状态
    result_count: number,    // 结果数量
    page_url: string,        // 当前页面URL
  }
  ```

### 10. 主题切换
- **事件名**: `theme_change`
- **触发位置**: ThemeSwitcher.tsx - 主题切换
- **事件数据**:
  ```javascript
  {
    old_theme: string,       // 旧主题
    new_theme: string,       // 新主题
    page_url: string,        // 当前页面URL
    user_agent: string,      // 用户代理
  }
  ```

### 11. 语言切换
- **事件名**: `language_change`
- **触发位置**: LanguageSwitcher.tsx - 语言切换
- **事件数据**:
  ```javascript
  {
    old_language: string,    // 旧语言
    new_language: string,    // 新语言
    page_url: string,        // 当前页面URL
    user_agent: string,      // 用户代理
  }
  ```

## 使用方式

所有埋点事件都通过 `window.tracker?.track()` 方法发送，确保在 tracker 对象存在时才执行。

```javascript
window.tracker?.track('event_name', {
  // 事件数据
});
```

## 数据收集

这些埋点事件将帮助您了解：
- 用户最常点击的媒体内容
- 搜索行为模式
- 分页和过滤使用习惯
- 主题和语言偏好
- 页面交互流程

## 注意事项

1. 所有事件都包含 `page_url` 字段，用于追踪事件发生的页面
2. 用户代理信息在主题和语言切换时收集，用于设备分析
3. 事件数据会根据实际业务需求进行调整和扩展 