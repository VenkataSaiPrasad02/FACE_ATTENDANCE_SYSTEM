import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import Button from './ui/Button';

/**
 * Universal SaaS Confirmation Modal for destructive or sensitive actions.
 */
export default function ConfirmationModal({
  open,
  title = 'Confirm Action',
  message = 'Are you sure you want to continue?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  loading = false,
  variant = 'danger', // 'danger' | 'warning'
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onCancel?.();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  const isDanger = variant === 'danger' || confirmText.toLowerCase().includes('delete') || confirmText.toLowerCase().includes('remove');

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-message"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={() => {
          if (!loading) onCancel?.();
        }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
      />

      {/* Centered Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl glass-modal p-6 sm:p-7 animate-scale-in text-center"
      >
        {/* Close trigger */}
        <button
          type="button"
          onClick={() => {
            if (!loading) onCancel?.();
          }}
          aria-label="Close modal"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white"
        >
          <X size={16} />
        </button>

        {/* Gradient Icon Container */}
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${
            isDanger
              ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-[0_0_30px_-6px_rgba(244,63,94,0.55)]'
              : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_30px_-6px_rgba(251,146,60,0.5)]'
          }`}
        >
          {isDanger ? (
            <Trash2 size={24} strokeWidth={2.2} />
          ) : (
            <AlertTriangle size={24} strokeWidth={2.2} />
          )}
        </div>

        {/* Content */}
        <h3
          id="confirm-modal-title"
          className="font-display text-lg font-bold tracking-tight text-white"
        >
          {title}
        </h3>

        <div
          id="confirm-modal-message"
          className="mt-2 max-w-xs mx-auto text-xs sm:text-sm leading-relaxed text-slate-400"
        >
          {message}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 font-semibold"
          >
            {cancelText}
          </Button>

          {isDanger ? (
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-rose-600/20 transition-all duration-150 hover:from-rose-700 hover:to-red-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              <span>{loading ? 'Processing...' : confirmText}</span>
            </button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={onConfirm}
              loading={loading}
              className="flex-1 font-semibold shadow-sm"
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
