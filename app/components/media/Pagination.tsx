"use client";

import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from "react-icons/fi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // 如果总页数小于等于最大显示页数，显示所有页
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总是显示第一页
      pages.push(1);

      if (currentPage <= 4) {
        // 当前页在前面时
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // 当前页在后面时
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 当前页在中间时
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* 上一页按钮 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className={`
          flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
          ${hasPrev 
            ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-blue-600' 
            : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
          }
        `}
      >
        <FiChevronLeft size={16} className="mr-1" />
        上一页
      </button>

      {/* 页码按钮 */}
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center px-3 py-2 text-sm text-gray-500"
              >
                <FiMoreHorizontal size={16} />
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`
                px-3 py-2 text-sm font-medium rounded-md transition-colors min-w-[40px]
                ${isActive
                  ? 'bg-blue-600 text-white border border-blue-600'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-blue-600'
                }
              `}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* 下一页按钮 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className={`
          flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
          ${hasNext 
            ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-blue-600' 
            : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
          }
        `}
      >
        下一页
        <FiChevronRight size={16} className="ml-1" />
      </button>

      {/* 页面信息 */}
      <div className="hidden sm:flex items-center ml-4 text-sm text-gray-500">
        第 <span className="font-medium text-gray-900 mx-1">{currentPage}</span> 页
        共 <span className="font-medium text-gray-900 mx-1">{totalPages}</span> 页
      </div>
    </div>
  );
} 