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
        flex flex-col items-center justify-center rounded-2xl border border-slate-200/80
        bg-white/70 px-6 py-14 text-center backdrop-blur-md shadow-xs
        ${className}
      `}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-500 shadow-xs">
        <IconComponent size={24} strokeWidth={1.75} />
      </div>

      <h3 className="text-base font-bold text-slate-900 tracking-tight">
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
