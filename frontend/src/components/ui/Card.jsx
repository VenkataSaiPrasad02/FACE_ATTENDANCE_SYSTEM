import React from 'react';

export default function Card({
  children,
  className = '',
  hover = false,
  glass = true,
  padding = 'p-6',
  ...props
}) {
  return (
    <div
      className={`
        rounded-2xl
        transition-all duration-200 ease-out
        ${
          glass
            ? 'bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm'
            : 'bg-white border border-slate-200/90 shadow-sm'
        }
        ${
          hover
            ? 'hover:bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
            : ''
        }
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
