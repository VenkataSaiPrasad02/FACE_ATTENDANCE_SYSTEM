import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function ProcessingAnimation({ message = 'Analyzing face...' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-gradient-to-br from-blue-900/95 to-purple-900/95 backdrop-blur-sm flex flex-col items-center justify-center"
    >
      <div className="text-center text-white">
        {/* Spinning Loader */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mb-6 mx-auto"
        >
          <Loader2 size={64} className="text-blue-300" />
        </motion.div>

        {/* Processing Message */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-xl font-semibold mb-3"
        >
          {message}
        </motion.div>

        {/* Processing Steps */}
        <div className="space-y-2 text-sm text-blue-200">
          <ProcessingStep delay={0} text="Detecting facial features..." />
          <ProcessingStep delay={0.5} text="Analyzing biometric data..." />
          <ProcessingStep delay={1} text="Matching with database..." />
        </div>

        {/* Bouncing Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              className="w-2.5 h-2.5 bg-blue-300 rounded-full shadow-lg"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ProcessingStep({ delay, text }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center justify-center gap-2"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, delay }}
        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
      />
      <span>{text}</span>
    </motion.div>
  );
}