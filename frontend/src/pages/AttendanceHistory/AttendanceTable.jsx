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
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-xs backdrop-blur-md"
      >
        {/* Table Header Strip */}
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                isAbsentList
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <FileCheck2 size={18} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">{title}</h2>
              <p className="text-[11px] text-slate-500">
                Showing {firstRecord}–{lastRecord} of {totalRecords} records
              </p>
            </div>
          </div>

          <span
            className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              isAbsentList
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            Page {currentPage + 1} of {totalPages}
          </span>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
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
            <tbody className="divide-y divide-slate-100/90">
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
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 pt-1"
        >
          <p className="text-xs font-medium text-slate-500">
            Showing <span className="font-bold text-slate-800">{firstRecord}–{lastRecord}</span> of{' '}
            <span className="font-bold text-slate-800">{totalRecords}</span> records
          </p>

          <div className="flex items-center gap-1.5">
            {/* Previous */}
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => onPageChange(currentPage - 1)}
              className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
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
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
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
              className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
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
  const confidenceColor =
    confidence >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : confidence >= 55 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-rose-500 to-red-500';

  return (
    <tr className="transition-colors hover:bg-indigo-50/30">
      {/* Student */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <ProfileAvatar name={record.studentName} size="sm" />
          <span className="font-bold text-slate-900 truncate max-w-[170px]">
            {record.studentName || 'Unknown Student'}
          </span>
        </div>
      </td>

      {/* Roll Number */}
      <td className="px-5 py-3.5">
        <span className="rounded-md border border-slate-200 bg-slate-100/80 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-slate-700">
          {record.studentNumber || '—'}
        </span>
      </td>

      {/* Batch */}
      <td className="px-5 py-3.5 text-slate-600 font-medium whitespace-nowrap">
        {record.batch || '—'}
      </td>

      {/* Semester */}
      <td className="px-5 py-3.5 text-slate-600 font-medium whitespace-nowrap">
        {record.semester ? `Sem ${record.semester}` : '—'}
      </td>

      {/* Date */}
      <td className="px-5 py-3.5 text-slate-700 font-medium whitespace-nowrap">
        {record.attendanceDate || '—'}
      </td>

      {/* Time */}
      <td className="px-5 py-3.5 text-slate-500 tabular-nums whitespace-nowrap">
        {record.attendanceTime || '—'}
      </td>

      {/* Status */}
      <td className="px-5 py-3.5">
        <Badge status={record.status} />
      </td>

      {/* Confidence */}
      <td className="px-5 py-3.5">
        <div className="flex min-w-[130px] items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-300 ${confidenceColor}`}
              style={{ width: `${Math.max(0, Math.min(confidence, 100))}%` }}
            />
          </div>
          <span className="w-8 text-right text-[11px] font-bold tabular-nums text-slate-700">
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
    return <span className="text-xs text-slate-300">—</span>;
  }

  const pct = Number(value);
  const color =
    pct >= 75
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : pct >= 50
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-rose-50 text-rose-700 border-rose-200';

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
