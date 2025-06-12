"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* 加载动画 */}
      <div className="relative mb-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
      </div>
      
      {/* 加载文本 */}
      <div className="text-gray-600 text-lg font-medium mb-2">
        正在加载精彩内容...
      </div>
      
      {/* 加载提示 */}
      <div className="text-gray-400 text-sm">
        请稍等片刻，为您寻找最棒的影视作品
      </div>

      {/* 骨架屏 */}
      <div className="w-full max-w-6xl mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              {/* 海报骨架 */}
              <div className="aspect-[2/3] bg-gray-200 rounded-lg mb-3"></div>
              
              {/* 标题骨架 */}
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              
              {/* 信息骨架 */}
              <div className="flex justify-between mb-2">
                <div className="h-3 bg-gray-200 rounded w-12"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              
              {/* 标签骨架 */}
              <div className="flex gap-1 mb-3">
                <div className="h-5 bg-gray-200 rounded w-12"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              
              {/* 按钮骨架 */}
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 