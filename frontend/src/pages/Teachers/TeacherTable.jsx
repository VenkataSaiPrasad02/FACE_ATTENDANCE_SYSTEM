import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Building2, Mail, Phone, Hash } from 'lucide-react';
import ProfileAvatar from '../../components/ProfileAvatar';

/**
 * TeacherTable Component
 * 
 * IMPROVED UI VERSION:
 * - Enhanced typography hierarchy (Full Name is primary)
 * - Cleaner column headers with subtle styling
 * - Improved row spacing and hover effects
 * - Subtle badges and chips for metadata
 * - Responsive horizontal scrolling
 * - Preserved ProfileAvatar and all existing logic
 */
export default function TeacherTable({
  teachers,
  onEdit,
  onDelete,
  pagination,
  onPageChange
}) {

  if (!teachers || teachers.length === 0) {
    return null;
  }

  /*
   * Group teachers by department.
   * Departments are sorted alphabetically, Unassigned at bottom.
   */
  const groupedTeachers = teachers.reduce((groups, teacher) => {
    const department = teacher.department?.trim() || 'Unassigned';
    if (!groups[department]) {
      groups[department] = [];
    }
    groups[department].push(teacher);
    return groups;
  }, {});

  const sortedDepartments = Object.keys(groupedTeachers).sort((a, b) => {
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-8">
      {sortedDepartments.map((department) => {
        const departmentTeachers = [...groupedTeachers[department]].sort(
          (a, b) => (a.username || '').localeCompare(b.username || '')
        );

        return (
          <motion.div
            key={department}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {/* DEPARTMENT HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                  <Building2 size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    Department
                  </h2>
                  <p className="text-sm font-bold text-slate-800">
                    {department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                  {departmentTeachers.length} {departmentTeachers.length === 1 ? 'Teacher' : 'Teachers'}
                </span>
              </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <table className="w-full min-w-[850px] table-fixed border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/30">
                    <th className="w-[60px] px-6 py-4 text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">#</span>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Teacher Details</span>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Information</span>
                    </th>
                    <th className="w-[180px] px-4 py-4 text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Specialization</span>
                    </th>
                    <th className="w-[140px] px-6 py-4 text-right">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departmentTeachers.map((teacher, index) => (
                    <motion.tr
                      key={teacher.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="group transition-all duration-200 hover:bg-indigo-50/30"
                    >
                      {/* INDEX */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </td>

                      {/* TEACHER INFO */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <ProfileAvatar 
                              photoUrl={teacher.profilePhotoUrl} 
                              name={teacher.fullName} 
                              size="md" 
                              className="ring-2 ring-white shadow-sm group-hover:ring-indigo-100 transition-all"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="truncate text-[14px] font-bold text-slate-800 tracking-tight group-hover:text-indigo-900 transition-colors">
                              {teacher.fullName}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                              <Hash size={10} strokeWidth={3} className="text-slate-300" />
                              ID: {teacher.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT INFO */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail size={12} className="text-slate-300 group-hover:text-indigo-300 transition-colors" />
                            <span className="truncate text-xs font-medium">
                              {teacher.email || '—'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Phone size={12} className="text-slate-300 group-hover:text-indigo-300 transition-colors" />
                            <span className="text-[11px] font-medium tracking-wide">
                              {teacher.phone || '—'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* DEPARTMENT BADGE */}
                      <td className="px-4 py-4 text-left">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                          {teacher.department?.trim() || 'Unassigned'}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onEdit(teacher)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-indigo-600 hover:text-white hover:ring-indigo-600"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(teacher)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-red-500 hover:text-white hover:ring-red-500"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        );
      })}

      {/* PAGINATION SECTION */}
      {pagination && pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Showing</span>
            <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-700">{pagination.numberOfElements}</span>
            <span>of</span>
            <span className="font-bold text-slate-700">{pagination.totalElements}</span>
            <span>teachers</span>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange(pagination.number - 1)}
              disabled={pagination.number === 0}
              className={`flex h-9 items-center justify-center rounded-xl px-4 text-xs font-bold transition-all ${
                pagination.number === 0
                  ? 'cursor-not-allowed bg-slate-50 text-slate-300'
                  : 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:text-indigo-600 active:scale-95'
              }`}
            >
              Previous
            </button>

            <div className="flex gap-1 px-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let pageNumber = pagination.totalPages <= 5 ? i : 
                  (pagination.number < 3 ? i : 
                  (pagination.number > pagination.totalPages - 3 ? pagination.totalPages - 5 + i : pagination.number - 2 + i));

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => onPageChange(pageNumber)}
                    className={`h-9 w-9 rounded-xl text-xs font-bold transition-all active:scale-90 ${
                      pagination.number === pageNumber
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2'
                        : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                  >
                    {pageNumber + 1}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onPageChange(pagination.number + 1)}
              disabled={pagination.number === pagination.totalPages - 1}
              className={`flex h-9 items-center justify-center rounded-xl px-4 text-xs font-bold transition-all ${
                pagination.number === pagination.totalPages - 1
                  ? 'cursor-not-allowed bg-slate-50 text-slate-300'
                  : 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:text-indigo-600 active:scale-95'
              }`}
            >
              Next
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}