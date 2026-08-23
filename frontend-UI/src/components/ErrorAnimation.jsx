import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './ui/Button';

export default function ErrorAnimation({
  error = 'Face verification was unsuccessful.',
  title = 'Registration Failed',
  onReCapture,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center animate-scale-in max-w-sm mx-auto">
      {/* Error Badge Icon */}
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-rose-300/30 bg-gradient-to-br from-rose-500/20 to-red-500/10 text-rose-300 shadow-[0_0_34px_-8px_rgba(244,63,94,0.5)]">
        <span
          className="absolute inset-0 rounded-3xl border border-rose-400/20 animate-ping"
          aria-hidden="true"
        />
        <AlertCircle size={32} strokeWidth={2} />
      </div>

      <h3 className="font-display text-lg font-bold tracking-tight text-white">
        {title}
      </h3>

      <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-400">
        {error}
      </p>

      {onReCapture && (
        <div className="mt-6">
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={onReCapture}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
