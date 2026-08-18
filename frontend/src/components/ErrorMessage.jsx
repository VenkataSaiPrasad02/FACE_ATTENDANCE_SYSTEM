import { motion } from 'framer-motion';
import { AlertCircle, WifiOff, ServerCrash, AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

const iconMap = { AlertCircle, WifiOff, ServerCrash, AlertTriangle, default: AlertCircle };

export default function ErrorMessage({ title, message, onRetry, icon: Icon = 'default', className = '' }) {
  const IconComponent = typeof Icon === 'string' ? iconMap[Icon] || iconMap.default : Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={`flex flex-col items-center justify-center rounded-2xl border border-red-200/60 bg-red-50/40 py-14 px-6 text-center backdrop-blur-md ${className}`}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <IconComponent size={26} className="text-red-500" strokeWidth={1.8} />
      </div>
      <h3 className="text-[17px] font-semibold text-neutral-900">{title}</h3>
      {message && (
        <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-neutral-500">{message}</p>
      )}
      {onRetry && (
        <div className="mt-5">
          <Button variant="secondary" size="md" icon={RefreshCw} onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </motion.div>
  );
}
