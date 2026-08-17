import { motion } from 'framer-motion';
import { Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { isAdminLike } from '../../auth/roles';

export default function StudentTable({ students, onEdit, onDelete, pagination, onPageChange }) {
  const { role } = useAuth();
  const isAdmin = isAdminLike(role);

  if (!students || students.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Premium Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="min-w-[1150px] w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Student Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Attendance %
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Face Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  whileHover={{ backgroundColor: '#f8fafc' }}
                  className="group"
                >
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                    {i + 1 + (pagination?.number || 0) * (pagination?.size || 10)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar Circle with Initial and ring effect */}
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {s.fullName.charAt(0).toUpperCase()}
                        </div>
                        {s.faceRegistered && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{s.fullName}</div>
                        {s.faceRegistered && (
                          <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
                            <UserCheck size={12} />
                            <span>Verified</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                      {s.studentNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {s.course || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {s.batch || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {s.semester || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4">
                    <AttendancePercentageBadge value={s.attendancePercentage} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {s.email || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4">
                    {s.faceRegistered ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-green-700">Registered</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
                        <UserX size={14} className="text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700">Pending</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: '#eff6ff' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onEdit(s)}
                        className="p-2 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit student"
                      >
                        <Edit size={16} />
                      </motion.button>
                      {isAdmin && (
                        <motion.button
                          whileHover={{ scale: 1.05, backgroundColor: '#fef2f2' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onDelete(s)}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete student"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Premium Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{pagination.numberOfElements}</span> of{' '}
            <span className="font-semibold text-gray-900">{pagination.totalElements}</span> students
          </div>
          
          <div className="flex gap-2">
            {/* Previous Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(pagination.number - 1)}
              disabled={pagination.number === 0}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all
                ${pagination.number === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 shadow-sm hover:shadow'
                }
              `}
            >
              Previous
            </motion.button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 7) {
                  pageNum = i;
                } else if (pagination.number < 3) {
                  pageNum = i;
                } else if (pagination.number > pagination.totalPages - 4) {
                  pageNum = pagination.totalPages - 7 + i;
                } else {
                  pageNum = pagination.number - 3 + i;
                }

                return (
                  <motion.button
                    key={pageNum}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onPageChange(pageNum)}
                    className={`
                      w-10 h-10 rounded-lg font-semibold text-sm transition-all
                      ${pagination.number === pageNum
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 shadow-sm hover:shadow'
                      }
                    `}
                  >
                    {pageNum + 1}
                  </motion.button>
                );
              })}
            </div>

            {/* Next Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(pagination.number + 1)}
              disabled={pagination.number === pagination.totalPages - 1}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all
                ${pagination.number === pagination.totalPages - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 shadow-sm hover:shadow'
                }
              `}
            >
              Next
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function AttendancePercentageBadge({ value }) {
  if (value === null || value === undefined) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  const pct = Number(value);
  const color =
    pct >= 75
      ? 'bg-green-50 text-green-700 border-green-200'
      : pct >= 50
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-red-50 text-red-700 border-red-200';

  return (
    <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${color}`}>
      {pct}%
    </span>
  );
}
