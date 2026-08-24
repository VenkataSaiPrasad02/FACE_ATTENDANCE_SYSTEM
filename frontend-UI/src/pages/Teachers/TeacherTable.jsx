import React from 'react';
import { Pencil, Trash2, Building2, Mail, Phone } from 'lucide-react';
import ProfileAvatar from '../../components/ProfileAvatar';

export default function TeacherTable({
  teachers,
  onEdit,
  onDelete,
}) {
  if (!teachers || teachers.length === 0) {
    return null;
  }

  // Group teachers by department
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
    <div className="space-y-6 animate-fade-in">
      {sortedDepartments.map((department) => {
        const departmentTeachers = [...groupedTeachers[department]].sort(
          (a, b) => (a.username || '').localeCompare(b.username || '')
        );
        return (
          <div
            key={department}
            className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1128]/70 shadow-card backdrop-blur-md transition-all duration-200 hover:border-cyan-300/25"
          >
            {/* Department Card Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.04] px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300/25 bg-violet-400/10 text-violet-300">
                  <Building2 size={18} strokeWidth={2} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Department
                  </span>
                  <h3 className="text-xs font-bold text-white sm:text-sm">
                    {department}
                  </h3>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-bold text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
                {departmentTeachers.length} {departmentTeachers.length === 1 ? 'Faculty' : 'Faculty Members'}
              </span>
            </div>

            {/* Department — mobile cards */}
            <div className="divide-y divide-white/[0.05] lg:hidden">
              {departmentTeachers.map((teacher, index) => (
                <TeacherCard
                  key={teacher.id}
                  teacher={teacher}
                  index={index + 1}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>

            {/* Department Table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[800px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.04] text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="w-12 px-5 py-3.5">#</th>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="w-28 px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-xs">
                  {departmentTeachers.map((teacher, index) => (
                    <tr
                      key={teacher.id}
                      className="transition-colors hover:bg-white/[0.03]"
                    >
                      {/* Index */}
                      <td className="px-5 py-4 font-bold text-slate-500">
                        {String(index + 1).padStart(2, '0')}
                      </td>

                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <ProfileAvatar
                            photoUrl={teacher.profilePhotoUrl}
                            name={teacher.fullName || teacher.username}
                            size="md"
                          />
                          <div className="min-w-0">
                            <span className="block truncate text-xs font-bold text-white sm:text-sm">
                              {teacher.fullName || teacher.username || '—'}
                            </span>
                            {teacher.username && (
                              <span className="font-mono text-[11px] font-medium text-slate-500">
                                @{teacher.username}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4">
                        {teacher.email ? (
                          <div className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
                            <Mail size={13} className="shrink-0 text-slate-500" />
                            <span className="max-w-[220px] truncate">{teacher.email}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}

                        {teacher.phone && (
                          <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-slate-500">
                            <Phone size={13} className="shrink-0 text-slate-500" />
                            <span>{teacher.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Department */}
                      <td className="px-5 py-4">
                        <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10.5px] font-semibold text-slate-300">
                          {teacher.department || '—'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEdit(teacher)}
                            title="Edit teacher"
                            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-cyan-400/10 hover:text-cyan-300"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(teacher)}
                            title="Delete teacher"
                            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
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
      })}
    </div>
  );
}

/* =========================================================
   MOBILE TEACHER CARD
========================================================= */

function TeacherCard({ teacher, index, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <ProfileAvatar
        photoUrl={teacher.profilePhotoUrl}
        name={teacher.fullName || teacher.username}
        size="md"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-white">
          {teacher.fullName || teacher.username || '—'}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-slate-500">
          #{String(index).padStart(2, '0')}
          {teacher.username && ` · @${teacher.username}`}
        </p>

        {teacher.email && (
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-slate-400">
            <Mail size={12} className="shrink-0 text-slate-600" />
            <span className="truncate">{teacher.email}</span>
          </p>
        )}

        {teacher.phone && (
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Phone size={12} className="shrink-0 text-slate-600" />
            {teacher.phone}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(teacher)}
          aria-label="Edit teacher"
          title="Edit teacher"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-cyan-400/10 hover:text-cyan-300"
        >
          <Pencil size={16} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(teacher)}
          aria-label="Delete teacher"
          title="Delete teacher"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
