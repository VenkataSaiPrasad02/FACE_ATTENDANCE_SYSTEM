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
        flex flex-col items-center justify-center rounded-2xl border border-rose-400/20
        bg-rose-500/[0.06] px-6 py-12 text-center backdrop-blur-sm shadow-card animate-fade-in
        ${className}
      `}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-300/25 bg-gradient-to-br from-rose-500/15 to-red-500/10 text-rose-300 shadow-glow-sm">
        <IconComponent size={24} className="text-rose-300" strokeWidth={1.8} />
      </div>

      <h3 className="font-display text-base font-bold tracking-tight text-white">
        {title}
      </h3>

      {message && (
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-400">
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
