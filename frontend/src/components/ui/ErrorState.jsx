import React from 'react';
import { AlertCircle, WifiOff, ServerCrash, AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

const iconMap = {
  AlertCircle,
  WifiOff,
  ServerCrash,
  AlertTriangle,
  default: AlertCircle,
};

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  icon: Icon = 'default',
  className = '',
}) {
  const IconComponent = typeof Icon === 'string' ? (iconMap[Icon] || iconMap.default) : Icon;

  return (
    <div
      className={`
        flex flex-col items-center justify-center rounded-2xl border border-rose-200/70
        bg-rose-50/40 px-6 py-14 text-center backdrop-blur-md shadow-xs
        ${className}
      `}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-red-100 text-rose-600 shadow-xs">
        <IconComponent size={24} strokeWidth={1.75} />
      </div>

      <h3 className="text-base font-bold text-slate-900 tracking-tight">
        {title}
      </h3>

      {message && (
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">
          {message}
        </p>
      )}

      {onRetry && (
        <div className="mt-5">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={onRetry}
            className="font-semibold"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}