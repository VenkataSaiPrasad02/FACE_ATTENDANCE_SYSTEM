import React from 'react';
import {
  Edit,
  Trash2,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { isAdminLike } from '../../auth/roles';
import ProfileAvatar from '../../components/ProfileAvatar';

export default function StudentTable({
  students,
  onEdit,
  onDelete,
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
      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-xs backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
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
            <tbody className="divide-y divide-slate-100/90 text-xs">
              {students.map((s, i) => (
                <tr
                  key={s.id}
                  className="transition-colors hover:bg-indigo-50/30"
                >
                  {/* Row Number */}
                  <td className="px-5 py-4 font-semibold text-slate-400">
                    {firstIndex + i}
                  </td>

                  {/* Student Profile */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <ProfileAvatar name={s.fullName} size="sm" />
                        {s.faceRegistered && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">
                          {s.fullName}
                        </p>
                        {s.faceRegistered && (
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                            <UserCheck size={11} />
                            <span>Biometrics Enrolled</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Roll Number */}
                  <td className="px-5 py-4">
                    <span className="rounded-lg border border-slate-200 bg-slate-100/70 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700">
                      {s.studentNumber}
                    </span>
                  </td>

                  {/* Course */}
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {s.course || <span className="text-slate-300">—</span>}
                  </td>

                  {/* Batch */}
                  <td className="px-5 py-4 text-slate-600">
                    {s.batch || <span className="text-slate-300">—</span>}
                  </td>

                  {/* Semester */}
                  <td className="px-5 py-4 text-slate-600">
                    {s.semester ? `Sem ${s.semester}` : <span className="text-slate-300">—</span>}
                  </td>

                  {/* Attendance % */}
                  <td className="px-5 py-4">
                    <AttendancePercentageBadge value={s.attendancePercentage} />
                  </td>

                  {/* Email */}
                  <td className="px-5 py-4 text-slate-500 truncate max-w-[180px]">
                    {s.email || <span className="text-slate-300">—</span>}
                  </td>

                  {/* Face Status */}
                  <td className="px-5 py-4">
                    {s.faceRegistered ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Registered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                        <UserX size={12} className="text-amber-500" />
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(s)}
                        title="Edit student"
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Edit size={15} />
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => onDelete(s)}
                          title="Delete student"
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
          <p className="text-xs font-medium text-slate-500">
            Showing <span className="font-bold text-slate-800">{firstIndex}–{lastIndex}</span> of{' '}
            <span className="font-bold text-slate-800">{totalElements}</span> students
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
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
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
              className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
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
      className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-bold tabular-nums ${color}`}
    >
      {pct}%
    </span>
  );
}
