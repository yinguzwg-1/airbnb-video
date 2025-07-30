# Axios 缓存封装使用说明

这是一个基于 axios 的二次封装，支持请求缓存功能，默认不缓存。

## 主要特性

- ✅ 支持请求缓存，默认不缓存
- ✅ 可配置缓存时间（默认5分钟）
- ✅ 支持自定义缓存键
- ✅ 支持强制刷新缓存
- ✅ 自动过期清理
- ✅ 类型安全（TypeScript）

## 安装依赖

项目已安装 axios，无需额外安装。

## 基本使用

### 1. 导入

```typescript
import { get, post, put, del, clearCache } from './utils/apiUtils';
```

### 2. 基本请求（不缓存）

```typescript
// GET 请求
const user = await get('/api/users/123');

// POST 请求
const newUser = await post('/api/users', { name: 'John', email: 'john@example.com' });

// PUT 请求
const updatedUser = await put('/api/users/123', { name: 'Jane' });

// DELETE 请求
await del('/api/users/123');
```

### 3. 启用缓存

```typescript
// 使用默认缓存时间（5分钟）
const user = await get('/api/users/123', {
  enableCache: true
});

// 自定义缓存时间（10分钟）
const user = await get('/api/users/123', {
  enableCache: true,
  cacheTime: 10 * 60 * 1000
});
```

### 4. 自定义缓存键

```typescript
const user = await get('/api/users/123', {
  enableCache: true,
  cacheKey: 'user_123_v2' // 自定义缓存键
});
```

### 5. 强制刷新缓存

```typescript
const user = await get('/api/users/123', {
  enableCache: true,
  forceRefresh: true // 强制刷新缓存
});
```

## 缓存管理

### 清除特定缓存

```typescript
// 清除特定URL的缓存
clearCache('GET_/api/users/123__');

// 清除自定义缓存键的缓存
clearCache('user_123_v2');
```

### 清除所有缓存

```typescript
clearCache(); // 不传参数清除所有缓存
```

## 创建自定义实例

```typescript
import { createAxiosInstance } from './utils/apiUtils';

// 创建带基础URL的实例
const customApi = createAxiosInstance('https://api.example.com');

// 使用自定义实例
const user = await customApi.get('/users/123');
```

## 配置选项

### RequestConfig 接口

```typescript
interface RequestConfig extends AxiosRequestConfig {
  enableCache?: boolean;    // 是否启用缓存，默认 false
  cacheTime?: number;       // 缓存时间（毫秒），默认 5分钟
  cacheKey?: string;        // 自定义缓存键
  forceRefresh?: boolean;   // 强制刷新缓存，默认 false
}
```

## 缓存键生成规则

如果不指定 `cacheKey`，系统会自动生成缓存键：

```
格式: {METHOD}_{URL}_{PARAMS}_{DATA}
示例: GET_/api/users/123__  (无参数)
示例: GET_/api/users?page=1&limit=10__  (有参数)
示例: POST_/api/users_{"name":"John"}  (有数据)
```

## 使用建议

### 1. 适合缓存的请求
- GET 请求获取静态数据
- 用户信息、配置信息
- 列表数据（分页数据谨慎使用）

### 2. 不适合缓存的请求
- POST/PUT/DELETE 请求
- 实时数据
- 用户特定的动态数据

### 3. 缓存时间设置
- 静态数据：10-30分钟
- 配置信息：5-10分钟
- 用户信息：1-5分钟

## 完整示例

```typescript
import { get, post, clearCache } from './utils/apiUtils';

// 获取用户信息（带缓存）
const getUserInfo = async (userId: string) => {
  try {
    const user = await get(`/api/users/${userId}`, {
      enableCache: true,
      cacheTime: 5 * 60 * 1000 // 5分钟
    });
    return user;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};

// 创建用户（不缓存）
const createUser = async (userData: any) => {
  try {
    const newUser = await post('/api/users', userData);
    return newUser;
  } catch (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
};

// 清除用户缓存
const clearUserCache = (userId: string) => {
  clearCache(`GET_/api/users/${userId}__`);
};

// 使用示例
const example = async () => {
  // 第一次请求，会发送网络请求
  const user1 = await getUserInfo('123');
  
  // 第二次请求，会从缓存返回
  const user2 = await getUserInfo('123');
  
  // 创建用户后，清除相关缓存
  await createUser({ name: 'John' });
  clearUserCache('123');
};
```

## 注意事项

1. 缓存是基于内存的，页面刷新后会清空
2. 缓存键区分大小写
3. 建议为重要的缓存设置合理的过期时间
4. 在数据更新后及时清除相关缓存
5. 避免缓存过大的数据，以免影响内存使用 