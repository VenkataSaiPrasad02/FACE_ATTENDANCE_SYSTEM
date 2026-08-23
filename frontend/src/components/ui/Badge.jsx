import React from 'react';

const statusConfig = {
  PRESENT: {
    bg: 'bg-emerald-400/10 text-emerald-300 border-emerald-300/25',
    dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]',
    label: 'Present',
  },
  ABSENT: {
    bg: 'bg-rose-400/10 text-rose-300 border-rose-300/25',
    dot: 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.9)]',
    label: 'Absent',
  },
  REGISTERED: {
    bg: 'bg-blue-400/10 text-blue-300 border-blue-300/25',
    dot: 'bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.9)]',
    label: 'Registered',
  },
  UNKNOWN: {
    bg: 'bg-amber-400/10 text-amber-300 border-amber-300/25',
    dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]',
    label: 'Unknown',
  },
  ACTIVE: {
    bg: 'bg-emerald-400/10 text-emerald-300 border-emerald-300/25',
    dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]',
    label: 'Active',
  },
  INACTIVE: {
    bg: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
    dot: 'bg-slate-500',
    label: 'Inactive',
  },
  ADMIN: {
    bg: 'bg-indigo-400/10 text-indigo-300 border-indigo-300/25',
    dot: 'bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.9)]',
    label: 'Admin',
  },
  SUPER_ADMIN: {
    bg: 'bg-violet-400/10 text-violet-200 border-violet-300/30',
    dot: 'bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.9)]',
    label: 'Super Admin',
  },
  TEACHER: {
    bg: 'bg-sky-400/10 text-sky-300 border-sky-300/25',
    dot: 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]',
    label: 'Teacher',
  },
  STUDENT: {
    bg: 'bg-teal-400/10 text-teal-300 border-teal-300/25',
    dot: 'bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.9)]',
    label: 'Student',
  },
};

export default function Badge({
  status,
  variant,
  label,
  showDot = true,
  className = '',
}) {
  const normalizedKey = (variant || status || 'PRESENT').toString().toUpperCase();
  const config = statusConfig[normalizedKey] || {
    bg: 'bg-white/[0.06] text-slate-300 border-white/[0.12]',
    dot: 'bg-slate-400',
    label: label || status || 'Default',
  };

  const displayLabel = label || config.label || status;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5
        text-xs font-semibold tracking-tight
        ${config.bg}
        ${className}
      `}
    >
      {showDot && (
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      )}
      <span>{displayLabel}</span>
    </span>
  );
}
