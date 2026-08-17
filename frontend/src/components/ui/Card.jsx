import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = false, glass = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' } : undefined}
      transition={{ duration: 0.2 }}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100 p-6
        ${glass ? 'glass-card' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}