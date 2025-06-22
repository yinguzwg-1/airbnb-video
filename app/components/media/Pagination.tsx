"use client";

import React from 'react';
import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from "react-icons/fi";
import { translations, Language } from "@/app/i18n";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  lang: Language;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  lang
}: PaginationProps) {
  const t = translations[lang];
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 添加第一页
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    // 添加中间页
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // 添加最后页
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {t.pagination.showing} {Math.min((currentPage - 1) * pageSize + 1, totalItems)} - {Math.min(currentPage * pageSize, totalItems)} {t.pagination.of} {totalItems} {t.pagination.items}
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="ml-2 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          <option value="12">12</option>
          <option value="24">24</option>
          <option value="36">36</option>
          <option value="48">48</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="px-2">
                <FiMoreHorizontal className="w-5 h-5 text-gray-400" />
              </span>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 