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
      <div className="mt-6 animate-scale-in rounded-2xl border border-rose-300/25 bg-rose-500/[0.06] p-5 shadow-card backdrop-blur-md sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-300/25 bg-rose-500/10 text-rose-300 shadow-[0_0_14px_rgba(244,63,94,0.35)]">
            <AlertCircle size={22} />
          </div>
          <div>
            <h4 className="font-display text-base font-bold tracking-tight text-white">
              Recognition Failed
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const confidencePct = result.confidenceScore
    ? Math.round(result.confidenceScore * 100)
    : null;

  const confidenceLevel =
    confidencePct >= 80
      ? 'confidence-high'
      : confidencePct >= 55
        ? 'confidence-medium'
        : 'confidence-low';

  return (
    <div className="mt-6 animate-scale-in">
      <div className="overflow-hidden rounded-2xl border border-emerald-300/25 bg-gradient-to-br from-emerald-500/[0.09] via-[#0d1430]/70 to-[#0b1128]/85 p-6 shadow-[0_0_46px_-14px_rgba(52,211,153,0.45)] backdrop-blur-md sm:p-7">
        {/* Header Notification */}
        <div className="mb-5 flex flex-col gap-3 border-b border-emerald-300/15 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-400/10 text-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.35)]">
              <CheckCircle2 size={24} strokeWidth={2.2} />
            </div>

            <div>
              <h4 className="font-display text-base font-extrabold tracking-tight text-white">
                Attendance Successfully Marked
              </h4>
              <p className="text-xs font-medium text-emerald-300/90">
                Face verified &amp; record synced with institutional ledger
              </p>
            </div>
          </div>

          <Badge status={result.status || 'PRESENT'} />
        </div>

        {/* 4 Detail Cards */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Student */}
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5">
            <ProfileAvatar name={result.studentName} size="md" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Student Name
              </span>
              <p className="truncate font-display text-sm font-bold text-white">
                {result.studentName || 'Unknown Student'}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300">
              <Clock size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Check-in Time
              </span>
              <p className="text-xs font-bold text-slate-300 tabular-nums">
                {result.attendanceTime || 'Just now'}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-400/10 text-violet-300">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Recorded Date
              </span>
              <p className="text-xs font-bold text-slate-300">
                {result.attendanceDate || 'Today'}
              </p>
            </div>
          </div>

          {/* Verification Status */}
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-400/10 text-indigo-300">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Biometric Match
              </span>
              <p className="text-xs font-bold text-indigo-300">
                {confidencePct ? `${confidencePct}% match` : 'Verified'}
              </p>
            </div>
          </div>
        </div>

        {/* Confidence Progress Bar */}
        {confidencePct !== null && (
          <div className="mt-5 rounded-xl border border-emerald-300/20 bg-white/[0.03] p-3.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Sparkles size={14} className="text-emerald-300" />
                Biometric Confidence Score
              </span>
              <span className="font-display font-bold text-emerald-300 tabular-nums">
                {confidencePct}%
              </span>
            </div>

            <div className={`confidence-bar mt-2 ${confidenceLevel}`}>
              <div
                className="confidence-fill"
                style={{ width: `${Math.max(0, Math.min(100, confidencePct))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
