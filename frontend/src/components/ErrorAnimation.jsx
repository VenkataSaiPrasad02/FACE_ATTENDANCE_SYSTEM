import { motion } from 'framer-motion';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './ui/Button';

export default function ErrorAnimation({ error, onReCapture }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center p-8 w-full"
    >
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={40} className="text-red-500" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Face Registration Failed
      </h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto text-sm">{error}</p>

      <Button variant="secondary" icon={RotateCcw} onClick={onReCapture} size="sm">
        Try Again
      </Button>
    </motion.div>
  );
}