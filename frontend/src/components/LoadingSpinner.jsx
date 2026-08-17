import { motion } from 'framer-motion';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div style={{ textAlign: 'center', padding: 48, color: '#666' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        style={{
          display: 'inline-block',
          width: 40,
          height: 40,
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3498db',
          borderRadius: '50%'
        }}
      />
      <p style={{ marginTop: 16, fontSize: 14, fontWeight: 500, color: '#6b7280' }}>{text}</p>
    </div>
  );
}