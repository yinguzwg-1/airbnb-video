"use client";

import { createContext, useContext } from 'react';
import { MediaStore } from './mediaStore';

class RootStore {
  mediaStore: MediaStore;

  constructor() {
    this.mediaStore = new MediaStore();
  }
}

// 创建一个全局的 store 实例
const rootStore = new RootStore();

const StoreContext = createContext<RootStore>(rootStore);


export function useStore(): RootStore {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return store;
}

export type { RootStore };
export { rootStore }; 