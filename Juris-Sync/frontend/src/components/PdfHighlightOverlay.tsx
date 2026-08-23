import React, { useEffect, useRef } from 'react';

interface PdfHighlightOverlayProps {
  boundingBox: number[]; // [x, y, w, h] normalized 0-1
  width: number;
  height: number;
  isSensitive?: boolean;
  isPublic?: boolean;
  extractedText?: string;
}

export function PdfHighlightOverlay({ boundingBox, width, height, isSensitive, isPublic, extractedText }: PdfHighlightOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const [x, y, w, h] = boundingBox;
    const rectX = x * width;
    const rectY = y * height;
    const rectW = w * width;
    const rectH = h * height;

    if (!isSensitive) {
      ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = 'rgba(239, 68, 68, 1)'; // Tailwind red-500
      ctx.lineWidth = 3;
      ctx.strokeRect(rectX, rectY, rectW, rectH);
      ctx.shadowBlur = 0; // reset
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'; // Tailwind red-500 with opacity
      ctx.fillRect(rectX, rectY, rectW, rectH);
    }
    
    // Auto-scroll the highlight into view
    canvas.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }, [boundingBox, width, height, isSensitive]);

  const [x, y, w, h] = boundingBox;
  const rectX = x * width;
  const rectY = y * height;
  const rectW = w * width;
  const rectH = h * height;

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute top-0 left-0 pointer-events-none z-10"
      />
      
      {/* Public Mode: Glassmorphism Blur Overlay */}
      {isSensitive && isPublic && (
        <div 
          className="absolute z-20 bg-white/5 rounded border border-white/10 animate-lock-in"
          style={{
            left: `${rectX - 2}px`,
            top: `${rectY - 2}px`,
            width: `${rectW + 4}px`,
            height: `${rectH + 4}px`
          }}
        >
          <div className="w-full h-full flex items-center justify-center pointer-events-none">
            <span className="text-white text-[9px] tracking-[0.2em] font-bold opacity-60 uppercase drop-shadow-md">Redacted</span>
          </div>
        </div>
      )}

      {/* Judge Mode X-Ray Vision: Reveal underlying text over the physical black bar */}
      {isSensitive && !isPublic && extractedText && (
        <div 
          className="absolute z-20 bg-blue-900/90 rounded border border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center overflow-hidden"
          style={{
            left: `${rectX - 2}px`,
            top: `${rectY - 2}px`,
            width: `${rectW + 4}px`,
            height: `${rectH + 4}px`
          }}
        >
          <span className="text-blue-100 font-mono font-bold whitespace-nowrap px-1" style={{ fontSize: `${Math.max(8, rectH * 0.6)}px` }}>
            {extractedText}
          </span>
        </div>
      )}
    </>
  );
}
