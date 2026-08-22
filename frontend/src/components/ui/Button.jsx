import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: `
    bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800
    text-white shadow-xs hover:shadow-md hover:-translate-y-0.5
    border border-transparent
    focus-visible:ring-indigo-500/20
  `,
  secondary: `
    bg-white/90 hover:bg-white active:bg-slate-50
    text-slate-700 hover:text-slate-900
    border border-slate-200/90 hover:border-slate-300
    shadow-xs hover:shadow-sm hover:-translate-y-0.5
    backdrop-blur-sm
  `,
  ghost: `
    bg-transparent hover:bg-slate-100/80 active:bg-slate-200/70
    text-slate-600 hover:text-slate-900
    border border-transparent
  `,
  danger: `
    bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 active:from-rose-800 active:to-red-800
    text-white shadow-xs hover:shadow-md hover:-translate-y-0.5
    border border-transparent
    focus-visible:ring-rose-500/20
  `,
  dangerGhost: `
    bg-transparent hover:bg-rose-50 active:bg-rose-100/80
    text-rose-600 hover:text-rose-700
    border border-transparent
  `,
  success: `
    bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 active:to-teal-800
    text-white shadow-xs hover:shadow-md hover:-translate-y-0.5
    border border-transparent
    focus-visible:ring-emerald-500/20
  `,
  glass: `
    bg-white/70 hover:bg-white/90 active:bg-white
    text-slate-700 hover:text-slate-900
    border border-slate-200/80 hover:border-slate-300
    shadow-xs hover:shadow-sm
    backdrop-blur-md
  `,
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs font-medium rounded-lg gap-1.5',
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-sm font-bold rounded-xl gap-2.5',
  xl: 'px-6 py-3 text-base font-bold rounded-2xl gap-3',
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
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none
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
