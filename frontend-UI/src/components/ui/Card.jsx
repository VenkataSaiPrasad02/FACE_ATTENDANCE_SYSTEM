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
            ? 'border border-white/[0.08] bg-[#0d1430]/55 shadow-card backdrop-blur-md'
            : 'border border-white/[0.10] bg-[#0b1128]/85 shadow-card'
        }
        ${
          hover
            ? 'hover:border-cyan-300/25 hover:shadow-card-hover hover:-translate-y-0.5'
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
