import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ProfileAvatar from '../../components/ProfileAvatar';

export default function RecognitionResult({ result, error }) {
  if (error) {
    return (
      <Card glass className="mt-6 border-red-200 bg-red-50/60 p-5 sm:p-6 animate-scale-in">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-200 bg-white text-red-600 shadow-xs">
            <AlertCircle size={22} />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 tracking-tight">
              Recognition Failed
            </h4>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              {error}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!result) return null;

  const confidencePct = result.confidenceScore
    ? Math.round(result.confidenceScore * 100)
    : null;

  return (
    <div className="mt-6 animate-scale-in">
      <Card glass className="border-emerald-200/90 bg-emerald-50/40 p-6 sm:p-7">
        {/* Header Notification */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-600 shadow-xs">
              <CheckCircle2 size={24} strokeWidth={2.2} />
            </div>

            <div>
              <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                Attendance Successfully Marked
              </h4>
              <p className="text-xs font-medium text-emerald-700">
                Face verified & record synced with institutional ledger
              </p>
            </div>
          </div>

          <Badge status={result.status || 'PRESENT'} />
        </div>

        {/* 4 Detail Cards */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Student */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3.5 shadow-xs">
            <ProfileAvatar name={result.studentName} size="md" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Student Name
              </span>
              <p className="truncate text-xs font-bold text-slate-900">
                {result.studentName || 'Unknown Student'}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3.5 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Check-in Time
              </span>
              <p className="text-xs font-bold text-slate-900 tabular-nums">
                {result.attendanceTime || 'Just now'}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3.5 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recorded Date
              </span>
              <p className="text-xs font-bold text-slate-900">
                {result.attendanceDate || 'Today'}
              </p>
            </div>
          </div>

          {/* Verification Status */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3.5 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Biometric Match
              </span>
              <p className="text-xs font-bold text-indigo-700">
                {confidencePct ? `${confidencePct}% match` : 'Verified'}
              </p>
            </div>
          </div>
        </div>

        {/* Confidence Progress Bar */}
        {confidencePct !== null && (
          <div className="mt-5 rounded-xl border border-emerald-200/80 bg-white/80 p-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Sparkles size={14} className="text-emerald-600" />
                Biometric Confidence Score
              </span>
              <span className="font-bold text-emerald-700 tabular-nums">
                {confidencePct}%
              </span>
            </div>

            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
                style={{ width: `${Math.max(0, Math.min(100, confidencePct))}%` }}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
