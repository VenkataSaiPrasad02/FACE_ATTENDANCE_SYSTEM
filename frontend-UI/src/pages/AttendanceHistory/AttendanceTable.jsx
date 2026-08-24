import React from 'react';
import { ChevronLeft, ChevronRight, FileCheck2, ScanFace, UserRoundPen, Smartphone } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import ProfileAvatar from '../../components/ProfileAvatar';

export default function AttendanceTable({
  records,
  pagination,
  onPageChange,
  title = 'Attendance records',
  description,
  studentMode = false,
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

        {/* Records — mobile cards */}
        <div className="divide-y divide-white/[0.05] lg:hidden">
          {records.map((record, index) => (
            <AttendanceCard
              key={record.id ?? `${record.studentNumber}-${record.attendanceDate}-${index}`}
              record={record}
              studentMode={studentMode}
            />
          ))}
        </div>

        {/* Records Table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1020px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.04] text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                {!studentMode && <th className="px-5 py-3.5">Student</th>}
                {!studentMode && <th className="px-5 py-3.5">Roll Number</th>}
                {!studentMode && <th className="px-5 py-3.5">Batch</th>}
                {!studentMode && <th className="px-5 py-3.5">Semester</th>}
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Check-in Time</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Method</th>
                <th className="px-5 py-3.5">Match Confidence</th>
                {!studentMode && <th className="px-5 py-3.5">Attendance %</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {records.map((record, index) => (
                <AttendanceRow
                  key={record.id ?? `${record.studentNumber}-${record.attendanceDate}-${index}`}
                  record={record}
                  index={index}
                  studentMode={studentMode}
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

function AttendanceRow({ record, studentMode }) {
  const rawConfidence = Number(record.confidenceScore ?? 0);
  const confidence = rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence;
  const confidenceLabel = record.confidenceScore == null ? '—' : `${Math.round(confidence)}%`;
  const confidenceLevel =
    confidence >= 80 ? 'confidence-high' : confidence >= 55 ? 'confidence-medium' : 'confidence-low';
  const isManual = String(record.attendanceMethod || '').toUpperCase() === 'MANUAL';

  return (
    <tr className="transition-colors hover:bg-white/[0.03]">
      {/* Student */}
      {!studentMode && (
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <ProfileAvatar name={record.studentName} size="sm" />
            <span className="max-w-[170px] truncate font-bold text-white">
              {record.studentName || 'Unknown Student'}
            </span>
          </div>
        </td>
      )}

      {/* Roll Number */}
      {!studentMode && (
        <td className="px-5 py-3.5">
          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono text-[10.5px] font-semibold text-slate-300">
            {record.studentNumber || '—'}
          </span>
        </td>
      )}

      {/* Batch */}
      {!studentMode && (
        <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-400">
          {record.batch || '—'}
        </td>
      )}

      {/* Semester */}
      {!studentMode && (
        <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-400">
          {record.semester ? `Sem ${record.semester}` : '—'}
        </td>
      )}

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

      {/* Method — FACE (biometric) or MANUAL (teacher-marked, audited) */}
      <td className="px-5 py-3.5">
        {isManual ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300"
            title={record.markedByName ? `Marked by ${record.markedByName}` : undefined}
          >
            <UserRoundPen size={12} />
            Manual
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300"
            title={
              record.attendanceSessionId
                ? 'Verified from the student’s own phone inside a live session'
                : 'Verified by biometric face match'
            }
          >
            {record.attendanceSessionId ? <Smartphone size={12} /> : <ScanFace size={12} />}
            Face
          </span>
        )}

        {isManual && record.markedByName && (
          <p className="mt-1 max-w-[140px] truncate text-[10px] text-slate-500">
            by {record.markedByName}
          </p>
        )}
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
      {!studentMode && (
        <td className="px-5 py-3.5">
          <AttendancePercentageCell value={record.attendancePercentage} />
        </td>
      )}
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

/* =========================================================
   MOBILE ATTENDANCE CARD
   Compact record card shown below md; mirrors the table row.
========================================================= */

function AttendanceCard({ record, studentMode }) {
  const rawConfidence = Number(record.confidenceScore ?? 0);
  const confidence = rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence;
  const confidenceLabel = record.confidenceScore == null ? '—' : `${Math.round(confidence)}%`;
  const confidenceLevel =
    confidence >= 80 ? 'confidence-high' : confidence >= 55 ? 'confidence-medium' : 'confidence-low';
  const isManual = String(record.attendanceMethod || '').toUpperCase() === 'MANUAL';

  return (
    <div className="space-y-3 px-4 py-3.5">
      {/* Identity + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {!studentMode && (
            <>
              <ProfileAvatar name={record.studentName} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {record.studentName || 'Unknown Student'}
                </p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">
                  {record.studentNumber || '—'}
                  {(record.batch || record.semester) &&
                    ` · ${[record.batch, record.semester ? `Sem ${record.semester}` : null]
                      .filter(Boolean)
                      .join(' · ')}`}
                </p>
              </div>
            </>
          )}

          {studentMode && (
            <div className="min-w-0">
              <p className="truncate font-mono text-sm font-bold text-white">
                {record.attendanceDate || '—'}
              </p>
              <p className="mt-0.5 tabular-nums text-[11px] text-slate-500">
                Check-in {record.attendanceTime || '—'}
              </p>
            </div>
          )}
        </div>

        <Badge status={record.status} />
      </div>

      {/* Meta grid */}
      <div className={`grid gap-x-3 gap-y-2 ${studentMode ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {studentMode && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Method
            </p>
              <div className="mt-1">
                {isManual ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-violet-300/25 bg-violet-400/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300"
                    title={record.markedByName ? `Marked by ${record.markedByName}` : undefined}
                  >
                    <UserRoundPen size={11} />
                    Manual{record.markedByName ? ` · ${record.markedByName}` : ''}
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300"
                    title={
                      record.attendanceSessionId
                        ? 'Verified from the student’s own phone inside a live session'
                        : 'Verified by biometric face match'
                    }
                  >
                    {record.attendanceSessionId ? <Smartphone size={11} /> : <ScanFace size={11} />}
                    Face
                  </span>
                )}
              </div>
            </div>
        )}

        {!studentMode && (
          <>
            <CardField label="Date" value={record.attendanceDate || '—'} mono />
            <CardField label="Check-in" value={record.attendanceTime || '—'} mono />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Method
              </p>
              <div className="mt-1">
                {isManual ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-violet-300/25 bg-violet-400/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300"
                    title={record.markedByName ? `Marked by ${record.markedByName}` : undefined}
                  >
                    <UserRoundPen size={11} />
                    Manual
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300"
                    title={
                      record.attendanceSessionId
                        ? 'Verified from the student’s own phone inside a live session'
                        : 'Verified by biometric face match'
                    }
                  >
                    {record.attendanceSessionId ? <Smartphone size={11} /> : <ScanFace size={11} />}
                    Face
                  </span>
                )}
              </div>
              {isManual && record.markedByName && (
                <p className="mt-0.5 truncate text-[10px] text-slate-500">
                  by {record.markedByName}
                </p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Attendance %
              </p>
              <div className="mt-1">
                <AttendancePercentageCell value={record.attendancePercentage} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confidence bar */}
      <div>
        <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-600">
          <span>Match Confidence</span>
          <span className="tabular-nums text-slate-400">{confidenceLabel}</span>
        </div>
        <div className={`confidence-bar ${confidenceLevel}`}>
          <div
            className="confidence-fill"
            style={{ width: `${Math.max(0, Math.min(confidence, 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SHARED MOBILE FIELD
========================================================= */

function CardField({ label, value, mono = false }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </p>
      <p
        className={`mt-0.5 truncate text-xs font-semibold text-slate-300 ${
          mono ? 'font-mono tabular-nums' : ''
        }`}
      >
        {value}
      </p>
    </div>
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
