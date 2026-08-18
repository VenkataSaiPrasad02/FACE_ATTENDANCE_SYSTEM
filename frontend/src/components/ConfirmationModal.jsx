import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

/**
 * Generic confirmation modal for destructive / important actions.
 * UI-only component — callers pass their own async onConfirm handler
 * that performs the actual (unchanged) API call.
 *
 * Props:
 *  - open: boolean
 *  - title: string
 *  - message: string | ReactNode
 *  - confirmText / cancelText: button labels
 *  - loading: boolean (true while the real async action is in-flight)
 *  - onConfirm: () => void | Promise<void>
 *  - onCancel: () => void
 */
export default function ConfirmationModal({
  open,
  title = 'Confirm Action',
  message = 'Are you sure you want to continue?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  loading = false,
  onConfirm,
  onCancel
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="confirm-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!loading) onCancel?.();
          }}
        >
          <motion.div
            className="confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-message"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="mb-4 flex items-start gap-4">
                <div className="confirm-modal-icon">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2
                    id="confirm-modal-title"
                    className="text-lg font-semibold text-gray-900"
                  >
                    {title}
                  </h2>
                  <p
                    id="confirm-modal-message"
                    className="mt-1 text-sm text-gray-600"
                  >
                    {message}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="confirm-modal-btn-cancel"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {cancelText}
                </button>

                <button
                  type="button"
                  className="confirm-modal-btn-delete"
                  onClick={onConfirm}
                  disabled={loading}
                  autoFocus
                >
                  {loading && <span className="confirm-modal-spinner" />}
                  {loading ? 'Deleting...' : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

