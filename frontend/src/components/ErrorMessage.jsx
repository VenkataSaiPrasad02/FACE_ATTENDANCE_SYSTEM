import { motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm font-medium"
    >
      <AlertCircle size={18} />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="bg-transparent border-none cursor-pointer text-red-700 opacity-60 hover:opacity-100 p-1"
        >
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
}