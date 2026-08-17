import { motion } from 'framer-motion';
import { AlertCircle, WifiOff, ServerCrash, AlertTriangle } from 'lucide-react';
import Button from './Button';

const iconMap = {
  AlertCircle,
  WifiOff,
  ServerCrash,
  AlertTriangle,
  default: AlertCircle,
};

export default function ErrorState({ 
  title, 
  message, 
  onRetry, 
  icon: Icon = 'default',
  className = '' 
}) {
  const IconComponent = typeof Icon === 'string' ? iconMap[Icon] || iconMap.default : Icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, type: 'spring' }}
      className={`flex flex-col items-center justify-center py-16 px-4 text-center glass-medium rounded-2xl ${className}`}
    >
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mb-5 shadow-error">
          <IconComponent size={40} className="text-red-500" />
        </div>
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-red-400/20 animate-pulse" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-gray-500 mb-6 max-w-sm leading-relaxed">{message}</p>
      )}
      {onRetry && (
        <Button 
          variant="secondary" 
          size="md"
          icon={AlertCircle}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </motion.div>
  );
}