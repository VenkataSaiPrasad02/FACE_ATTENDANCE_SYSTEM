import React from 'react';
import { ChevronLeft, ChevronRight, FileCheck2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import ProfileAvatar from '../../components/ProfileAvatar';

export default function AttendanceTable({
  records,
  pagination,
  onPageChange,
  title = 'Attendance records',
  description,
}) {
  if (!records?.length) {
    return null;
  }

  const isAbsentList = title === 'Absent students';
  const currentPage = pagination?.number ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const totalRecords = pagination?.totalElements ?? records.length;
  const firstRecord = currentPage * (pagination?.size ?? records.length) + 1;
  const lastRecord = Math.min(firstRecord + records.length - 1, totalRecords);

  return (
    <div className="space-y-4 animate-fade-in">
      <section
        aria-label={description || title}
        className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1128]/70 shadow-card backdrop-blur-md"
      >
        {/* Table Header Strip */}
        <div className="flex flex-col gap-3 border-b border-white/[0.08] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                isAbsentList
                  ? 'border-rose-300/25 bg-rose-500/10 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'border-cyan-300/25 bg-cyan-400/10 text-cyan-300 shadow-glow-sm'
              }`}
            >
              <FileCheck2 size={18} strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-display text-xs font-bold text-white sm:text-sm">{title}</h2>
              <p className="text-[11px] text-slate-500">
                Showing {firstRecord}&ndash;{lastRecord} of {totalRecords} records
              </p>
            </div>
          </div>

          <span
            className={`w-fit rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
              isAbsentList
                ? 'border-rose-300/25 bg-rose-500/10 text-rose-300'
                : 'border-white/10 bg-white/[0.05] text-slate-300'
            }`}
          >
            Page {currentPage + 1} of {totalPages}
          </span>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.04] text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Roll Number</th>
                <th className="px-5 py-3.5">Batch</th>
                <th className="px-5 py-3.5">Semester</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Check-in Time</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Match Confidence</th>
                <th className="px-5 py-3.5">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {records.map((record, index) => (
                <AttendanceRow
                  key={record.id ?? `${record.studentNumber}-${record.attendanceDate}-${index}`}
                  record={record}
                  index={index}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav
          aria-label="Attendance record pages"
          className="flex flex-col gap-3 px-1 pt-1 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-xs font-medium text-slate-500">
            Showing <span className="font-bold text-slate-200">{firstRecord}&ndash;{lastRecord}</span> of{' '}
            <span className="font-bold text-slate-200">{totalRecords}</span> records
          </p>

          <div className="flex items-center gap-1.5">
            {/* Previous */}
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => onPageChange(currentPage - 1)}
              className="flex h-8 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-300/30 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page Buttons */}
            <div className="flex items-center gap-1">
              {getVisiblePages(currentPage, totalPages).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                    page === currentPage
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-glow-sm'
                      : 'border border-white/10 bg-white/[0.05] text-slate-300 hover:border-cyan-300/30 hover:text-cyan-200'
                  }`}
                >
                  {page + 1}
                </button>
              ))}
            </div>

            {/* Next */}
            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
              className="flex h-8 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-300/30 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

function AttendanceRow({ record }) {
  const rawConfidence = Number(record.confidenceScore ?? 0);
  const confidence = rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence;
  const confidenceLabel = record.confidenceScore == null ? '—' : `${Math.round(confidence)}%`;
  const confidenceLevel =
    confidence >= 80 ? 'confidence-high' : confidence >= 55 ? 'confidence-medium' : 'confidence-low';

  return (
    <tr className="transition-colors hover:bg-white/[0.03]">
      {/* Student */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <ProfileAvatar name={record.studentName} size="sm" />
          <span className="max-w-[170px] truncate font-bold text-white">
            {record.studentName || 'Unknown Student'}
          </span>
        </div>
      </td>

      {/* Roll Number */}
      <td className="px-5 py-3.5">
        <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono text-[10.5px] font-semibold text-slate-300">
          {record.studentNumber || '—'}
        </span>
      </td>

      {/* Batch */}
      <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-400">
        {record.batch || '—'}
      </td>

      {/* Semester */}
      <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-400">
        {record.semester ? `Sem ${record.semester}` : '—'}
      </td>

      {/* Date */}
      <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-300">
        {record.attendanceDate || '—'}
      </td>

      {/* Time */}
      <td className="whitespace-nowrap px-5 py-3.5 tabular-nums text-slate-500">
        {record.attendanceTime || '—'}
      </td>

      {/* Status */}
      <td className="px-5 py-3.5">
        <Badge status={record.status} />
      </td>

      {/* Confidence */}
      <td className="px-5 py-3.5">
        <div className="flex min-w-[130px] items-center gap-2">
          <div className={`confidence-bar ${confidenceLevel}`}>
            <div
              className="confidence-fill"
              style={{ width: `${Math.max(0, Math.min(confidence, 100))}%` }}
            />
          </div>
          <span className="w-8 text-right text-[11px] font-bold tabular-nums text-slate-200">
            {confidenceLabel}
          </span>
        </div>
      </td>

      {/* Attendance % */}
      <td className="px-5 py-3.5">
        <AttendancePercentageCell value={record.attendancePercentage} />
      </td>
    </tr>
  );
}

function AttendancePercentageCell({ value }) {
  if (value === null || value === undefined) {
    return <span className="text-xs text-slate-600">—</span>;
  }

  const pct = Number(value);
  const color =
    pct >= 75
      ? 'bg-emerald-400/10 text-emerald-300 border-emerald-300/25'
      : pct >= 50
        ? 'bg-amber-400/10 text-amber-300 border-amber-300/25'
        : 'bg-rose-500/10 text-rose-300 border-rose-300/25';

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold tabular-nums ${color}`}
    >
      {pct}%
    </span>
  );
}

function getVisiblePages(currentPage, totalPages) {
  const pageCount = Math.min(totalPages, 5);
  const start =
    totalPages <= 5
      ? 0
      : Math.max(0, Math.min(currentPage - 2, totalPages - pageCount));
  return Array.from({ length: pageCount }, (_, index) => start + index);
}
