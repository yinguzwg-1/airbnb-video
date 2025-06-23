"use client";

import { MediaStore } from './mediaStore';
import { UrlStore } from './urlStore';

class RootStore {
  mediaStore: MediaStore;
  urlStore: UrlStore;

  constructor() {
    this.mediaStore = new MediaStore();
    this.urlStore = new UrlStore();
  }
}

export const rootStore = new RootStore();

export function useStore() {
  return rootStore;
} 