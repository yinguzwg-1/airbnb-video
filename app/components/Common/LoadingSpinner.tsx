"use client";

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
    </div>
  );
}

// 页面级别的加载组件
export function PageLoading() {
  return (
    <div className="flex items-center justify-center max-h-screen">
      <div className="text-center">
        <LoadingSpinner size="lg" />
       
      </div>
    </div>
  );
}

// 组件级别的加载组件
export function ComponentLoading() {
  return (
    <div className="flex items-center justify-center p-4">
      <LoadingSpinner size="md" />
    </div>
  );
} 