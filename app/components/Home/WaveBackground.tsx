"use client";

import { useEffect, useRef } from 'react';

interface WaveBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function WaveBackground({ children, className = "" }: WaveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置canvas尺寸
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 波浪参数
    let time = 0;
    const waves = [
      { amplitude: 20, frequency: 0.02, speed: 0.03, color: 'rgba(147, 51, 234, 0.1)' },
      { amplitude: 15, frequency: 0.03, speed: 0.02, color: 'rgba(236, 72, 153, 0.1)' },
      { amplitude: 10, frequency: 0.04, speed: 0.01, color: 'rgba(59, 130, 246, 0.1)' }
    ];

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2;
        
        for (let x = 0; x <= canvas.width; x += 2) {
          const y = Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude + canvas.height / 2;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      });
      
      time += 0.5;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 