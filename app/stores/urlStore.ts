"use client";

import { makeAutoObservable, runInAction } from 'mobx';

export class UrlStore {
  urlState: Record<string, string> = {};
  pathname: string = '';

  constructor() {
    makeAutoObservable(this);
    this.initializeUrlState();
  }

  private initializeUrlState() {
    if (typeof window !== 'undefined') {
      this.pathname = window.location.pathname;
      this.parseUrlParams();
      
      // 监听浏览器前进后退
      window.addEventListener('popstate', () => {
        this.updatePathname();
        this.parseUrlParams();
        this.notifyUrlChange();
      });
    }
  }

  // 新增：更新pathname的方法
  updatePathname() {
    if (typeof window !== 'undefined') {
      runInAction(() => {
        this.pathname = window.location.pathname;
      });
    }
  }

  private parseUrlParams() {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(window.location.search);
    
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    runInAction(() => {
      this.urlState = params;
    });
  }

  private notifyUrlChange() {
    // 触发自定义事件，通知其他组件
    window.dispatchEvent(new CustomEvent('urlStateChanged', {
      detail: { urlState: this.urlState }
    }));
  }

  updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(window.location.search);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    const newUrl = `${this.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    
    // 更新内部状态
    this.parseUrlParams();
    
    // 通知其他组件
    this.notifyUrlChange();
  }

  // 新增：清除所有筛选参数，保留搜索查询
  clearFilters() {
    const params = new URLSearchParams();
    
    // 只保留搜索查询参数（q）
    const searchQuery = this.urlState.q;
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    
    const newUrl = `${this.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    
    // 更新内部状态
    this.parseUrlParams();
    
    // 通知其他组件
    this.notifyUrlChange();
  }

  getParam(key: string, defaultValue: string = ''): string {
    return this.urlState[key] || defaultValue;
  }

  hasParam(key: string): boolean {
    return key in this.urlState;
  }

  getAllParams(): Record<string, string> {
    return { ...this.urlState };
  }

  // 新增：检查是否有筛选参数（除了搜索查询）
  hasFilters(): boolean {
    const filterKeys = ['type', 'genre', 'year', 'rating', 'status', 'sortBy', 'order', 'page', 'pageSize'];
    return filterKeys.some(key => this.hasParam(key));
  }
} 