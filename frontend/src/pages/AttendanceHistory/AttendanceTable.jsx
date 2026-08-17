import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, FileCheck2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';

export default function AttendanceTable({ records, pagination, onPageChange, title = 'Attendance records', description }) {
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
    <div>
      <section aria-label={description || title} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isAbsentList ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
              <FileCheck2 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
              <p className="mt-0.5 text-xs text-gray-500">Showing {firstRecord}–{lastRecord} of {totalRecords} records</p>
            </div>
          </div>
          <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${isAbsentList ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
            Page {currentPage + 1} of {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1040px] w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                {['Student', 'Number', 'Batch', 'Semester', 'Date', 'Time', 'Status', 'Confidence', 'Attendance %'].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-gray-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((record, index) => (
                <AttendanceRow key={record.id ?? `${record.studentNumber}-${record.attendanceDate}-${index}`} record={record} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {totalPages > 1 && (
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          aria-label="Attendance record pages"
          className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{firstRecord}–{lastRecord}</span> of{' '}
            <span className="font-semibold text-gray-700">{totalRecords}</span> records
          </p>

          <div className="flex items-center gap-1.5">
            <PageButton
              label="Previous page"
              disabled={currentPage === 0}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft size={17} />
              <span className="hidden sm:inline">Previous</span>
            </PageButton>

            <div className="flex items-center gap-1">
              {getVisiblePages(currentPage, totalPages).map((page) => (
                <motion.button
                  key={page}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onPageChange(page)}
                  aria-label={`Page ${page + 1}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                  className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition-all ${
                    page === currentPage
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'border border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-600'
                  }`}
                >
                  {page + 1}
                </motion.button>
              ))}
            </div>

            <PageButton
              label="Next page"
              disabled={currentPage === totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={17} />
            </PageButton>
          </div>
        </motion.nav>
      )}
    </div>
  );
}

function AttendanceRow({ record, index }) {
  const rawConfidence = Number(record.confidenceScore ?? 0);
  const confidence = rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence;
  const confidenceLabel = record.confidenceScore == null ? '—' : `${Math.round(confidence)}%`;
  const confidenceColor = confidence >= 80 ? 'bg-emerald-500' : confidence >= 55 ? 'bg-amber-500' : 'bg-red-500';
  const initial = record.studentName?.trim()?.charAt(0)?.toUpperCase() || '?';

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.035, 0.3), duration: 0.25 }}
      className="group transition-colors hover:bg-blue-50/40"
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
            {initial}
          </div>
          <span className="text-sm font-semibold text-gray-900">{record.studentName || 'Unknown student'}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs font-medium text-gray-700">
          {record.studentNumber || '—'}
        </span>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">{record.batch || '—'}</td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">{record.semester || '—'}</td>
      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-700">{record.attendanceDate || '—'}</td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{record.attendanceTime || '—'}</td>
      <td className="px-5 py-4"><Badge status={record.status} /></td>
      <td className="px-5 py-4">
        <div className="flex min-w-36 items-center gap-2.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, Math.min(confidence, 100))}%` }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.035 + 0.15, 0.45) }}
              className={`h-full rounded-full ${confidenceColor}`}
            />
          </div>
          <span className="w-9 text-right text-xs font-semibold tabular-nums text-gray-700">{confidenceLabel}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <AttendancePercentageCell value={record.attendancePercentage} />
      </td>
    </motion.tr>
  );
}

function AttendancePercentageCell({ value }) {
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

function PageButton({ children, label, disabled, onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
    >
      {children}
    </motion.button>
  );
}

function getVisiblePages(currentPage, totalPages) {
  const pageCount = Math.min(totalPages, 5);
  const start = totalPages <= 5 ? 0 : Math.max(0, Math.min(currentPage - 2, totalPages - pageCount));
  return Array.from({ length: pageCount }, (_, index) => start + index);
}
