import React from 'react';
import {
  Inbox,
  Users,
  FileText,
  Search,
  GraduationCap,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import Button from './Button';

const iconMap = {
  Inbox,
  Users,
  FileText,
  Search,
  GraduationCap,
  Calendar,
  ShieldAlert,
  default: Inbox,
};

export default function EmptyState({
  icon: Icon = 'default',
  title = 'No records found',
  description = 'There is currently no data available to display.',
  action,
  className = '',
}) {
  const IconComponent = typeof Icon === 'string' ? (iconMap[Icon] || iconMap.default) : Icon;

  return (
    <div
      className={`
        flex flex-col items-center justify-center rounded-2xl border border-white/[0.08]
        bg-[#0b1128]/50 px-6 py-14 text-center backdrop-blur-md shadow-card
        ${className}
      `}
    >
      <div className="float-gentle mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-blue-500/15 to-cyan-400/10 text-cyan-300 shadow-glow-sm">
        <IconComponent size={24} strokeWidth={1.75} />
      </div>

      <h3 className="font-display text-base font-bold tracking-tight text-white">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-5">
          {typeof action === 'function' ? (
            action()
          ) : React.isValidElement(action) ? (
            action
          ) : (
            <Button
              variant="secondary"
              size="sm"
              {...action}
            />
          )}
        </div>
      )}
    </div>
  );
}
