import React from 'react';
import { Check, CheckCircle2, RotateCcw } from 'lucide-react';
import Button from './ui/Button';

export default function SuccessAnimation({
  studentName,
  title = 'Face Registered Successfully',
  description,
  onDone,
  onReCapture,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center animate-scale-in max-w-sm mx-auto">
      {/* Success Badge Icon */}
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-300/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-300 shadow-[0_0_34px_-8px_rgba(52,211,153,0.55)]">
        <span
          className="absolute inset-0 rounded-3xl border border-emerald-400/25 animate-ping"
          aria-hidden="true"
        />
        <Check size={32} strokeWidth={2.5} />
      </div>

      <h3 className="font-display text-lg font-bold tracking-tight text-white">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-400">
        {description || (
          <>
            Enrolled for: <span className="font-semibold text-slate-200">{studentName || 'Student'}</span>
          </>
        )}
      </p>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        {onReCapture && (
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={onReCapture}
          >
            Register Another
          </Button>
        )}

        {onDone && (
          <Button
            variant="primary"
            size="sm"
            icon={CheckCircle2}
            onClick={onDone}
          >
            Done
          </Button>
        )}
      </div>
    </div>
  );
}