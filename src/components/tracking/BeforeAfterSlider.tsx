import React, { useState, useRef, useCallback } from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  beforeUrl: string;
  afterUrl: string;
}

export const BeforeAfterSlider: React.FC<Props> = ({ beforeUrl, afterUrl }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && e.buttons !== 1) return;
    handleMove(e.clientX);
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">
            Verified Resolution Proof
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Drag divider to compare</span>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        className="relative w-full aspect-video rounded-2xl overflow-hidden select-none cursor-ew-resize border border-slate-700/80 shadow-2xl"
      >
        {/* AFTER Image (Full background) */}
        <img
          src={afterUrl}
          alt="After resolution"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider shadow-lg">
          After (Fixed)
        </div>

        {/* BEFORE Image (Clipped overlay) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeUrl}
            alt="Before repair"
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{
              width: containerRef.current?.clientWidth || '100%',
              height: '100%',
            }}
          />
          <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-rose-600/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider shadow-lg">
            Before (Reported)
          </div>
        </div>

        {/* Draggable Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20 -translate-x-1/2"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-950 font-bold flex items-center justify-center shadow-2xl text-xs">
            ◀▶
          </div>
        </div>
      </div>
    </div>
  );
};
