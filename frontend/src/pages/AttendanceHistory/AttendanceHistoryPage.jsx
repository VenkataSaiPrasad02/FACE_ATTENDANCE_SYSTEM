import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, FileText, Filter, RefreshCw, TrendingUp } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import AttendanceFilter from './AttendanceFilter';
import AttendanceTable from './AttendanceTable';
import attendanceService from '../../services/attendanceService';
import AttendanceSkeleton from './AttendanceSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Button from '../../components/ui/Button';

export default function AttendanceHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(() => getFiltersFromSearchParams(searchParams));
  const [currentPage, setCurrentPage] = useState(0);
  const isAbsentView = filters.status === 'ABSENT' && Boolean(filters.date) && !filters.startDate && !filters.endDate;

  const load = (page = 0, f = filters) => {
    setLoading(true);
    setError('');
    const shouldLoadAbsentStudents = f.status === 'ABSENT' && Boolean(f.date) && !f.startDate && !f.endDate;
    const request = shouldLoadAbsentStudents
      ? attendanceService.getAbsentStudents({ date: f.date, page, size: 15 })
      : attendanceService.getAll({ ...f, page, size: 15 });

    request
      .then(setData)
      .catch((e) => setError(e.response?.data?.message || 'Failed to load records'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(currentPage); }, [currentPage]);

  const handleFilter = (f) => {
    setFilters(f);
    setSearchParams(f, { replace: true });
    setCurrentPage(0);
    load(0, f);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl"
    >
      <div className="mb-7">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]" />
              Attendance records
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Attendance history</h1>
            <p className="mt-1.5 text-base text-gray-500">Review attendance records and narrow the list with filters.</p>
          </div>
          {data && !loading && (
            <div className="flex items-center gap-2">
              <div className={`flex w-fit items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium shadow-sm ${
                isAbsentView ? 'border-red-100 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-600'
              }`}>
                <CalendarDays size={16} className={isAbsentView ? 'text-red-600' : 'text-blue-600'} />
                {data.totalElements} {isAbsentView ? 'absent student' : 'record'}{data.totalElements === 1 ? '' : 's'}
              </div>
              <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => load(currentPage)} className="rounded-xl">
                Refresh
              </Button>
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Filter size={16} className="text-blue-600" />
                Filter records
              </h3>
              <p className="mt-1 text-xs text-gray-500">Choose one or more filters to refine the results.</p>
            </div>
          </div>
          <AttendanceFilter initialFilters={filters} onFilter={handleFilter} />
        </motion.div>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <ErrorState
            title="Failed to load records"
            message={error}
            onRetry={() => load(currentPage)}
          />
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <AttendanceSkeleton />
      ) : !data?.content || data.content.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <EmptyState
            title={isAbsentView ? 'No absent students' : 'No attendance records'}
            description={isAbsentView
              ? `Every student has a present record for ${filters.date}.`
              : 'Attendance records will appear here once students start being marked present or absent.'}
          />
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            <StatCard
              label="Total Records"
              value={data.totalElements}
              icon={FileText}
              color="blue"
            />
            <StatCard
              label="This Page"
              value={data.numberOfElements}
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              label="Pages"
              value={`${data.number + 1} of ${data.totalPages}`}
              icon={FileText}
              color="purple"
            />
          </motion.div>

          {/* Table */}
          <AttendanceTable
            records={data?.content || []}
            pagination={data}
            onPageChange={(p) => setCurrentPage(p)}
            title={isAbsentView ? 'Absent students' : 'Attendance records'}
            description={isAbsentView ? `Students without a present record on ${filters.date}` : undefined}
          />
        </>
      )}
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-green-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorMap[color]} shadow-lg`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
}

function getFiltersFromSearchParams(searchParams) {
  return Object.fromEntries(
    ['studentId', 'date', 'startDate', 'endDate', 'status']
      .map((key) => [key, searchParams.get(key) || ''])
      .filter(([, value]) => value !== '')
  );
}
