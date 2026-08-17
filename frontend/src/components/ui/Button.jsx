import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: `
    bg-gradient-to-r from-blue-600 to-blue-700
    hover:from-blue-700 hover:to-blue-800
    active:from-blue-800 active:to-blue-900
    text-white shadow-md hover:shadow-lg shadow-blue-500/20
  `,
  secondary: `
    bg-white hover:bg-gray-50 active:bg-gray-100
    text-gray-700 border border-gray-200 hover:border-gray-300
  `,
  danger: `
    bg-gradient-to-r from-red-600 to-red-700
    hover:from-red-700 hover:to-red-800
    active:from-red-800 active:to-red-900
    text-white shadow-md hover:shadow-lg shadow-red-500/20
  `,
  ghost: `
    bg-transparent hover:bg-gray-100 active:bg-gray-200
    text-gray-600
  `,
  success: `
    bg-gradient-to-r from-emerald-600 to-emerald-700
    hover:from-emerald-700 hover:to-emerald-800
    active:from-emerald-800 active:to-emerald-900
    text-white shadow-md hover:shadow-lg shadow-emerald-500/20
  `,
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-medium',
  md: 'px-4 py-2 text-sm font-medium',
  lg: 'px-6 py-3 text-base font-semibold',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  className = '',
  disabled,
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={!disabled && !loading ? { y: -1, scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { y: 0, scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 420, damping: 20 }}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium transition-all duration-200 hover:brightness-[1.02]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
