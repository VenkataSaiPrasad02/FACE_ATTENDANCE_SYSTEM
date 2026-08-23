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
        className={`animate-shimmer rounded-full bg-[#1a2450]/70 ${className}`}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`rounded-2xl border border-white/[0.08] bg-[#0d1430]/60 p-6 backdrop-blur-sm shadow-card ${className}`}
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl skeleton-block shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded-md skeleton-block" />
            <div className="h-3 w-1/2 rounded-md skeleton-block opacity-70" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full rounded-md skeleton-block opacity-60" />
          <div className="h-3 w-4/5 rounded-md skeleton-block opacity-60" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 rounded-lg skeleton-block"
          style={{
            width: lines === 1 ? '100%' : `${100 - (index % 3) * 15}%`,
          }}
        />
      ))}
    </div>
  );
}
