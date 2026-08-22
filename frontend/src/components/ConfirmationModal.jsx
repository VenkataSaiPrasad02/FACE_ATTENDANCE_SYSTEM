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
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm animate-fade-in"
      />

      {/* Centered Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xl backdrop-blur-xl animate-scale-in text-center"
      >
        {/* Close trigger */}
        <button
          type="button"
          onClick={() => {
            if (!loading) onCancel?.();
          }}
          aria-label="Close modal"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={16} />
        </button>

        {/* Gradient Icon Container */}
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${
            isDanger
              ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/25'
              : 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25'
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
          className="text-lg font-bold tracking-tight text-slate-900"
        >
          {title}
        </h3>

        <div
          id="confirm-modal-message"
          className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 max-w-xs mx-auto"
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
