import React from 'react';
import { Loader2, ScanLine, Sparkles } from 'lucide-react';

export default function ProcessingAnimation({ message = 'Analyzing face biometrics...' }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/75 p-6 backdrop-blur-md animate-fade-in text-white text-center">
      {/* Outer Pulse Ring */}
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-3xl bg-indigo-500/20 animate-ping" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/40 bg-indigo-600/30 backdrop-blur-xl shadow-lg shadow-indigo-500/30">
          <Loader2 size={32} className="animate-spin text-indigo-300" />
        </div>
      </div>

      {/* Main Message */}
      <h4 className="text-base font-bold tracking-tight text-white sm:text-lg">
        {message}
      </h4>

      <p className="mt-1 text-xs text-indigo-200/80">
        Comparing facial landmarks with institutional database
      </p>

      {/* Progress Steps */}
      <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs text-slate-300 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Detecting facial contour & alignment</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span>Extracting 128-d embedding vector</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          <span>Verifying student authorization</span>
        </div>
      </div>
    </div>
  );
}