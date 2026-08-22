import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  FileText,
  Filter,
  RefreshCw,
  TrendingUp,
  Layers,
  History,
} from 'lucide-react';
import AnimatedGradientBackground from '../../components/ui/AnimatedGradientBackground';
import { useSearchParams } from 'react-router-dom';
import AttendanceFilter from './AttendanceFilter';
import AttendanceTable from './AttendanceTable';
import attendanceService from '../../services/attendanceService';
import AttendanceSkeleton from './AttendanceSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatsCard from '../Dashboard/StatsCard';

export default function AttendanceHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(() => getFiltersFromSearchParams(searchParams));
  const [currentPage, setCurrentPage] = useState(0);

  const isAbsentView =
    filters.status === 'ABSENT' &&
    Boolean(filters.date) &&
    !filters.startDate &&
    !filters.endDate;

  const load = (page = 0, f = filters) => {
    setLoading(true);
    setError('');

    const shouldLoadAbsentStudents =
      f.status === 'ABSENT' &&
      Boolean(f.date) &&
      !f.startDate &&
      !f.endDate;

    const request = shouldLoadAbsentStudents
      ? attendanceService.getAbsentStudents({ date: f.date, page, size: 15 })
      : attendanceService.getAll({ ...f, page, size: 15 });

    request
      .then(setData)
      .catch((e) =>
        setError(e.response?.data?.message || 'Failed to load attendance records')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(currentPage);
  }, [currentPage]);

  const handleFilter = (f) => {
    setFilters(f);
    setSearchParams(f, { replace: true });
    setCurrentPage(0);
    load(0, f);
  };

  return (
    <AnimatedGradientBackground
  type="history"
  className="min-h-full rounded-2xl"
>
    <div className="w-full animate-fade-in pb-8">
      {/* Header */}
      <div className="mb-7">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xs">
              <History size={24} strokeWidth={2} />
            </div>

            <div>
              <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                Ledger Logs
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Attendance History
              </h1>

              <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                Review, filter, and analyze institutional attendance timestamps and biometric logs.
              </p>
            </div>
          </div>

          {data && !loading && (
            <div className="flex items-center gap-2">
              <div
                className={`flex w-fit items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-xs ${
                  isAbsentView
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-slate-200 bg-white/90 text-slate-700'
                }`}
              >
                <CalendarDays
                  size={15}
                  className={isAbsentView ? 'text-rose-600' : 'text-indigo-600'}
                />
                <span>
                  {data.totalElements} {isAbsentView ? 'absent student' : 'verified record'}
                  {data.totalElements === 1 ? '' : 's'}
                </span>
              </div>

              <Button
                variant="secondary"
                size="md"
                icon={RefreshCw}
                onClick={() => load(currentPage)}
                className="font-semibold"
              >
                Refresh
              </Button>
            </div>
          )}
        </div>

        {/* Filter Panel */}
        <Card glass className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Filter size={15} className="text-indigo-600" />
                Filter & Scope Records
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Narrow down logs by student identity, date intervals, or attendance status.
              </p>
            </div>
          </div>

          <AttendanceFilter initialFilters={filters} onFilter={handleFilter} />
        </Card>
      </div>

      {/* Error Callout */}
      {error && (
        <div className="mb-6">
          <ErrorState
            title="Failed to load attendance logs"
            message={error}
            onRetry={() => load(currentPage)}
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <AttendanceSkeleton />
      ) : !data?.content || data.content.length === 0 ? (
        <Card glass className="p-8">
          <EmptyState
            title={isAbsentView ? 'No absent students recorded' : 'No attendance logs found'}
            description={
              isAbsentView
                ? `All registered students have marked presence for ${filters.date}.`
                : 'No attendance records match your active search filters or date range.'
            }
          />
        </Card>
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatsCard
              title="Total Logs"
              value={data.totalElements}
              icon={FileText}
              colorScheme="blue"
              subtitle="All Records"
              detail="Total matching entries"
            />

            <StatsCard
              title="Current Page"
              value={data.numberOfElements}
              icon={TrendingUp}
              colorScheme="emerald"
              subtitle="Visible"
              detail="Entries on this page"
            />

            <StatsCard
              title="Page Progress"
              value={`${data.number + 1} / ${data.totalPages}`}
              icon={Layers}
              colorScheme="amber"
              subtitle="Pagination"
              detail={`Showing page ${data.number + 1}`}
            />
          </div>

          {/* Attendance Table */}
          <AttendanceTable
            records={data?.content || []}
            pagination={data}
            onPageChange={(p) => setCurrentPage(p)}
            title={isAbsentView ? 'Absent students' : 'Attendance records'}
            description={
              isAbsentView
                ? `Students without a present record on ${filters.date}`
                : undefined
            }
          />
        </>
      )}
    </div>
  </AnimatedGradientBackground>
  );
}

function getFiltersFromSearchParams(searchParams) {
  return Object.fromEntries(
    
    ['studentId', 'date', 'startDate', 'endDate', 'status']
      .map((key) => [key, searchParams.get(key) || ''])
      .filter(([, value]) => value !== '')
  );
}
