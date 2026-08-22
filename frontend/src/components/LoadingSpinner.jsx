import React from 'react';

export default function LoadingSpinner({
  text = 'Loading...',
  size = 'md',
  className = '',
}) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-9 w-9 border-2.5',
    lg: 'h-12 w-12 border-3',
  }[size] || 'h-9 w-9 border-2.5';

  return (
    <div className={`flex flex-col items-center justify-center py-12 text-slate-500 ${className}`}>
      <div
        className={`${sizeClasses} rounded-full border-slate-200 border-t-indigo-600 animate-spin`}
        style={{
          borderTopColor: '#4f46e5',
        }}
      />
      {text && (
        <p className="mt-3.5 text-xs font-semibold text-slate-500 tracking-tight">
          {text}
        </p>
      )}
    </div>
  );
}
