import { motion } from 'framer-motion';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        style={{
          width: 34,
          height: 34,
          border: '2.5px solid rgba(0,0,0,0.08)',
          borderTopColor: '#171717',
          borderRadius: '50%',
        }}
      />
      <p className="mt-4 text-[13px] font-medium text-neutral-500">{text}</p>
    </div>
  );
}
