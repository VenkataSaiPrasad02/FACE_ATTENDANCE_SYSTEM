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
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-xs backdrop-blur-md transition-all hover:border-slate-300"
          >
            {/* Department Card Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Building2 size={18} strokeWidth={2} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Department
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    {department}
                  </h3>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-600 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                {departmentTeachers.length} {departmentTeachers.length === 1 ? 'Faculty' : 'Faculty Members'}
              </span>
            </div>

            {/* Department Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="w-12 px-5 py-3.5">#</th>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="w-28 px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {departmentTeachers.map((teacher, index) => (
                    <tr
                      key={teacher.id}
                      className="transition-colors hover:bg-indigo-50/30"
                    >
                      {/* Index */}
                      <td className="px-5 py-4 font-bold text-slate-400">
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
                            <span className="truncate text-xs sm:text-sm font-bold text-slate-900 block">
                              {teacher.fullName || teacher.username || '—'}
                            </span>
                            {teacher.username && (
                              <span className="text-[11px] font-medium text-slate-400">
                                @{teacher.username}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4">
                        {teacher.email ? (
                          <div className="flex items-center gap-1.5 text-[11.5px] text-slate-600">
                            <Mail size={13} className="text-slate-400 shrink-0" />
                            <span className="truncate max-w-[220px]">{teacher.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}

                        {teacher.phone && (
                          <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-slate-500">
                            <Phone size={13} className="text-slate-400 shrink-0" />
                            <span>{teacher.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Department */}
                      <td className="px-5 py-4">
                        <span className="rounded-md border border-slate-200 bg-slate-100/80 px-2 py-0.5 text-[10.5px] font-semibold text-slate-700">
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
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(teacher)}
                            title="Delete teacher"
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
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