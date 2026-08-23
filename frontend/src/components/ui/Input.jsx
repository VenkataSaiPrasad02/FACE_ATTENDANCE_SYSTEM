import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  rightElement,
  id,
  type = 'text',
  className = '',
  containerClassName = '',
  required = false,
  disabled = false,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-semibold tracking-tight text-slate-300"
        >
          {label}
          {required && <span className="ml-1 text-rose-400">*</span>}
        </label>
      )}

      <div
        className={`
          group relative flex items-center w-full rounded-xl border
          bg-[#0a1026]/80 backdrop-blur-sm transition-all duration-200 ease-out
          ${
            error
              ? 'border-rose-500/50 ring-2 ring-rose-500/15 focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-500/20'
              : 'border-white/10 hover:border-white/20 focus-within:border-cyan-300/60 focus-within:shadow-glow-sm focus-within:ring-4 focus-within:ring-cyan-400/10'
          }
          ${disabled ? 'bg-white/[0.03] opacity-55 cursor-not-allowed' : ''}
        `}
      >
        {Icon && (
          <div className="flex pl-3.5 pr-1 items-center justify-center text-slate-500 transition-colors group-focus-within:text-cyan-300">
            <Icon size={18} />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          className={`
            w-full bg-transparent px-3.5 py-2.5 text-sm font-medium text-slate-100
            placeholder:text-slate-600 placeholder:font-normal
            outline-none disabled:cursor-not-allowed
            ${Icon ? 'pl-2' : ''}
            ${rightElement ? 'pr-2' : ''}
            ${className}
          `}
          {...props}
        />

        {rightElement && (
          <div className="flex items-center pr-2.5">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-400">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
