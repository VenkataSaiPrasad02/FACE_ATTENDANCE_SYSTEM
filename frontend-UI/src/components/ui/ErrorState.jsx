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
        flex flex-col items-center justify-center rounded-2xl border border-rose-400/20
        bg-rose-500/[0.05] px-6 py-14 text-center backdrop-blur-md shadow-card
        ${className}
      `}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-300/25 bg-gradient-to-br from-rose-500/15 to-red-500/10 text-rose-300 shadow-[0_0_24px_-6px_rgba(244,63,94,0.45)]">
        <IconComponent size={24} strokeWidth={1.75} />
      </div>

      <h3 className="font-display text-base font-bold tracking-tight text-white">
        {title}
      </h3>

      {message && (
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-400">
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
