import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// 缓存项接口
interface CacheItem {
  data: any;
  timestamp: number;
  expireTime: number;
}

// 请求配置扩展
interface RequestConfig extends AxiosRequestConfig {
  enableCache?: boolean; // 是否启用缓存
  cacheTime?: number; // 缓存时间（毫秒）
  cacheKey?: string; // 自定义缓存键
  forceRefresh?: boolean; // 强制刷新缓存
}

// 缓存管理器
class CacheManager {
  private cache = new Map<string, CacheItem>();

  // 生成缓存键
  generateCacheKey(config: RequestConfig): string {
    if (config.cacheKey) return config.cacheKey;
    
    const { method = 'GET', url = '', params, data } = config;
    const paramsStr = params ? JSON.stringify(params) : '';
    const dataStr = data ? JSON.stringify(data) : '';
    return `${method}_${url}_${paramsStr}_${dataStr}`;
  }

  // 获取缓存
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expireTime) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // 设置缓存
  set(key: string, data: any, cacheTime: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expireTime: Date.now() + cacheTime
    });
  }

  // 删除缓存
  delete(key: string): void {
    this.cache.delete(key);
  }

  // 清空所有缓存
  clear(): void {
    this.cache.clear();
  }
}

const cacheManager = new CacheManager();

// 创建axios实例
const createAxiosInstance = (baseURL?: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 60000,
    headers: { 'Content-Type': 'application/json' },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const requestConfig = config as unknown as RequestConfig;
      const cacheKey = cacheManager.generateCacheKey(requestConfig);
      
      if (requestConfig.enableCache && !requestConfig.forceRefresh) {
        const cachedData = cacheManager.get(cacheKey);
        if (cachedData) {
          return Promise.resolve({
            ...config,
            cached: true,
            data: cachedData
          } as any);
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const config = response.config as RequestConfig;
      
      if (config.enableCache) {
        const cacheKey = cacheManager.generateCacheKey(config);
        const cacheTime = config.cacheTime || 5 * 60 * 1000; // 默认5分钟
        cacheManager.set(cacheKey, response.data, cacheTime);
      }

      return response;
    },
    (error) => Promise.reject(error)
  );

  return instance;
};

// 创建默认实例
const api = createAxiosInstance();

// 封装请求方法
const request = async <T = any>(config: RequestConfig): Promise<T> => {
  try {
    const response = await api(config);
    
    if ((response as any).cached) {
      return (response as any).data;
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 便捷方法
const get = <T = any>(url: string, config?: RequestConfig): Promise<T> => {
  return request<T>({ ...config, method: 'GET', url });
};

const post = <T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> => {
  return request<T>({ ...config, method: 'POST', url, data });
};

const put = <T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> => {
  return request<T>({ ...config, method: 'PUT', url, data });
};

const del = <T = any>(url: string, config?: RequestConfig): Promise<T> => {
  return request<T>({ ...config, method: 'DELETE', url });
};

// 缓存管理方法
const clearCache = (key?: string): void => {
  if (key) {
    cacheManager.delete(key);
  } else {
    cacheManager.clear();
  }
};

export {
  api,
  request,
  get,
  post,
  put,
  del,
  clearCache,
  createAxiosInstance
};

export type { RequestConfig, CacheItem };
