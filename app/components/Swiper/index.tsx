'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface CarouselItem {
  id: string | number;
  content: React.ReactNode;
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  transitionDuration?: number;
}

const Carousel: React.FC<CarouselProps> = ({
  items,
  autoPlay = true,
  interval = 3000,
  showArrows = true,
  showDots = true,
  transitionDuration = 500,
}) => {
  const [currentIndex, setCurrentIndex] = useState(1); // 从1开始，因为0是克隆的最后一项
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  // 克隆第一项和最后一项以实现无缝循环
  const clonedItems = [
    { ...items[items.length - 1], id: `clone-${items[items.length - 1].id}` },
    ...items,
    { ...items[0], id: `clone-${items[0].id}` },
  ];

  const totalItems = clonedItems.length;

  // 处理自动播放
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying && items.length > 1) {
      timer = setTimeout(() => {
        handleNext();
      }, interval);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentIndex, isPlaying, interval, items.length]);

  // 处理无限循环
  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => {
      if (prevIndex >= totalItems - 2) {
        // 如果是克隆的最后一项，先快速跳转到真实的第一项
        setTimeout(() => {
          setIsTransitioning(false);
          setCurrentIndex(1);
        }, transitionDuration);
      }
      return prevIndex + 1;
    });
  }, [totalItems, transitionDuration]);

  const handlePrev = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => {
      if (prevIndex <= 1) {
        // 如果是克隆的第一项，先快速跳转到真实的最后一项
        setTimeout(() => {
          setIsTransitioning(false);
          setCurrentIndex(totalItems - 2);
        }, transitionDuration);
      }
      return prevIndex - 1;
    });
  }, [totalItems, transitionDuration]);

  const goToIndex = (index: number) => {
    setIsTransitioning(true);
    setCurrentIndex(index + 1); // 因为前面有一个克隆项，所以真实索引要+1
  };

  // 鼠标悬停暂停
  const handleMouseEnter = () => {
    if (autoPlay) {
      setIsPlaying(false);
    }
  };

  const handleMouseLeave = () => {
    if (autoPlay) {
      setIsPlaying(true);
    }
  };

  // 处理过渡结束事件
  const handleTransitionEnd = () => {
    if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(totalItems - 2);
    } else if (currentIndex === totalItems - 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={carouselRef}
    >
      {/* 轮播内容 */}
      <div
        className="flex"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? `transform ${transitionDuration}ms ease-in-out` : 'none',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {clonedItems.map((item) => (
          <div
            key={item.id}
            className="w-full flex-shrink-0"
          >
            {item.content}
          </div>
        ))}
      </div>

      {/* 导航箭头 */}
      {showArrows && items.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* 指示器 */}
      {showDots && items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentIndex - 1 ? 'bg-white w-6' : 'bg-white bg-opacity-50'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;