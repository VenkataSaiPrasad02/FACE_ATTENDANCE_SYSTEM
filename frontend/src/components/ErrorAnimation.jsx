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
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-red-200/90 bg-red-50 text-red-600 shadow-sm">
        <AlertCircle size={32} strokeWidth={2} />
      </div>

      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-relaxed text-slate-500 max-w-xs">
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