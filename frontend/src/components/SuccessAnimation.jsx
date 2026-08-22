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
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-200/90 bg-emerald-50 text-emerald-600 shadow-sm">
        <Check size={32} strokeWidth={2.5} />
      </div>

      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        {description || (
          <>
            Enrolled for: <span className="font-semibold text-slate-800">{studentName || 'Student'}</span>
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