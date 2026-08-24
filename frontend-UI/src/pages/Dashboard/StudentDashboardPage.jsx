import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Percent,
  CalendarCheck2,
  CalendarX2,
  ArrowRight,
  RefreshCw,
  GraduationCap,
  ScanFace,
  Clock3,
} from 'lucide-react';

import AnimatedGradientBackground from '../../components/ui/AnimatedGradientBackground';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import studentPortalService from '../../services/studentPortalService';

/*
 * Mobile-first personal dashboard for students: live session banner,
 * personal attendance summary for the active period, and recent marks.
 */
export default function StudentDashboardPage() {
  const { username } = useAuth();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [summary, setSummary] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [recent, setRecent] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = async ({ silent } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const [meRes, summaryRes, sessionRes, attendanceRes] = await Promise.allSettled([
        studentPortalService.getMe(),
        studentPortalService.getMySummary(),
        studentPortalService.getMySession(),
        studentPortalService.getMyAttendance({ page: 0, size: 5 }),
      ]);

      if (meRes.status === 'fulfilled') setMe(meRes.value.data);
      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data);
      if (sessionRes.status === 'fulfilled') setSessionInfo(sessionRes.value.data);
      if (attendanceRes.status === 'fulfilled')
        setRecent(attendanceRes.value.data?.content || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sessionOpen = Boolean(sessionInfo?.available && sessionInfo?.session);
  const percentage = summary?.percentage ?? me?.attendancePercentage ?? null;
  const absentDays = Math.max(
    0,
    Number(summary?.totalWorkingDays ?? 0) - Number(summary?.presentDays ?? 0)
  );

  return (
    <AnimatedGradientBackground type="dashboard" className="min-h-full rounded-2xl">
      <div className="mx-auto w-full max-w-3xl animate-fade-in pb-10">
        {/* Greeting */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-gradient-to-br from-blue-500/20 to-cyan-400/15 text-cyan-300 shadow-glow-sm">
            <GraduationCap size={24} strokeWidth={2.1} />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
              Hi, {me?.fullName || username || 'Student'} 👋
            </h1>
            <p className="mt-0.5 truncate text-xs text-slate-400 sm:text-sm">
              {me
                ? `${me.course}${me.batch ? ` · ${me.batch}` : ''}${
                    me.year ? ` · ${me.year}` : ''
                  }`
                : 'Your personal attendance hub'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadAll({ silent: true })}
            aria-label="Refresh dashboard"
            className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* ==================== LIVE SESSION BANNER ==================== */}
        {sessionOpen ? (
          <Card glass className="animate-slide-up overflow-hidden p-0 ring-1 ring-emerald-300/25">
            <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="relative mt-1 flex h-3 w-3 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                  </span>
                  <div>
                    <p className="font-display text-base font-bold tracking-tight text-white">
                      Attendance is open right now!
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-300">
                      {sessionInfo.session.periodName ||
                        `${sessionInfo.session.course} · ${sessionInfo.session.batch} · Semester ${sessionInfo.session.semester}`}
                      {' — '}mark your presence before it closes.
                    </p>
                  </div>
                </div>

                <Link to="/take-attendance" className="shrink-0">
                  <Button variant="success" size="lg" icon={Smartphone} className="w-full sm:w-auto">
                    Take Attendance
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <Card glass className="animate-slide-up p-5">
            <div className="flex items-start gap-3">
              <Clock3 size={18} className="mt-0.5 shrink-0 text-slate-400" />
              <div>
                <p className="text-sm font-bold tracking-tight text-white">
                  No live session right now
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                  When your teacher opens attendance, a bright banner will appear here and
                  you can mark yourself present from your phone.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ==================== SUMMARY CARDS ==================== */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={Percent}
            accent="cyan"
            label="Overall Attendance"
            value={percentage != null ? `${Number(percentage).toFixed(1)}%` : '—'}
            loading={loading}
          />
          <StatCard
            icon={CalendarCheck2}
            accent="emerald"
            label="Present Days"
            value={summary?.presentDays != null ? String(summary.presentDays) : '—'}
            sub={summary?.totalWorkingDays != null ? `of ${summary.totalWorkingDays} working days` : undefined}
            loading={loading}
          />
          <StatCard
            icon={CalendarX2}
            accent="rose"
            label="Missed Days"
            value={summary?.totalWorkingDays != null ? String(absentDays) : '—'}
            sub="this academic period"
            loading={loading}
          />
        </div>

        {/* ==================== FACE REGISTRATION NUDGE ==================== */}
        {me && me.faceRegistered === false && (
          <Card glass className="animate-slide-up mt-5 border-amber-300/20 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <ScanFace size={20} className="mt-0.5 shrink-0 text-amber-300" />
                <div>
                  <p className="text-sm font-bold tracking-tight text-white">
                    Your face isn’t registered yet
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                    Ask your teacher or admin to register your face so the system can verify
                    it’s really you during attendance.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ==================== RECENT ATTENDANCE ==================== */}
        <Card
          glass
          className="animate-slide-up mt-5 p-5 opacity-0 sm:p-6"
          style={{ animationDelay: '90ms' }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-sm font-bold tracking-tight text-white">
              Recent Attendance
            </h2>

            <Link
              to="/my-attendance"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-cyan-300 transition-colors hover:bg-cyan-400/10 hover:text-cyan-200"
            >
              View all
              <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2.5">
              <div className="h-11 w-full rounded-xl skeleton-block" />
              <div className="h-11 w-full rounded-xl skeleton-block opacity-80" />
              <div className="h-11 w-full rounded-xl skeleton-block opacity-60" />
            </div>
          ) : recent.length === 0 ? (
            <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-center text-xs text-slate-500">
              No attendance records yet. Your first mark will appear here.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {recent.map((record) => (
                <li
                  key={record.id}
                  className="
                    flex items-center justify-between gap-3 rounded-xl border
                    border-white/[0.07] bg-white/[0.02] px-4 py-3 backdrop-blur-md
                  "
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold tracking-tight text-white">
                      {formatDate(record.attendanceDate)}
                    </p>
                    <p className="mt-0.5 text-[11px] capitalize text-slate-500">
                      {record.attendanceMethod === 'MANUAL' ? 'Marked by teacher' : 'Face verified'}
                      {record.attendanceTime ? ` • ${String(record.attendanceTime).slice(0, 5)}` : ''}
                    </p>
                  </div>

                  {String(record.status).toUpperCase() === 'PRESENT' ? (
                    <Badge status="PRESENT" showDot={false} />
                  ) : (
                    <Badge status="ABSENT" showDot={false} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AnimatedGradientBackground>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

const ACCENTS = {
  cyan: 'border-cyan-300/25 bg-cyan-400/10 text-cyan-300',
  emerald: 'border-emerald-300/25 bg-emerald-400/10 text-emerald-300',
  rose: 'border-rose-300/25 bg-rose-400/10 text-rose-300',
};

function StatCard({ icon: Icon, accent, label, value, sub, loading }) {
  return (
    <Card glass className={`animate-slide-up p-4 sm:p-5 ${loading ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${ACCENTS[accent]}`}
        >
          <Icon size={18} strokeWidth={2.1} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="font-display text-lg font-bold tracking-tight text-white">
            {value}
          </p>
        </div>
      </div>
      {sub && <p className="mt-2 text-[11px] text-slate-500">{sub}</p>}
    </Card>
  );
}

function formatDate(value) {
  if (!value) return '—';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(value);
  }
}
