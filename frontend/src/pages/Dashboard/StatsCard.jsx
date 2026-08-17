import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Percent, UserPlus, UserMinus } from 'lucide-react';

const iconMap = {
  'Total Students': Users,
  'Present Today': CheckCircle,
  'Absent Today': XCircle,
  'Attendance %': Percent,
  'Students Added': UserPlus,
  'Students Removed': UserMinus,
};

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  color = '#2563eb',
  icon: IconProp,
  className = ''
}) {
  const Icon = IconProp || iconMap[title] || Users;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)' }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-white shadow-md border border-gray-100
        hover:shadow-lg transition-all duration-300
        ${className}
      `}
    >
      {/* Background Gradient Blur */}
      <div 
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10"
        style={{ backgroundColor: color }}
      />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <div className="text-label mb-1">{title}</div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="text-4xl font-bold text-gray-900 my-2"
          >
            {value ?? '-'}
          </motion.div>
          {subtitle && (
            <div className="text-sm text-gray-500">{subtitle}</div>
          )}
        </div>
        
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          bg-gradient-to-br shadow-lg shadow-colored/20
        `}
        style={{ 
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        }}
        >
          <Icon size={22} className="text-white" />
        </div>
      </div>
      
      {/* Bottom Accent Line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: color }}
      />
    </motion.div>
  );
}