import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Search,
  GraduationCap,
  Layers,
  TrendingUp,
  Power,
  Plus,
  X,
  RotateCcw,
} from 'lucide-react';
import AnimatedGradientBackground from '../../components/ui/AnimatedGradientBackground';
import academicPeriodService from '../../services/academicPeriodService';
import AcademicPeriodTable from './AcademicPeriodTable';
import AcademicPeriodForm from './AcademicPeriodForm';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import StatsCard from '../Dashboard/StatsCard';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
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

  // Confirmations
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadPeriods = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await academicPeriodService.getAll();
      setPeriods(data || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load academic periods.');
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

  // Derived Data
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

  // Submit create / edit
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

  // Execute confirmed action
  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);

    try {
      const { type, period } = confirmAction;
      if (type === 'activate') {
        await academicPeriodService.activate(period.id);
        setSuccess('Academic period activated successfully.');
      } else if (type === 'deactivate') {
        await academicPeriodService.deactivate(period.id);
        setSuccess('Academic period deactivated successfully.');
      } else if (type === 'delete') {
        await academicPeriodService.remove(period.id);
        setSuccess('Academic period deleted successfully.');
      }
      setConfirmAction(null);
      await loadPeriods();
    } catch (e) {
      setError(e?.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AnimatedGradientBackground
  type="academic"
  className="min-h-full rounded-2xl"
>
    <div className="w-full animate-fade-in pb-8">
      {/* Header */}
      <div className="animate-slide-up mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-gradient-to-br from-blue-500/20 to-cyan-400/15 text-cyan-300 shadow-glow-sm">
            <CalendarDays size={24} strokeWidth={2} />
          </div>

          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
              Academic Schedules
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Academic Periods
            </h1>

            <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
              Manage academic years, semesters, active attendance windows, and course schedules.
            </p>
          </div>
        </div>

        {/* Schedule Button */}
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setModal('create')}
          size="lg"
          className="w-full font-bold sm:w-auto"
        >
          Schedule Academic Period
        </Button>
      </div>

      {/* Success Alert Banner */}
      {success && (
        <div className="mb-6 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-5 py-3.5 text-xs font-semibold text-emerald-300 shadow-card backdrop-blur-md animate-fade-in">
          {success}
        </div>
      )}

      {/* Error Callout */}
      {error && !loading && (
        <div className="mb-6">
          <ErrorState
            title="Academic Periods Error"
            message={error}
            onRetry={loadPeriods}
          />
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Periods"
          value={periods.length}
          icon={Layers}
          colorScheme="blue"
          subtitle="Scheduled"
          detail="All configured periods"
        />

        <StatsCard
          title="Active Periods"
          value={activePeriods.length}
          icon={Power}
          colorScheme="emerald"
          subtitle="Live"
          detail="Currently active"
        />

        <StatsCard
          title="Upcoming Periods"
          value={upcomingCount}
          icon={TrendingUp}
          colorScheme="amber"
          subtitle="Future"
          detail="Scheduled ahead"
        />

        <StatsCard
          title="Programs / Courses"
          value={courses.length}
          icon={GraduationCap}
          colorScheme="rose"
          subtitle="Academic"
          detail="Distinct disciplines"
        />
      </div>

      {/* Currently Active Periods Card */}
      {activePeriods.length > 0 && (
        <div className="animate-fade-in mb-6 space-y-3">
          <div className={`grid gap-4 ${activePeriods.length > 1 ? 'md:grid-cols-2' : ''}`}>
            {activePeriods.map((period) => (
              <div
                key={period.id}
                className="relative overflow-hidden rounded-2xl border border-emerald-300/20 bg-gradient-to-br from-emerald-500/[0.07] via-[#0d1430]/55 to-[#0b1128]/60 p-5 shadow-card backdrop-blur-md transition-all duration-200 hover:border-emerald-300/35"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/15 blur-2xl" />
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-400 via-teal-400 to-transparent opacity-60" />

                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                      Currently Active Period
                    </span>

                    <h3 className="font-display mt-2 text-lg font-bold text-white">
                      {period.course} — {period.semester}
                    </h3>

                    <p className="text-xs font-semibold text-slate-300">
                      Batch {period.batch}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      {formatDate(period.startDate)} → {formatDate(period.endDate)}
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setConfirmAction({
                        type: 'deactivate',
                        period,
                      })
                    }
                    className="shrink-0 border-amber-300/30 bg-amber-400/10 font-semibold text-amber-300 hover:bg-amber-400/20 hover:text-amber-200"
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      {/* Filter and Search Bar */}
{!loading && periods.length > 0 && (
  <Card glass className="mb-6 space-y-3 p-4 sm:p-5">
    {/* Search (matches StudentSearch structure) */}
    <div className="flex w-full animate-fade-in flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-300/25 bg-violet-400/10 text-violet-300">
        <Search size={18} strokeWidth={2.2} />
      </div>

      <label className="relative block min-w-0 flex-1">
        <span className="sr-only">Search academic periods</span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by course, batch, or semester..."
          className="w-full rounded-xl border border-white/10 bg-[#0a1026]/80 py-2.5 pl-4 pr-10 text-xs font-medium text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-white/20 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10 sm:text-sm"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label="Clear academic period search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/[0.08] hover:text-slate-200 focus:outline-none"
          >
            <X size={15} />
          </button>
        )}
      </label>

      <p className="text-[11px] font-medium text-slate-500 sm:whitespace-nowrap">
        Instant filter, no reload
      </p>
    </div>

    {/* Course / Status Filters + Clear */}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <div className="sm:w-48">
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="w-full cursor-pointer rounded-xl border border-white/10 bg-[#0a1026]/80 px-3.5 py-2.5 text-xs font-semibold text-slate-100 outline-none transition-all hover:border-white/20 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10 [&>option]:bg-[#0a1026] sm:text-sm"
        >
          <option value="ALL">All Courses ({periods.length})</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:w-44">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full cursor-pointer rounded-xl border border-white/10 bg-[#0a1026]/80 px-3.5 py-2.5 text-xs font-semibold text-slate-100 outline-none transition-all hover:border-white/20 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10 [&>option]:bg-[#0a1026] sm:text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active Only</option>
          <option value="INACTIVE">Inactive Only</option>
        </select>
      </div>

      {hasFilters && (
        <Button
          variant="secondary"
          icon={X}
          onClick={clearFilters}
          size="md"
          className="shrink-0 font-semibold"
        >
          Clear
        </Button>
      )}
    </div>
  </Card>
)}
      {/* Main Table Content */}
      {loading ? (
        <Card glass className="space-y-4 p-5 sm:p-8">
          <div className="skeleton-block h-8 w-44 rounded-lg" />
          <div className="skeleton-block h-44 w-full rounded-xl" />
        </Card>
      ) : periods.length === 0 ? (
        <Card glass className="p-5 sm:p-8">
          <EmptyState
            title="No academic periods scheduled"
            description="Create your first academic period to manage semester terms, courses, and attendance."
            action={{
              variant: 'primary',
              icon: Plus,
              children: 'Schedule Academic Period',
              onClick: () => setModal('create'),
            }}
          />
        </Card>
      ) : filteredPeriods.length === 0 ? (
        <Card glass className="p-5 sm:p-8">
          <EmptyState
            title="No matching periods found"
            description="No academic periods match your current search query or active filter settings."
            action={{
              variant: 'secondary',
              children: 'Clear Filters',
              onClick: clearFilters,
            }}
          />
        </Card>
      ) : (
        <AcademicPeriodTable
          periods={filteredPeriods}
          onEdit={(period) => setModal(period)}
          onActivate={(period) =>
            setConfirmAction({
              type: 'activate',
              period,
            })
          }
          onDeactivate={(period) =>
            setConfirmAction({
              type: 'deactivate',
              period,
            })
          }
          onDelete={(period) => {
            if (period.active) {
              setError('An active academic period cannot be deleted. Deactivate it first.');
              return;
            }
            setConfirmAction({
              type: 'delete',
              period,
            })
          }}
        />
      )}

      {/* Schedule / Edit Modal */}
      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={
          modal === 'create'
            ? 'Schedule Academic Period'
            : 'Update Academic Period'
        }
        size="lg"
      >
        <AcademicPeriodForm
          initialData={modal === 'create' ? null : modal}
          onSubmit={handleSubmit}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* Action Confirmation Modal */}
      <ConfirmationModal
        open={Boolean(confirmAction)}
        title={
          confirmAction?.type === 'delete'
            ? 'Delete Academic Period'
            : confirmAction?.type === 'activate'
              ? 'Activate Academic Period'
              : 'Deactivate Academic Period'
        }
        message={
          confirmAction?.type === 'delete'
            ? `Are you sure you want to delete ${confirmAction?.period?.course} (${confirmAction?.period?.batch}, ${confirmAction?.period?.semester})? This action cannot be undone.`
            : confirmAction?.type === 'activate'
              ? `Are you sure you want to activate ${confirmAction?.period?.course} (${confirmAction?.period?.batch}) as the live operational period?`
              : `Are you sure you want to deactivate ${confirmAction?.period?.course} (${confirmAction?.period?.batch})?`
        }
        confirmText={
          confirmAction?.type === 'delete'
            ? 'Delete Period'
            : confirmAction?.type === 'activate'
              ? 'Activate'
              : 'Deactivate'
        }
        cancelText="Cancel"
        loading={actionLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
    </AnimatedGradientBackground>
  );
}
