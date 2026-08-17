import { motion } from 'framer-motion';

export default function FaceGuideOverlay({
  autoCapture = false,
  faceDetected = false,
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      {/* Face guide frame */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative h-64 w-48 rounded-3xl border-2 ${
          faceDetected
            ? 'border-emerald-400'
            : 'border-white/40'
        }`}
      >
        {/* Corner accents */}
        <div className={`absolute -left-1 -top-1 h-8 w-8 rounded-tl-lg border-l-4 border-t-4 ${
          faceDetected ? 'border-emerald-400' : 'border-blue-400'
        }`} />
        <div className={`absolute -right-1 -top-1 h-8 w-8 rounded-tr-lg border-r-4 border-t-4 ${
          faceDetected ? 'border-emerald-400' : 'border-blue-400'
        }`} />
        <div className={`absolute -bottom-1 -left-1 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 ${
          faceDetected ? 'border-emerald-400' : 'border-blue-400'
        }`} />
        <div className={`absolute -bottom-1 -right-1 h-8 w-8 rounded-br-lg border-b-4 border-r-4 ${
          faceDetected ? 'border-emerald-400' : 'border-blue-400'
        }`} />
      </motion.div>

      {/* Scanning line */}
      <motion.div
        animate={{ opacity: [0, 1, 0], top: ['20%', '80%', '20%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute h-0.5 w-44 ${
          faceDetected ? 'bg-emerald-400/70' : 'bg-blue-400/60'
        }`}
      />

      {/* Position hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-4 left-0 right-0 text-center"
      >
        <span className="rounded-full bg-black/30 px-3 py-1 text-sm font-medium text-white/80">
          {autoCapture
            ? faceDetected
              ? 'Face detected — hold still'
              : 'Face will be captured automatically'
            : 'Position your face within the frame'}
        </span>
      </motion.div>
    </div>
  );
}
