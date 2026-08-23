import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size,
  maxWidth = 'md',
  showClose = true,
  closeOnBackdrop = true,
  className = '',
}) {
  const chosenSize = size || maxWidth;

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={() => {
          if (closeOnBackdrop) onClose?.();
        }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-fade-in"
      />

      {/* Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          relative z-10 w-full max-h-[90vh] overflow-y-auto rounded-3xl glass-modal p-6 sm:p-8 animate-scale-in
          ${maxWidthMap[chosenSize] || maxWidthMap.md}
          ${className}
        `}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08] mb-5">
            <div>
              {title && (
                <h3
                  id="modal-title"
                  className="font-display text-lg font-bold tracking-tight text-white"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-xs text-slate-400">
                  {description}
                </p>
              )}
            </div>

            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-400 hover:border-white/25 hover:bg-white/[0.07] hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}
