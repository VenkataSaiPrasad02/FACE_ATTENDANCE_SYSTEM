import React from 'react';
import {
  Edit3,
  Power,
  PowerOff,
  Trash2,
  CalendarDays,
  BookOpen,
  Layers3,
  GraduationCap,
  Clock3,
} from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AcademicPeriodTable({
  periods = [],
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}) {
  if (!periods || periods.length === 0) {
    return (
      <EmptyState
        title="No academic periods scheduled"
        description="Schedule an academic period to define active semesters and course intervals."
      />
    );
  }

  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1128]/70 shadow-card backdrop-blur-md">
      {/* Table Header Strip */}
      <div className="border-b border-white/[0.08] bg-white/[0.04] px-5 py-3.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xs font-bold text-white sm:text-sm">
              Scheduled Academic Periods
            </h3>
            <p className="text-[11px] text-slate-500">
              Manage academic programs, batch years, semesters, and active states.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-bold text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
            {periods.length} {periods.length === 1 ? 'Period' : 'Periods'}
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.04] text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
              <th className="w-12 px-5 py-3.5">#</th>
              <th className="px-5 py-3.5">Course Program</th>
              <th className="px-5 py-3.5">Batch Interval</th>
              <th className="px-5 py-3.5">Semester</th>
              <th className="px-5 py-3.5">Start Date</th>
              <th className="px-5 py-3.5">End Date</th>
              <th className="px-5 py-3.5">Operational Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {periods.map((period, index) => (
              <tr
                key={period.id}
                className="transition-colors hover:bg-white/[0.03]"
              >
                {/* Number */}
                <td className="px-5 py-4 font-bold text-slate-500">
                  {index + 1}
                </td>

                {/* Course */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-gradient-to-br from-blue-500/20 to-cyan-400/15 text-cyan-300 shadow-glow-sm">
                      <BookOpen size={17} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white sm:text-sm">
                        {period.course || '—'}
                      </p>
                      <p className="text-[10.5px] font-medium text-slate-500">
                        Academic Program
                      </p>
                    </div>
                  </div>
                </td>

                {/* Batch */}
                <td className="px-5 py-4">
                  <span className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-300">
                    {period.batch || '—'}
                  </span>
                </td>

                {/* Semester */}
                <td className="px-5 py-4 font-semibold text-slate-300">
                  {period.semester || '—'}
                </td>

                {/* Start Date */}
                <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-400">
                  {formatDate(period.startDate)}
                </td>

                {/* End Date */}
                <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-400">
                  {formatDate(period.endDate)}
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  {period.active ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                      Inactive
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => onEdit?.(period)}
                      className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-cyan-400/10 hover:text-cyan-300"
                      title="Edit academic period"
                    >
                      <Edit3 size={15} />
                    </button>

                    {/* Activate */}
                    {!period.active && (
                      <button
                        type="button"
                        onClick={() => onActivate?.(period)}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-emerald-400/10 hover:text-emerald-300"
                        title="Activate academic period"
                      >
                        <Power size={15} />
                      </button>
                    )}

                    {/* Deactivate */}
                    {period.active && (
                      <button
                        type="button"
                        onClick={() => onDeactivate?.(period)}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-amber-400/10 hover:text-amber-300"
                        title="Deactivate academic period"
                      >
                        <PowerOff size={15} />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onDelete?.(period)}
                      className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                      title="Delete academic period"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
