"use client";

import { makeAutoObservable, runInAction } from 'mobx';
import { MediaItem } from '../types/media';

export class MediaStore {
  mediaList: MediaItem[] = [];
  total: number = 0;
  currentPage: number = 1;
  pageSize: number = 12;
  isLoading: boolean = false;
  searchQuery: string = '';

  constructor() {
    makeAutoObservable(this);
  }

  setMediaList(mediaList: MediaItem[]) {
    this.mediaList = mediaList;
  }

  setTotal(total: number) {
    this.total = total;
  }

  setCurrentPage(page: number) {
    this.currentPage = page;
  }

  setPageSize(size: number) {
    this.pageSize = size;
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setSearchQuery(query: string) {
    this.searchQuery = query;
  }

  get totalPages() {
    return Math.ceil(this.total / this.pageSize);
  }

  get hasMore() {
    return this.currentPage < this.totalPages;
  }
} 