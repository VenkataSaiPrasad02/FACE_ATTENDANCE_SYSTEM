import React, { useEffect, useMemo, useState } from 'react';
import AnimatedGradientBackground from '../../components/ui/AnimatedGradientBackground';
import {
  Plus,
  Search,
  Users,
  Building2,
  SlidersHorizontal,
  X,
  GraduationCap,
} from 'lucide-react';

import teacherService from '../../services/teacherService';

import TeacherTable from './TeacherTable';
import TeacherForm from './TeacherForm';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import ConfirmationModal from '../../components/ConfirmationModal';
import Modal from '../../components/ui/Modal';
import StatsCard from '../Dashboard/StatsCard';

export default function TeachersPage() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');

  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load teachers
  const loadTeachers = async (page = currentPage) => {
    try {
      setLoading(true);
      setError('');
      const response = await teacherService.getAll(page, pageSize);
      setPageData(response);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load teachers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers(currentPage);
  }, [currentPage]);

  // Departments list from real data
  const departments = useMemo(() => {
    const values = new Set();
    pageData?.content?.forEach((teacher) => {
      if (teacher.department?.trim()) {
        values.add(teacher.department.trim());
      }
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [pageData]);

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (pageData?.content || [])
      .filter((teacher) => {
        const matchesSearch =
          !query ||
          teacher.username?.toLowerCase().includes(query) ||
          teacher.fullName?.toLowerCase().includes(query) ||
          teacher.email?.toLowerCase().includes(query) ||
          teacher.phone?.toLowerCase().includes(query);

        const matchesDepartment =
          department === 'ALL' || teacher.department === department;

        return matchesSearch && matchesDepartment;
      })
      .sort((a, b) => (a.username || '').localeCompare(b.username || ''));
  }, [pageData, search, department]);

  // Summary Metrics from real data
  const summary = useMemo(() => {
    const totalTeachers = pageData?.totalElements ?? 0;
    const totalDepartments = departments.length;
    return {
      totalTeachers,
      totalDepartments,
    };
  }, [pageData, departments]);

  // Create / Update
  const handleSubmit = async (data) => {
    try {
      if (modal === 'create') {
        await teacherService.create(data);
      } else {
        await teacherService.update(modal.id, data);
      }
      setModal(null);
      await loadTeachers(currentPage);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save teacher.');
    }
  };

  // Delete
  const handleDeleteClick = (teacher) => {
    setDeleteTarget(teacher);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await teacherService.remove(deleteTarget.id);
      setDeleteTarget(null);

      if (pageData?.number > 0 && pageData?.numberOfElements === 1) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadTeachers(currentPage);
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to delete teacher.');
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDepartment('ALL');
  };

  const hasFilters = search.trim() !== '' || department !== 'ALL';

  return (
    <AnimatedGradientBackground
  type="faculty"
  className="min-h-full rounded-2xl"
>
    <div className="w-full animate-fade-in pb-8">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xs">
            <GraduationCap size={24} strokeWidth={2} />
          </div>

          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Faculty Directory
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Teachers & Faculty
            </h1>

            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Manage instructional staff, assigned academic departments, and access credentials.
            </p>
          </div>
        </div>

        {/* Add Teacher Button */}
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setModal('create')}
          size="lg"
          className="w-full sm:w-auto shadow-sm font-bold"
        >
          Add Teacher
        </Button>
      </div>

      {/* Summary KPI Cards */}
      {pageData && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Faculty"
            value={summary.totalTeachers}
            icon={Users}
            colorScheme="blue"
            subtitle="Registered"
            detail="Active teaching staff"
          />

          <StatsCard
            title="Departments"
            value={summary.totalDepartments}
            icon={Building2}
            colorScheme="emerald"
            subtitle="Academic"
            detail="Active disciplines"
          />

          <StatsCard
            title="Showing in View"
            value={filteredTeachers.length}
            icon={SlidersHorizontal}
            colorScheme="amber"
            subtitle="Filtered"
            detail={hasFilters ? 'Filtered results' : 'Complete page roster'}
          />
        </div>
      )}

      {/* Search & Filter Bar */}
<Card glass className="mb-6 p-4 sm:p-5 space-y-3">
  {/* Search Input (matches StudentSearch structure) */}
  <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center animate-fade-in">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
      <Search size={18} strokeWidth={2.2} />
    </div>

    <label className="relative block min-w-0 flex-1">
      <span className="sr-only">Search faculty directory</span>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search faculty by name, username, email, or phone..."
        className="w-full rounded-xl border border-slate-200/90 bg-white py-2.5 pl-4 pr-10 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
      />

      {search && (
        <button
          type="button"
          onClick={() => setSearch('')}
          aria-label="Clear faculty search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
        >
          <X size={15} />
        </button>
      )}
    </label>

    <p className="text-[11px] font-medium text-slate-400 sm:whitespace-nowrap">
      Instant filter, no reload
    </p>
  </div>

  {/* Department Filter + Clear */}
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
    <div className="sm:w-56">
      <select
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition-all hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
      >
        <option value="ALL">All Departments ({summary.totalTeachers})</option>
        {departments.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
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
      {/* Error Callout */}
      {error && (
        <div className="mb-6">
          <ErrorState
            title="Failed to load faculty"
            message={error}
            onRetry={() => loadTeachers(currentPage)}
          />
        </div>
      )}

      {/* Main Table or Empty State */}
      {loading ? (
        <Card glass className="p-8 space-y-4">
          <div className="h-8 w-44 rounded-lg bg-slate-200 animate-shimmer" />
          <div className="h-40 w-full rounded-xl bg-slate-200/60 animate-shimmer" />
        </Card>
      ) : filteredTeachers.length === 0 ? (
        <Card glass className="p-8">
          <EmptyState
            title={hasFilters ? 'No matching faculty members' : 'No teachers registered'}
            description={
              hasFilters
                ? 'Try adjusting your search criteria or department filter.'
                : 'Add teaching faculty members to assign them to courses and departments.'
            }
            action={
              hasFilters
                ? {
                    variant: 'secondary',
                    children: 'Clear Filters',
                    onClick: clearFilters,
                  }
                : {
                    variant: 'primary',
                    icon: Plus,
                    children: 'Add Teacher',
                    onClick: () => setModal('create'),
                  }
            }
          />
        </Card>
      ) : (
        <TeacherTable
          teachers={filteredTeachers}
          onEdit={(teacher) => setModal(teacher)}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Add New Faculty Member' : 'Edit Faculty Details'}
        size="lg"
      >
        <TeacherForm
          initialData={modal === 'create' ? null : modal}
          onSubmit={handleSubmit}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Delete Faculty Member"
        message={
          deleteTarget
            ? `Are you sure you want to remove ${deleteTarget.fullName || deleteTarget.username}? This action cannot be undone.`
            : ''
        }
        confirmText="Delete Teacher"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
    </AnimatedGradientBackground>
  );
}