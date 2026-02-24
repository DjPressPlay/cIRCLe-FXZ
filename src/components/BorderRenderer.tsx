import React, { useEffect, useRef } from 'react';
import { drawBorderToCanvas } from '../utils/borderUtils';

interface BorderRendererProps {
  type: string;
  color: string;
  secondaryColor?: string;
  size: number;
  progress?: number;
  isActive?: boolean;
}

export const BorderRenderer: React.FC<BorderRendererProps> = ({ type, color, secondaryColor, size, progress = 1, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);
    
    drawBorderToCanvas({
      ctx,
      type,
      color,
      secondaryColor,
      size,
      progress,
    });
  }, [type, color, secondaryColor, size, progress]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        filter: isActive ? `drop-shadow(0 0 8px ${color})` : 'none',
      }}
      className="pointer-events-none"
    />
  );
};
