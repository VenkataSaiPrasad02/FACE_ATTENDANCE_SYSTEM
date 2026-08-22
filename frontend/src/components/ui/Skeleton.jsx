import React from 'react';

export default function Skeleton({
  className = '',
  lines = 1,
  variant = 'text',
  circle = false,
}) {
  if (circle || variant === 'circle') {
    return (
      <div
        className={`animate-shimmer rounded-full bg-slate-200/80 ${className}`}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`rounded-2xl border border-slate-200/80 bg-white/70 p-6 backdrop-blur-sm shadow-sm ${className}`}
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-slate-200 animate-shimmer shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded-md bg-slate-200 animate-shimmer" />
            <div className="h-3 w-1/2 rounded-md bg-slate-200/70 animate-shimmer" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full rounded-md bg-slate-200/60 animate-shimmer" />
          <div className="h-3 w-4/5 rounded-md bg-slate-200/60 animate-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 rounded-lg bg-slate-200/80 animate-shimmer"
          style={{
            width: lines === 1 ? '100%' : `${100 - (index % 3) * 15}%`,
          }}
        />
      ))}
    </div>
  );
}
