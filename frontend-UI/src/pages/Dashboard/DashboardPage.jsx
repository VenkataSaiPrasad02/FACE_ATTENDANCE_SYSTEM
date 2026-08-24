import React, { useEffect, useState } from 'react';
import AnimatedGradientBackground from '../../components/ui/AnimatedGradientBackground';
import {
  ArrowUpRight,
  Calendar,
  Clock,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
  ScanFace,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroCarousel from '../../components/NavbarCarousel';

import attendanceService from '../../services/attendanceService';
import DashboardSkeleton from './DashboardSkeleton';
import StatsCard from './StatsCard';
import ErrorState from '../../components/ui/ErrorState';
import Card from '../../components/ui/Card';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const loadStats = async () => {
    try {
      setError('');
      const data = await attendanceService.getDashboardStats();
      setStats(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const today = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <AnimatedGradientBackground className="min-h-full rounded-3xl p-4 sm:p-6">
      <div className="w-full pb-6 animate-fade-in lg:pb-8">
        {/* Page Header */}
        <div className="animate-slide-up mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300 shadow-glow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
              Institutional Overview
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Attendance Dashboard
            </h1>

            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              Real-time biometric attendance metrics, records, and rapid actions.
            </p>
          </div>

          {/* Live Date & Time Chip */}
          <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0d1430]/55 px-4 py-2.5 shadow-card backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/25 bg-gradient-to-br from-blue-500/20 to-cyan-400/15 text-cyan-300 shadow-glow-sm">
              <Clock size={17} />
            </div>

            <div>
              <div className="font-display text-xs font-bold text-white tabular-nums">
                {formatTime(currentTime)}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Calendar size={12} className="text-slate-500" />
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="mb-6">
            <ErrorState
              title="Failed to load dashboard statistics"
              message={error}
              onRetry={loadStats}
            />
          </div>
        )}

        {/* Dashboard KPI Grid & Cards */}
        {stats && !error && (
          <>
            {/* 4 KPI Cards with subtle gradient accents */}
            <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-7 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
              {/* Total Students */}
              <div className="animate-slide-up opacity-0" style={{ animationDelay: '60ms' }}>
                <StatsCard
                  title="Total Students"
                  value={stats.totalStudents}
                  icon={Users}
                  colorScheme="blue"
                  subtitle="Enrolled"
                  detail="Active student roster"
                  to="/students"
                />
              </div>

              {/* Present Today */}
              <div className="animate-slide-up opacity-0" style={{ animationDelay: '150ms' }}>
                <StatsCard
                  title="Present Today"
                  value={stats.presentToday}
                  icon={UserCheck}
                  colorScheme="emerald"
                  subtitle="Checked In"
                  detail="Recorded presence"
                  to={`/history?date=${today}&status=PRESENT`}
                />
              </div>

              {/* Absent Today */}
              <div className="animate-slide-up opacity-0" style={{ animationDelay: '240ms' }}>
                <StatsCard
                  title="Absent Today"
                  value={stats.absentToday}
                  icon={UserX}
                  colorScheme="rose"
                  subtitle="Pending"
                  detail="Not yet verified"
                  to={`/history?date=${today}&status=ABSENT`}
                />
              </div>

              {/* Attendance Rate */}
              <div className="animate-slide-up opacity-0" style={{ animationDelay: '330ms' }}>
                <StatsCard
                  title="Attendance Rate"
                  value={`${stats.attendancePercentage}%`}
                  icon={TrendingUp}
                  colorScheme="amber"
                  subtitle="Today"
                  detail="Daily attendance ratio"
                  to={`/history?date=${today}`}
                />
              </div>
            </div>

            {/* 2-Column Split: Today's Summary & Quick Actions */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Summary Breakdown Card */}
              <div className="animate-slide-up opacity-0" style={{ animationDelay: '420ms' }}>
                <Card glass className="p-4 sm:p-6">
                  <div className="mb-4 flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3.5 sm:mb-5 sm:pb-4">
                    <div>
                      <h3 className="font-display text-base font-bold tracking-tight text-white">
                        Today&apos;s Attendance Breakdown
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Comprehensive overview of verified check-ins and absences.
                      </p>
                    </div>

                    <div className="rounded-xl border border-cyan-300/25 bg-gradient-to-br from-blue-500/15 to-cyan-400/10 px-3 py-1.5 text-right shadow-glow-sm">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Rate</div>
                      <div className="font-display text-base font-bold text-white tabular-nums">
                        {Math.round(stats.attendancePercentage)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <StatRow
                      label="Total Check-Ins Processed"
                      value={stats.presentToday + stats.absentToday}
                      total={stats.totalStudents}
                      color="indigo"
                    />

                    <StatRow
                      label="Verified Present"
                      value={stats.presentToday}
                      color="emerald"
                      percentage={stats.attendancePercentage}
                    />

                    <StatRow
                      label="Unrecorded / Absent"
                      value={stats.absentToday}
                      color="rose"
                      percentage={100 - stats.attendancePercentage}
                    />
                  </div>
                </Card>
              </div>

              {/* Quick Actions Panel */}
              <div className="animate-slide-up opacity-0" style={{ animationDelay: '500ms' }}>
                <Card glass className="relative overflow-hidden p-4 sm:p-6">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-400/10 blur-2xl" />

                  <div className="relative mb-4 border-b border-white/[0.08] pb-3.5 sm:mb-5 sm:pb-4">
                    <h3 className="font-display text-base font-bold tracking-tight text-white">
                      Quick Actions
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Direct shortcuts to high-frequency attendance workflows.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <QuickActionRow
                      title="Take Attendance"
                      description="Start live camera facial recognition check-in terminal"
                      href="/attendance"
                      icon={ScanFace}
                      badge="Live"
                      badgeColor="bg-emerald-400/10 text-emerald-300 border-emerald-300/25"
                    />

                    <QuickActionRow
                      title="Register Face"
                      description="Enroll student facial biometrics and profile landmarks"
                      href="/face-registration"
                      icon={Users}
                      badge="Biometrics"
                      badgeColor="bg-sky-400/10 text-sky-300 border-sky-300/25"
                    />

                    <QuickActionRow
                      title="View Attendance History"
                      description="Search, filter, and inspect institutional attendance records"
                      href="/history"
                      icon={FileText}
                      badge="Logs"
                      badgeColor="bg-violet-400/10 text-violet-300 border-violet-300/25"
                    />
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </AnimatedGradientBackground>
  );
}

function StatRow({ label, value, total, color = 'indigo', percentage }) {
  const colorMap = {
    indigo: {
      bar: 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.45)]',
      pill: 'text-sky-300 bg-sky-400/10 border-sky-300/25',
    },
    emerald: {
      bar: 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.45)]',
      pill: 'text-emerald-300 bg-emerald-400/10 border-emerald-300/25',
    },
    rose: {
      bar: 'bg-gradient-to-r from-rose-500 to-red-500 shadow-[0_0_10px_rgba(244,63,94,0.45)]',
      pill: 'text-rose-300 bg-rose-500/10 border-rose-300/25',
    },
  }[color] || {
    bar: 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.45)]',
    pill: 'text-sky-300 bg-sky-400/10 border-sky-300/25',
  };

  const computedPercentage = percentage ?? (total ? (value / total) * 100 : 0);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5 transition-colors duration-200 hover:bg-white/[0.06]">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold text-slate-300">{label}</span>

        <div className="flex items-center gap-2">
          {total && <span className="text-[11px] text-slate-500">of {total} total</span>}
          <span className={`rounded-lg border px-2 py-0.5 text-xs font-bold tabular-nums ${colorMap.pill}`}>
            {value}
            {percentage !== undefined && ` (${Math.round(percentage)}%)`}
          </span>
        </div>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorMap.bar}`}
          style={{ width: `${Math.max(0, Math.min(100, computedPercentage))}%` }}
        />
      </div>
    </div>
  );
}

function QuickActionRow({ title, description, href, icon: Icon, badge, badgeColor }) {
  return (
    <Link
      to={href}
      className="group flex items-center gap-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5 shadow-card backdrop-blur-sm transition-all duration-200 ease-out hover:border-cyan-300/25 hover:bg-white/[0.07] hover:shadow-card-hover"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-gradient-to-br from-blue-500/20 to-cyan-400/15 text-cyan-300 shadow-glow-sm transition-transform duration-200 group-hover:scale-105">
        <Icon size={19} strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-100 transition-colors group-hover:text-cyan-300">
            {title}
          </span>
          {badge && (
            <span className={`rounded-md border px-1.5 py-0.5 text-[9.5px] font-semibold ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="truncate text-[11px] text-slate-500">{description}</p>
      </div>

      <ArrowUpRight
        size={16}
        className="shrink-0 text-slate-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-300"
      />
    </Link>
  );
}
