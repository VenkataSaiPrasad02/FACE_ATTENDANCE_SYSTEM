import React from 'react';
import { Users, CheckCircle, XCircle, Percent, UserPlus, UserMinus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const iconMap = {
  'Total Students': Users,
  'Present Today': CheckCircle,
  'Absent Today': XCircle,
  'Attendance Rate': Percent,
  'Attendance %': Percent,
  'Students Added': UserPlus,
  'Students Removed': UserMinus,
};

const gradientStyles = {
  blue: {
    tile: 'bg-gradient-to-br from-blue-500/25 to-cyan-400/15 border border-cyan-300/30 text-cyan-300',
    tileGlow: 'shadow-glow-sm',
    topBar: 'bg-gradient-to-r from-blue-500 via-cyan-400 to-transparent',
    ambient: 'bg-blue-500/20',
    badge: 'bg-sky-400/10 text-sky-300 border-sky-300/25',
    link: 'text-cyan-300 group-hover:text-cyan-200',
  },
  emerald: {
    tile: 'bg-gradient-to-br from-emerald-400/20 to-teal-400/10 border border-emerald-300/25 text-emerald-300',
    tileGlow: 'shadow-[0_0_14px_rgba(52,211,153,0.30)]',
    topBar: 'bg-gradient-to-r from-emerald-400 via-teal-400 to-transparent',
    ambient: 'bg-emerald-500/20',
    badge: 'bg-emerald-400/10 text-emerald-300 border-emerald-300/25',
    link: 'text-emerald-300 group-hover:text-emerald-200',
  },
  rose: {
    tile: 'bg-gradient-to-br from-rose-500/25 to-red-500/15 border border-rose-300/25 text-rose-300',
    tileGlow: 'shadow-[0_0_14px_rgba(244,63,94,0.30)]',
    topBar: 'bg-gradient-to-r from-rose-500 via-red-500 to-transparent',
    ambient: 'bg-rose-500/20',
    badge: 'bg-rose-500/10 text-rose-300 border-rose-300/25',
    link: 'text-rose-300 group-hover:text-rose-200',
  },
  amber: {
    tile: 'bg-gradient-to-br from-amber-400/20 to-orange-400/10 border border-amber-300/25 text-amber-300',
    tileGlow: 'shadow-[0_0_14px_rgba(251,191,36,0.30)]',
    topBar: 'bg-gradient-to-r from-amber-400 via-orange-400 to-transparent',
    ambient: 'bg-amber-500/20',
    badge: 'bg-amber-400/10 text-amber-300 border-amber-300/25',
    link: 'text-amber-300 group-hover:text-amber-200',
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  detail,
  colorScheme = 'blue',
  icon: IconProp,
  to,
  className = '',
}) {
  const Icon = IconProp || iconMap[title] || Users;
  const theme = gradientStyles[colorScheme] || gradientStyles.blue;

  const cardBody = (
    <div
      className={`
        group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-2xl
        border border-white/[0.08] bg-[#0d1430]/55 p-5 shadow-card backdrop-blur-md
        transition-all duration-200 ease-out hover:border-cyan-300/25 hover:shadow-card-hover hover:-translate-y-0.5
        ${className}
      `}
    >
      {/* Top Gradient Hairline Accent */}
      <div className={`absolute inset-x-0 top-0 h-[2px] opacity-70 ${theme.topBar}`} />

      {/* Ambient background glow */}
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl ${theme.ambient}`}
      />

      {/* Header with Icon and Subtitle/Badge */}
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.tile} ${theme.tileGlow}`}
        >
          <Icon size={20} strokeWidth={2} />
        </div>

        {subtitle && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold tracking-tight ${theme.badge}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
            {subtitle}
          </span>
        )}
      </div>

      {/* Value and Title */}
      <div className="my-2">
        <div className="font-display text-3xl font-bold tracking-tight text-white tabular-nums">
          {value ?? '-'}
        </div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </div>
      </div>

      {/* Footer metadata or navigation link */}
      <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] font-medium text-slate-500">
        <span>{detail || 'Recorded today'}</span>

        {to && (
          <span className={`inline-flex items-center gap-1 font-semibold transition-colors ${theme.link}`}>
            View details
            <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        )}
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]">
      {cardBody}
    </Link>
  ) : (
    cardBody
  );
}
