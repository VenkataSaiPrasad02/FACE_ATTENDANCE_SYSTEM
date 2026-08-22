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
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-xs backdrop-blur-md animate-fade-in">
      {/* Table Header Strip */}
      <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Scheduled Academic Periods
            </h3>
            <p className="text-[11px] text-slate-500">
              Manage academic programs, batch years, semesters, and active states.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-600 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            {periods.length} {periods.length === 1 ? 'Period' : 'Periods'}
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
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
          <tbody className="divide-y divide-slate-100/90">
            {periods.map((period, index) => (
              <tr
                key={period.id}
                className="transition-colors hover:bg-indigo-50/30"
              >
                {/* Number */}
                <td className="px-5 py-4 font-bold text-slate-400">
                  {index + 1}
                </td>

                {/* Course */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <BookOpen size={17} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">
                        {period.course || '—'}
                      </p>
                      <p className="text-[10.5px] font-medium text-slate-400">
                        Academic Program
                      </p>
                    </div>
                  </div>
                </td>

                {/* Batch */}
                <td className="px-5 py-4">
                  <span className="rounded-lg border border-slate-200 bg-slate-100/80 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700">
                    {period.batch || '—'}
                  </span>
                </td>

                {/* Semester */}
                <td className="px-5 py-4 font-semibold text-slate-700">
                  {period.semester || '—'}
                </td>

                {/* Start Date */}
                <td className="px-5 py-4 font-medium text-slate-600 whitespace-nowrap">
                  {formatDate(period.startDate)}
                </td>

                {/* End Date */}
                <td className="px-5 py-4 font-medium text-slate-600 whitespace-nowrap">
                  {formatDate(period.endDate)}
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  {period.active ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
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
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      title="Edit academic period"
                    >
                      <Edit3 size={15} />
                    </button>

                    {/* Activate */}
                    {!period.active && (
                      <button
                        type="button"
                        onClick={() => onActivate?.(period)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
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
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                        title="Deactivate academic period"
                      >
                        <PowerOff size={15} />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onDelete?.(period)}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
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