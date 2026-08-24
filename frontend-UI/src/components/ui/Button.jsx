import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: `
    bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 active:from-blue-600 active:to-cyan-500
    text-white shadow-glow-sm hover:shadow-glow hover:-translate-y-0.5
    border border-cyan-300/30
    focus-visible:ring-cyan-400/40
  `,
  secondary: `
    bg-white/[0.06] hover:bg-white/[0.11] active:bg-white/[0.14]
    text-slate-200 hover:text-white
    border border-white/10 hover:border-white/20
    shadow-xs hover:shadow-glow-sm hover:-translate-y-0.5
    backdrop-blur-sm
  `,
  ghost: `
    bg-transparent hover:bg-white/[0.07] active:bg-white/[0.1]
    text-slate-400 hover:text-slate-100
    border border-transparent
  `,
  danger: `
    bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 active:from-rose-600 active:to-red-600
    text-white shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/35 hover:-translate-y-0.5
    border border-rose-300/25
    focus-visible:ring-rose-400/40
  `,
  dangerGhost: `
    bg-transparent hover:bg-rose-500/12 active:bg-rose-500/20
    text-rose-400 hover:text-rose-300
    border border-transparent
  `,
  success: `
    bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:from-emerald-600 active:to-teal-500
    text-white shadow-glow-sm hover:shadow-glow hover:-translate-y-0.5
    border border-emerald-300/25
    focus-visible:ring-emerald-400/40
  `,
  glass: `
    bg-[#0d142e]/60 hover:bg-[#141c3e]/80 active:bg-[#1a2452]/80
    text-slate-200 hover:text-white
    border border-white/10 hover:border-cyan-300/25
    shadow-xs hover:shadow-glow-sm
    backdrop-blur-md
  `,
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs font-medium rounded-lg gap-1.5',
  sm: 'px-3 py-2 text-xs font-semibold rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-5 py-3 text-sm font-bold rounded-xl gap-2.5',
  xl: 'px-6 py-3.5 text-base font-bold rounded-2xl gap-3',
};

const Button = forwardRef(({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  disabled,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center
        transition-all duration-150 ease-out select-none
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none disabled:shadow-none
        active:scale-[0.99]
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'xs' || size === 'sm' ? 14 : 16} className="animate-spin shrink-0" />
      ) : Icon ? (
        <Icon size={size === 'xs' || size === 'sm' ? 14 : 16} className="shrink-0" />
      ) : null}

      {children && <span>{children}</span>}

      {!loading && IconRight && (
        <IconRight size={size === 'xs' || size === 'sm' ? 14 : 16} className="shrink-0" />
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
