import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus,
  X,
  CalendarDays,
  Search,
  GraduationCap,
  Layers,
  TrendingUp,
  AlertTriangle,
  Power,
  RotateCcw
} from 'lucide-react';

import academicPeriodService from '../../services/academicPeriodService';

import AcademicPeriodTable from './AcademicPeriodTable';
import AcademicPeriodForm from './AcademicPeriodForm';

function formatDate(value) {

  if (!value) return '—';

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

}

export default function AcademicPeriodsPage() {

  const [periods, setPeriods] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [modal, setModal] = useState(null);

  const loadPeriods = async () => {

    try {

      setLoading(true);
      setError('');

      const data = await academicPeriodService.getAll();

      setPeriods(data || []);

    } catch (e) {

      setError(
        e?.response?.data?.message ||
        'Failed to load academic periods.'
      );

    } finally {

      setLoading(false);

    }

  };
  useEffect(() => {

    loadPeriods();

  }, []);

  useEffect(() => {

    if (!success) return;

    const timer = setTimeout(() => setSuccess(''), 3000);

    return () => clearTimeout(timer);

  }, [success]);


  // ==========================================================
  // DERIVED DATA (from real periods only — nothing fabricated)
  // ==========================================================

  const courses = useMemo(() => {

    const values = new Set();

    periods.forEach((p) => {
      if (p.course?.trim()) values.add(p.course.trim());
    });

    return Array.from(values).sort((a, b) => a.localeCompare(b));

  }, [periods]);

  const activePeriods = useMemo(
    () => periods.filter((p) => p.active),
    [periods]
  );

  const upcomingCount = useMemo(() => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return periods.filter((p) => {

      if (!p.startDate) return false;

      const start = new Date(p.startDate);

      return !Number.isNaN(start.getTime()) && start > today;

    }).length;

  }, [periods]);

  const filteredPeriods = useMemo(() => {

    const query = search.trim().toLowerCase();

    return periods.filter((p) => {

      const matchesSearch =
        !query ||
        p.course?.toLowerCase().includes(query) ||
        p.batch?.toLowerCase().includes(query) ||
        p.semester?.toLowerCase().includes(query);

      const matchesCourse =
        courseFilter === 'ALL' || p.course === courseFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && p.active) ||
        (statusFilter === 'INACTIVE' && !p.active);

      return matchesSearch && matchesCourse && matchesStatus;

    });

  }, [periods, search, courseFilter, statusFilter]);

  const hasFilters =
    search.trim() !== '' ||
    courseFilter !== 'ALL' ||
    statusFilter !== 'ALL';

  const clearFilters = () => {
    setSearch('');
    setCourseFilter('ALL');
    setStatusFilter('ALL');
  };


  // ==========================================================
  // ACTIONS
  // ==========================================================

  const handleSubmit = async (data) => {

    if (modal === 'create') {

      await academicPeriodService.create(data);
      setSuccess('Academic period scheduled successfully.');

    } else {

      await academicPeriodService.update(modal.id, data);
      setSuccess('Academic period updated successfully.');

    }

    setModal(null);

    await loadPeriods();

  };

  const handleActivate = async (period) => {

    const confirmed = window.confirm(
      'Are you sure you want to activate this academic period?'
    );

    if (!confirmed) return;

    try {

      await academicPeriodService.activate(period.id);
      setSuccess('Academic period activated successfully.');

      await loadPeriods();

    } catch (e) {

      setError(
        e?.response?.data?.message ||
        'Failed to activate academic period.'
      );

    }

  };

  const handleDeactivate = async (period) => {

    const confirmed = window.confirm(
      'Are you sure you want to deactivate this academic period?'
    );

    if (!confirmed) return;

    try {

      await academicPeriodService.deactivate(period.id);
      setSuccess('Academic period deactivated successfully.');

      await loadPeriods();

    } catch (e) {

      setError(
        e?.response?.data?.message ||
        'Failed to deactivate academic period.'
      );

    }

  };

  const handleDelete = async (period) => {

    if (period.active) {
      setError('An active academic period cannot be deleted. Deactivate it first.');
      return;
    }

    const confirmed = window.confirm(
      `Delete academic period ${period.course} / ${period.batch} / ${period.semester}?`
    );

    if (!confirmed) return;

    try {

      await academicPeriodService.remove(period.id);
      setSuccess('Academic period deleted successfully.');

      await loadPeriods();

    } catch (e) {

      setError(
        e?.response?.data?.message ||
        'Failed to delete academic period.'
      );

    }

  };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="mx-auto max-w-[1600px] px-4 pb-10 sm:px-6 lg:px-10"
    >

      {/* ======================================================
          HEADER
         ====================================================== */}

      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-8 flex flex-col gap-5 pt-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <CalendarDays size={21} />
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
              Academic Management
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Academic Periods
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Manage academic years, semesters, schedules and active academic periods.
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setModal('create')}
          className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700"
        >
          <CalendarDays size={19} />
          Schedule Academic Period
        </motion.button>
      </motion.div>


      {/* ======================================================
          SUMMARY CARDS
         ====================================================== */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Periods</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{periods.length}</p>
              <p className="mt-0.5 text-xs text-gray-400">Scheduled academic periods</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Layers size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Periods</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{activePeriods.length}</p>
              <p className="mt-0.5 text-xs text-gray-400">Currently in progress</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Power size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Upcoming Periods</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{upcomingCount}</p>
              <p className="mt-0.5 text-xs text-gray-400">Start date in the future</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Courses</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{courses.length}</p>
              <p className="mt-0.5 text-xs text-gray-400">Distinct courses scheduled</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <GraduationCap size={22} />
            </div>
          </div>
        </div>

      </motion.div>


      {/* ======================================================
          CURRENTLY ACTIVE PERIOD(S)
         ====================================================== */}

      {activePeriods.length > 0 && (

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="mb-8 space-y-3"
        >

          <div className={`grid gap-4 ${activePeriods.length > 1 ? 'md:grid-cols-2' : ''}`}>

            {activePeriods.map((period) => (

              <div
                key={period.id}
                className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50/40 p-6 shadow-sm"
              >

                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-200/30 blur-3xl" />

                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Currently Active
                    </span>

                    <h3 className="mt-3 text-2xl font-bold text-gray-900">
                      {period.course}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-gray-600">
                      {period.batch} · {period.semester}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      {formatDate(period.startDate)} → {formatDate(period.endDate)}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeactivate(period)}
                    className="shrink-0 rounded-xl border border-amber-300 bg-white px-5 py-2.5 text-sm font-semibold text-amber-700 shadow-sm transition hover:bg-amber-50"
                  >
                    Deactivate
                  </button>

                </div>

              </div>

            ))}

          </div>

        </motion.div>

      )}


      {/* ======================================================
          SUCCESS / ERROR
         ====================================================== */}

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-sm"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-5 py-4 text-sm text-red-700 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">⚠️</span>
                <span>{error}</span>
              </div>

              <button
                type="button"
                onClick={() => setError('')}
                className="rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ======================================================
          FILTER / SEARCH
         ====================================================== */}

      {!loading && periods.length > 0 && (

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8 flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center"
        >

          {/* Search */}

          <div className="group flex h-12 flex-1 items-stretch overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-all duration-200 hover:border-gray-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
            <div className="flex w-11 shrink-0 items-center justify-center text-gray-400 transition-colors group-focus-within:text-blue-600">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course, batch or semester..."
              className="h-full w-full bg-transparent pr-4 text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="flex w-10 shrink-0 items-center justify-center text-gray-400 transition hover:text-gray-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Course */}

          <div className="group flex h-12 items-stretch overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-all duration-200 hover:border-gray-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 sm:w-48">
            <div className="flex w-11 shrink-0 items-center justify-center text-gray-400 transition-colors group-focus-within:text-blue-600">
              <GraduationCap size={17} />
            </div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="h-full w-full cursor-pointer appearance-none bg-transparent pr-4 text-sm font-medium text-gray-700 outline-none"
            >
              <option value="ALL">All Courses</option>
              {courses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status */}

          <div className="group flex h-12 items-stretch overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-all duration-200 hover:border-gray-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 sm:w-44">
            <div className="flex w-11 shrink-0 items-center justify-center text-gray-400 transition-colors group-focus-within:text-blue-600">
              <Power size={16} />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-full w-full cursor-pointer appearance-none bg-transparent pr-4 text-sm font-medium text-gray-700 outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <X size={14} />
              Clear
            </button>
          )}

        </motion.div>

      )}


      {/* ======================================================
          LOADING SKELETON
         ====================================================== */}

      {loading ? (

        <div className="space-y-6">

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[104px] animate-pulse rounded-2xl border border-gray-200 bg-gray-100" />
            ))}
          </div>

          <div className="h-14 animate-pulse rounded-2xl border border-gray-200 bg-gray-100" />

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="h-12 animate-pulse bg-gray-100" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-t border-gray-100 px-6 py-5">
                <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
              </div>
            ))}
          </div>

        </div>


      ) : error && periods.length === 0 ? (


        /* ====================================================
           ERROR STATE (initial load failure)
           ==================================================== */

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-red-200 bg-red-50/40 p-16 text-center shadow-sm"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20">
            <AlertTriangle size={28} />
          </div>

          <h3 className="mt-5 text-lg font-bold text-gray-900">
            Unable to load academic periods
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            There was a problem loading the academic-period data.
          </p>

          <button
            type="button"
            onClick={loadPeriods}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5"
          >
            <RotateCcw size={16} />
            Try Again
          </button>
        </motion.div>


      ) : periods.length === 0 ? (


        /* ====================================================
           EMPTY STATE (no periods at all)
           ==================================================== */

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-blue-50/40 p-16 text-center shadow-sm"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl shadow-lg shadow-blue-500/20">
            📅
          </div>

          <h3 className="mt-5 text-lg font-bold text-gray-900">No Academic Periods</h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            No academic periods have been scheduled yet.
          </p>

          <button
            type="button"
            onClick={() => setModal('create')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Schedule Academic Period
          </button>
        </motion.div>


      ) : filteredPeriods.length === 0 ? (


        /* ====================================================
           EMPTY STATE (filters produced no matches)
           ==================================================== */

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-blue-50/40 p-16 text-center shadow-sm"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl shadow-lg shadow-blue-500/20">
            🔍
          </div>

          <h3 className="mt-5 text-lg font-bold text-gray-900">No matching periods</h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            No academic periods match your current search or filters.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
          >
            Clear Filters
          </button>
        </motion.div>


      ) : (

        <AcademicPeriodTable
          periods={filteredPeriods}
          onEdit={(period) => setModal(period)}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          onDelete={handleDelete}
        />

      )}


      {/* ======================================================
          CREATE / UPDATE MODAL
         ====================================================== */}

      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-1000 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md sm:p-8"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/60 bg-white p-6 shadow-2xl shadow-black/20 sm:p-9"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 shadow-lg shadow-indigo-500/15">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ rotate: -10, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm"
                  >
                    <CalendarDays size={22} />
                  </motion.div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-white">
                      {modal === 'create' ? 'Schedule Academic Period' : 'Update Academic Period'}
                    </h2>

                    <p className="mt-1 text-sm text-blue-100">
                      {modal === 'create'
                        ? 'Create a schedule for a course, batch and semester.'
                        : 'Update this academic period.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                    title="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <AcademicPeriodForm
                initialData={modal === 'create' ? null : modal}
                onSubmit={handleSubmit}
                onCancel={() => setModal(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}