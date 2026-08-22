import React, { forwardRef } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  id,
  options = [],
  children,
  className = '',
  containerClassName = '',
  required = false,
  disabled = false,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-xs font-semibold text-slate-700 tracking-tight"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div
        className={`
          group relative flex items-center w-full rounded-xl border
          bg-white/90 backdrop-blur-sm transition-all duration-150 ease-out
          ${
            error
              ? 'border-red-300 ring-2 ring-red-500/10 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/15'
              : 'border-slate-200 hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10'
          }
          ${disabled ? 'bg-slate-100/70 opacity-60 cursor-not-allowed' : ''}
        `}
      >
        {Icon && (
          <div className="flex pl-3.5 pr-1 items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
            <Icon size={18} />
          </div>
        )}

        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          className={`
            w-full appearance-none bg-transparent px-3.5 py-2.5 text-sm font-medium text-slate-900
            outline-none disabled:cursor-not-allowed cursor-pointer pr-10
            ${Icon ? 'pl-2' : ''}
            ${className}
          `}
          {...props}
        >
          {children ? (
            children
          ) : (
            options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          )}
        </select>

        <div className="pointer-events-none absolute right-3 flex items-center text-slate-400 group-focus-within:text-slate-600">
          <ChevronDown size={16} />
        </div>
      </div>

      {error ? (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
