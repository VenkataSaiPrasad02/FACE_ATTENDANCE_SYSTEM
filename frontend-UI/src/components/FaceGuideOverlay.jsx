import React from 'react';

export default function FaceGuideOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      {/* Face guide frame */}
      <div className="relative w-52 h-68 sm:w-60 sm:h-76 border-2 border-white/50 rounded-[42px] backdrop-blur-[0.5px] transition-all duration-300">
        {/* Corner accent markers */}
        <div className="absolute -top-1.5 -left-1.5 w-7 h-7 border-t-3 border-l-3 border-indigo-400 rounded-tl-2xl shadow-sm" />
        <div className="absolute -top-1.5 -right-1.5 w-7 h-7 border-t-3 border-r-3 border-indigo-400 rounded-tr-2xl shadow-sm" />
        <div className="absolute -bottom-1.5 -left-1.5 w-7 h-7 border-b-3 border-l-3 border-indigo-400 rounded-bl-2xl shadow-sm" />
        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 border-b-3 border-r-3 border-indigo-400 rounded-br-2xl shadow-sm" />

        {/* Center alignment crosshair hints */}
        <div className="absolute top-1/2 -left-3 w-2 h-0.5 bg-white/40 -translate-y-1/2" />
        <div className="absolute top-1/2 -right-3 w-2 h-0.5 bg-white/40 -translate-y-1/2" />
        <div className="absolute -top-3 left-1/2 w-0.5 h-2 bg-white/40 -translate-x-1/2" />
        <div className="absolute -bottom-3 left-1/2 w-0.5 h-2 bg-white/40 -translate-x-1/2" />
      </div>

      {/* Subtle laser scan line */}
      <div className="scan-line" />

      {/* Guidance Hint */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/60 px-3.5 py-1 text-xs font-medium text-white/90 backdrop-blur-md shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
          Center face within guide frame
        </span>
      </div>
    </div>
  );
}