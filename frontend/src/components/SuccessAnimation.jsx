import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Button from './ui/Button';

export default function SuccessAnimation({ studentName, onDone, onReCapture }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center p-8 w-full"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-10 h-10 text-green-500"
          viewBox="0 0 24 24"
        >
          <motion.path
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </motion.div>

      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Face Registered Successfully
      </h3>
      <p className="text-gray-600 mb-6 text-sm">
        Student: <span className="font-medium">{studentName}</span>
      </p>

      <div className="flex justify-center gap-3">
        <Button variant="secondary" onClick={onReCapture} size="sm">
          ↻ Register Another
        </Button>
        <Button variant="primary" onClick={onDone} size="sm">
          Done
        </Button>
      </div>
    </motion.div>
  );
}