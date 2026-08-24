import React from 'react';
import {
  Edit,
  Trash2,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { isAdminLike } from '../../auth/roles';
import ProfileAvatar from '../../components/ProfileAvatar';

export default function StudentTable({
  students,
  onEdit,
  onDelete,
  onMarkAttendance,
  pagination,
  onPageChange,
}) {
  const { role } = useAuth();
  const isAdmin = isAdminLike(role);

  if (!students || students.length === 0) {
    return null;
  }

  const currentPage = pagination?.number || 0;
  const totalPages = pagination?.totalPages || 1;
  const totalElements = pagination?.totalElements || students.length;
  const pageSize = pagination?.size || 10;
  const firstIndex = currentPage * pageSize + 1;
  const lastIndex = Math.min(firstIndex + students.length - 1, totalElements);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* =====================================================
          MOBILE / TABLET CARD LIST — stacked student cards below lg
      ====================================================== */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
        {students.map((s, i) => (
          <StudentCard
            key={s.id}
            student={s}
            index={firstIndex + i}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
            onMarkAttendance={onMarkAttendance}
          />
        ))}
      </div>

      {/* Table Container */}
      <div className="hidden overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1128]/70 shadow-card backdrop-blur-md lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.04] text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">#</th>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Roll Number</th>
                <th className="px-5 py-3.5">Course</th>
                <th className="px-5 py-3.5">Batch</th>
                <th className="px-5 py-3.5">Semester</th>
                <th className="px-5 py-3.5">Attendance %</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Face Biometrics</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-xs">
              {students.map((s, i) => (
                <tr
                  key={s.id}
                  className="transition-colors hover:bg-white/[0.03]"
                >
                  {/* Row Number */}
                  <td className="px-5 py-4 font-semibold text-slate-500">
                    {firstIndex + i}
                  </td>

                  {/* Student Profile */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <ProfileAvatar name={s.fullName} size="sm" />
                        {s.faceRegistered && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] ring-2 ring-[#0b1128]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-white">
                          {s.fullName}
                        </p>
                        {s.faceRegistered && (
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                            <UserCheck size={11} />
                            <span>Biometrics Enrolled</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Roll Number */}
                  <td className="px-5 py-4">
                    <span className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-300">
                      {s.studentNumber}
                    </span>
                  </td>

                  {/* Course */}
                  <td className="px-5 py-4 font-semibold text-slate-200">
                    {s.course || <span className="text-slate-600">—</span>}
                  </td>

                  {/* Batch */}
                  <td className="px-5 py-4 text-slate-400">
                    {s.batch || <span className="text-slate-600">—</span>}
                  </td>

                  {/* Semester */}
                  <td className="px-5 py-4 text-slate-400">
                    {s.semester ? `Sem ${s.semester}` : <span className="text-slate-600">—</span>}
                  </td>

                  {/* Attendance % */}
                  <td className="px-5 py-4">
                    <AttendancePercentageBadge value={s.attendancePercentage} />
                  </td>

                  {/* Email */}
                  <td className="max-w-[180px] truncate px-5 py-4 text-slate-500">
                    {s.email || <span className="text-slate-600">—</span>}
                  </td>

                  {/* Face Status */}
                  <td className="px-5 py-4">
                    {s.faceRegistered ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                        Registered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                        <UserX size={12} className="text-amber-400" />
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onMarkAttendance && (
                        <button
                          type="button"
                          onClick={() => onMarkAttendance(s)}
                          title="Mark attendance manually"
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-emerald-400/10 hover:text-emerald-300"
                        >
                          <CalendarPlus size={15} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onEdit(s)}
                        title="Edit student"
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-cyan-400/10 hover:text-cyan-300"
                      >
                        <Edit size={15} />
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => onDelete(s)}
                          title="Delete student"
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination && totalPages > 1 && (
        <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-slate-500">
            Showing <span className="font-bold text-white">{firstIndex}–{lastIndex}</span> of{' '}
            <span className="font-bold text-white">{totalElements}</span> students
          </p>

          <div className="flex items-center gap-1.5">
            {/* Previous */}
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => onPageChange(currentPage - 1)}
              className="flex h-8 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-300/30 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page Buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = i;
                if (totalPages > 5) {
                  if (currentPage > 2) {
                    pageNum = Math.min(currentPage - 2 + i, totalPages - 1);
                  }
                }
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-glow-sm'
                        : 'border border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-300/30 hover:text-cyan-300'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            {/* Next */}
            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
              className="flex h-8 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-300/30 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AttendancePercentageBadge({ value }) {
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
      className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-bold tabular-nums ${color}`}
    >
      {pct}%
    </span>
  );
}

/* =========================================================
   MOBILE STUDENT CARD
   Mirrors the desktop table row: identity, academics,
   attendance, biometrics status and actions in one card.
========================================================= */

function StudentCard({
  student: s,
  index,
  isAdmin,
  onEdit,
  onDelete,
  onMarkAttendance,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1128]/70 shadow-card backdrop-blur-md transition-colors hover:border-cyan-300/20">
      {/* Identity header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.03] px-4 py-3">
        <div className="relative shrink-0">
          <ProfileAvatar name={s.fullName} size="sm" />
          {s.faceRegistered && (
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] ring-2 ring-[#0b1128]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{s.fullName}</p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">
            #{index} · {s.studentNumber}
          </p>
        </div>

        {s.faceRegistered ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
            <UserCheck size={11} />
            Enrolled
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300/25 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
            <UserX size={11} />
            Pending
          </span>
        )}
      </div>

      {/* Detail rows */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 px-4 py-3">
        <MobileField label="Course" value={s.course || '—'} />
        <MobileField label="Batch" value={s.batch || '—'} />
        <MobileField
          label="Semester"
          value={s.semester ? `Sem ${s.semester}` : '—'}
        />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Attendance
          </p>
          <div className="mt-1">
            <AttendancePercentageBadge value={s.attendancePercentage} />
          </div>
        </div>

        <div className="col-span-2 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Email
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-400">
            {s.email || '—'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 border-t border-white/[0.06] bg-white/[0.02] px-3 py-2">
        {onMarkAttendance && (
          <button
            type="button"
            onClick={() => onMarkAttendance(s)}
            title="Mark attendance manually"
            aria-label="Mark attendance manually"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-emerald-400/10 hover:text-emerald-300"
          >
            <CalendarPlus size={16} />
          </button>
        )}

        <button
          type="button"
          onClick={() => onEdit(s)}
          title="Edit student"
          aria-label="Edit student"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-cyan-400/10 hover:text-cyan-300"
        >
          <Edit size={16} />
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => onDelete(s)}
            title="Delete student"
            aria-label="Delete student"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SHARED MOBILE FIELD
========================================================= */

export function MobileField({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-semibold text-slate-300">
        {value}
      </p>
    </div>
  );
}
