import { motion } from 'framer-motion';

export default function FaceGuideOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Face guide frame */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-48 h-64 border-2 border-white/40 rounded-3xl relative"
      >
        {/* Corner accents */}
        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
      </motion.div>

      {/* Scanning line */}
      <motion.div
        animate={{ opacity: [0, 1, 0], top: ['20%', '80%', '20%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-44 h-0.5 bg-blue-400/60"
      />

      {/* Position hint text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-4 left-0 right-0 text-center"
      >
        <span className="text-white/80 text-sm font-medium bg-black/30 px-3 py-1 rounded-full">
          Position your face within the frame
        </span>
      </motion.div>
    </div>
  );
}