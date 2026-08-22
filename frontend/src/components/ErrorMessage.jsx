import React from 'react';
import { AlertCircle, WifiOff, ServerCrash, AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './ui/Button';

const iconMap = {
  AlertCircle,
  WifiOff,
  ServerCrash,
  AlertTriangle,
  default: AlertCircle,
};

export default function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  icon: Icon = 'default',
  className = '',
}) {
  const IconComponent = typeof Icon === 'string' ? (iconMap[Icon] || iconMap.default) : Icon;

  return (
    <div
      className={`
        flex flex-col items-center justify-center rounded-2xl border border-red-200/70
        bg-red-50/40 px-6 py-12 text-center backdrop-blur-sm shadow-xs animate-fade-in
        ${className}
      `}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200 bg-white shadow-xs">
        <IconComponent size={24} className="text-red-500" strokeWidth={1.8} />
      </div>

      <h3 className="text-base font-bold text-slate-900 tracking-tight">
        {title}
      </h3>

      {message && (
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
          {message}
        </p>
      )}

      {onRetry && (
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={onRetry}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
