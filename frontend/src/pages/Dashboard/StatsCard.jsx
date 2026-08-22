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
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    topBar: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    ambient: 'bg-indigo-500/10',
    badge: 'bg-blue-50 text-blue-700 border-blue-100',
    link: 'text-indigo-600 group-hover:text-indigo-700',
  },
  emerald: {
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    topBar: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    ambient: 'bg-emerald-500/10',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    link: 'text-emerald-600 group-hover:text-emerald-700',
  },
  rose: {
    iconBg: 'bg-gradient-to-br from-rose-500 to-red-600',
    topBar: 'bg-gradient-to-r from-rose-500 to-red-600',
    ambient: 'bg-rose-500/10',
    badge: 'bg-rose-50 text-rose-700 border-rose-100',
    link: 'text-rose-600 group-hover:text-rose-700',
  },
  amber: {
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    topBar: 'bg-gradient-to-r from-amber-500 to-orange-600',
    ambient: 'bg-amber-500/10',
    badge: 'bg-amber-50 text-amber-700 border-amber-100',
    link: 'text-amber-600 group-hover:text-amber-700',
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
        border border-slate-200/80 bg-white/85 p-5 backdrop-blur-md shadow-xs
        transition-all duration-200 ease-out hover:border-slate-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5
        ${className}
      `}
    >
      {/* Top Gradient Hairline Accent */}
      <div className={`absolute inset-x-0 top-0 h-1 ${theme.topBar}`} />

      {/* Ambient background glow */}
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl ${theme.ambient}`}
      />

      {/* Header with Icon and Subtitle/Badge */}
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs ${theme.iconBg}`}
        >
          <Icon size={20} strokeWidth={2} />
        </div>

        {subtitle && (
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold tracking-tight ${theme.badge}`}
          >
            {subtitle}
          </span>
        )}
      </div>

      {/* Value and Title */}
      <div className="my-2">
        <div className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
          {value ?? '-'}
        </div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </div>
      </div>

      {/* Footer metadata or navigation link */}
      <div className="mt-auto flex items-center justify-between border-t border-slate-100/90 pt-3 text-[11px] font-medium text-slate-400">
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
    <Link to={to} className="block outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-2xl">
      {cardBody}
    </Link>
  ) : (
    cardBody
  );
}