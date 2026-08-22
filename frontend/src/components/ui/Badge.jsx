import React from 'react';

const statusConfig = {
  PRESENT: {
    bg: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
    label: 'Present',
  },
  ABSENT: {
    bg: 'bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border-rose-200/80',
    dot: 'bg-rose-500',
    label: 'Absent',
  },
  REGISTERED: {
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200/80',
    dot: 'bg-blue-500',
    label: 'Registered',
  },
  UNKNOWN: {
    bg: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200/80',
    dot: 'bg-amber-500',
    label: 'Unknown',
  },
  ACTIVE: {
    bg: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
    label: 'Active',
  },
  INACTIVE: {
    bg: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    label: 'Inactive',
  },
  ADMIN: {
    bg: 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border-indigo-200/80',
    dot: 'bg-indigo-500',
    label: 'Admin',
  },
  SUPER_ADMIN: {
    bg: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border-amber-200/80',
    dot: 'bg-amber-500',
    label: 'Super Admin',
  },
  TEACHER: {
    bg: 'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 border-sky-200/80',
    dot: 'bg-sky-500',
    label: 'Teacher',
  },
  STUDENT: {
    bg: 'bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 border-teal-200/80',
    dot: 'bg-teal-500',
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
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    label: label || status || 'Default',
  };

  const displayLabel = label || config.label || status;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5
        text-xs font-semibold tracking-tight shadow-xs
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
