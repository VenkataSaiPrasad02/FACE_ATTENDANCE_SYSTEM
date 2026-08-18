import { motion } from 'framer-motion';
import { Inbox, Users, FileText, Search } from 'lucide-react';
import Button from './Button';

const iconMap = {
  Inbox,
  Users,
  FileText,
  Search,
  default: Inbox,
};

export default function EmptyState({ icon: Icon = 'default', title, description, action, className = '' }) {
  const IconComponent = typeof Icon === 'string' ? iconMap[Icon] || iconMap.default : Icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center py-16 px-4 text-center glass-medium rounded-2xl ${className}`}
    >
      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-5 shadow-inner-glow">
        <IconComponent size={40} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && (
        <Button 
          variant="secondary" 
          size="md"
          {...action} 
        />
      )}
    </motion.div>
  );
}

