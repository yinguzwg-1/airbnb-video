import React, { useState } from 'react';
import { usePlayer } from './MusicPlayerContext';

const GlobalVolumeControl: React.FC = () => {
  const { volume, setVolume } = usePlayer();
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  return (
    <div className="z-50">
      <div className="relative">
        {/* 音量按钮 */}
        <button
          onClick={() => setShowVolumeControl(!showVolumeControl)}
          className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-300"
        >
          {volume === 0 ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : volume < 0.5 ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          )}
        </button>

        {/* 音量滑块 */}
        {showVolumeControl && (
          <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg p-4 shadow-xl min-w-[140px]">
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-600 whitespace-nowrap">音量</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer slider-horizontal"
                style={{
                  background: `linear-gradient(to right, #000 0%, #000 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
                }}
              />
              <span className="text-xs text-gray-600 min-w-[30px]">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* 自定义样式 */}
      <style jsx>{`
        .slider-horizontal::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #000;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          border: 2px solid #fff;
        }
        
        .slider-horizontal::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #000;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default GlobalVolumeControl; 