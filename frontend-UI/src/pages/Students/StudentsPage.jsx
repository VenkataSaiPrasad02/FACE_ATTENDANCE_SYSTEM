import React, { useEffect, useState } from 'react';
import { Plus, Users, SlidersHorizontal, X, CalendarPlus } from 'lucide-react';
import { toast } from 'react-toastify';

import studentService from '../../services/studentService';
import teacherService from '../../services/teacherService';
import attendanceService from '../../services/attendanceService';
import AnimatedGradientBackground from '../../components/ui/AnimatedGradientBackground';

import StudentTable from './StudentTable';
import StudentSearch from './StudentSearch';
import StudentForm from './StudentForm';
import StudentsSkeleton from './StudentsSkeleton';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import ConfirmationModal from '../../components/ConfirmationModal';
import Modal from '../../components/ui/Modal';

import { useAuth } from '../../hooks/useAuth';
import { canManageStudents } from '../../auth/roles';

const EMPTY_FILTERS = { course: '', batch: '', semester: '', year: '', teacherId: '' };

export default function StudentsPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filterOptions, setFilterOptions] = useState(null);
  const [teachers, setTeachers] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);

  const [modal, setModal] = useState(null);

  // Manual attendance flow (audit-trailed on the backend)
  const [markTarget, setMarkTarget] = useState(null);
  const [markDate, setMarkDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [marking, setMarking] = useState(false);

  // UI-only state for the delete confirmation flow
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { role } = useAuth();
  const canManageStudentsForUser = canManageStudents(role);

  // Load students (server-side search + filters — never the full table)
  const load = (
    pageNumber = 0,
    searchQuery = search,
    activeFilters = filters
  ) => {
    setLoading(true);
    setError('');

    studentService
      .getAll({ page: pageNumber, size: 10, search: searchQuery, ...activeFilters })
      .then((data) => {
        setPage(data);
      })
      .catch((e) => {
        setError(e?.response?.data?.message || 'Failed to load students');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Initial load / page change / filter change
  useEffect(() => {
    load(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Dropdown values for the filter bar (independent of pagination)
  useEffect(() => {
    studentService
      .getFilterOptions()
      .then(setFilterOptions)
      .catch(() => setFilterOptions(null));

    // Teacher options for the teacher filter + student form assignment
    teacherService
      .getAll(0, 200)
      .then((data) => setTeachers(Array.isArray(data?.content) ? data.content : []))
      .catch(() => setTeachers([]));
  }, []);

  // Search
  const handleSearch = (query) => {
    setSearch(query);
    setCurrentPage(0);
    load(0, query);
  };

  const applyFilters = (next) => {
    setFilters(next);
    setCurrentPage(0);
    load(0, search, next);
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  // Delete handlers
  const handleDeleteClick = (student) => {
    setDeleteTarget(student);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await studentService.remove(deleteTarget.id);
      setDeleteTarget(null);
      load(currentPage);
      toast.success('Student record removed successfully');
    } catch (e) {
      const message = e?.response?.data?.message || 'Delete failed';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  // Manual attendance (teacher/admin/super-admin; audited server-side)
  const handleMarkAttendanceClick = (student) => {
    setMarkDate(new Date().toISOString().slice(0, 10));
    setMarkTarget(student);
  };

  const handleConfirmMarkAttendance = async () => {
    if (!markTarget) return;

    setMarking(true);

    try {
      await attendanceService.markManual({
        studentId: markTarget.id,
        date: markDate,
      });
      setMarkTarget(null);
      toast.success(
        `${markTarget.fullName} marked present for ${markDate}`
      );
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Unable to mark attendance');
    } finally {
      setMarking(false);
    }
  };

  // Create / Update
  const handleSubmit = async (data) => {
    const isCreate = modal === 'create';

    if (isCreate) {
      await studentService.create(data);
    } else {
      await studentService.update(modal.id, data);
    }

    setModal(null);
    load(currentPage);

    toast.success(
      isCreate
        ? 'Student enrolled successfully'
        : 'Student record updated successfully'
    );
  };

  return (
    <AnimatedGradientBackground
  type="students"
  className="min-h-full rounded-2xl"
>
    <div className="w-full animate-fade-in pb-8">
      {/* Header */}
      <div className="animate-slide-up mb-7">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-gradient-to-br from-blue-500/20 to-cyan-400/15 text-cyan-300 shadow-glow-sm hover-lift">
              <Users size={24} strokeWidth={2} />
            </div>

            <div>
              <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
                Roster Governance
              </div>

              <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Student Directory
              </h1>

              <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                Manage student profiles, academic courses, batch cohorts, and facial biometrics status.
              </p>
            </div>
          </div>

          {/* Add Student Button */}
          {canManageStudentsForUser && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setModal('create')}
              size="lg"
              className="w-full font-bold sm:w-auto"
            >
              Add Student
            </Button>
          )}
        </div>

        {/* Search Panel */}
        <div className="animate-slide-up opacity-0" style={{ animationDelay: '80ms' }}>
          <Card glass className="p-4 sm:p-5">
            <StudentSearch onSearch={handleSearch} />

            {/* Server-side filter bar */}
            {filterOptions && (
              <div className="mt-4 border-t border-white/[0.07] pt-4">
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    <SlidersHorizontal size={12} className="text-cyan-300" />
                    Filters
                  </span>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={() => applyFilters(EMPTY_FILTERS)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      <X size={12} />
                      Clear all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                  <FilterSelect
                    value={filters.course}
                    onChange={(v) => applyFilters({ ...filters, course: v })}
                    placeholder="All courses"
                    options={(filterOptions.courses || []).map((c) => ({ value: c, label: c }))}
                  />
                  <FilterSelect
                    value={filters.batch}
                    onChange={(v) => applyFilters({ ...filters, batch: v })}
                    placeholder="All batches"
                    options={(filterOptions.batches || []).map((b) => ({ value: b, label: b }))}
                  />
                  <FilterSelect
                    value={filters.semester}
                    onChange={(v) => applyFilters({ ...filters, semester: v })}
                    placeholder="All semesters"
                    options={(filterOptions.semesters || []).map((s) => ({
                      value: String(s),
                      label: String(s),
                    }))}
                  />
                  <FilterSelect
                    value={filters.year}
                    onChange={(v) => applyFilters({ ...filters, year: v })}
                    placeholder="All years"
                    options={(filterOptions.years || []).map((y) => ({
                      value: String(y),
                      label: String(y),
                    }))}
                  />
                  <FilterSelect
                    value={filters.teacherId}
                    onChange={(v) => applyFilters({ ...filters, teacherId: v })}
                    placeholder="All teachers"
                    options={teachers.map((t) => ({
                      value: String(t.id),
                      label:
                        t.fullName ||
                        t.teacherName ||
                        t.name ||
                        `Teacher #${t.id}`,
                    }))}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Error Callout */}
      {error && (
        <div className="mb-6">
          <ErrorState
            title="Failed to load student roster"
            message={error}
            onRetry={() => load(currentPage)}
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <StudentsSkeleton />
      ) : !page?.content || page.content.length === 0 ? (
        search ? (
          <Card glass className="p-5 sm:p-8">
            <EmptyState
              title="No matching students found"
              description={`No student records match your query "${search}".`}
              action={{
                variant: 'secondary',
                children: 'Clear Search Filter',
                onClick: () => handleSearch(''),
              }}
            />
          </Card>
        ) : (
          <Card glass className="p-5 sm:p-8">
            <EmptyState
              title="No students enrolled yet"
              description="Add your first student to begin taking automated facial attendance."
              action={{
                variant: 'primary',
                icon: Plus,
                children: 'Add Student',
                onClick: () => setModal('create'),
              }}
            />
          </Card>
        )
      ) : (
        <StudentTable
          students={page.content}
          onEdit={(student) => setModal(student)}
          onDelete={handleDeleteClick}
          onMarkAttendance={canManageStudentsForUser ? handleMarkAttendanceClick : undefined}
          pagination={page}
          onPageChange={(newPage) => {
            setCurrentPage(newPage);
          }}
        />
      )}

      {/* Add / Edit Student Modal */}
      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Add New Student' : 'Edit Student Profile'}
        size="lg"
      >
        <StudentForm
          initialData={modal === 'create' ? null : modal}
          onSubmit={handleSubmit}
          onCancel={() => setModal(null)}
          teachers={teachers}
        />
      </Modal>

      {/* Manual Attendance Modal */}
      <Modal
        open={Boolean(markTarget)}
        onClose={() => !marking && setMarkTarget(null)}
        title="Mark Attendance Manually"
        size="sm"
      >
        {markTarget && (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <p className="text-sm font-bold text-white">{markTarget.fullName}</p>
              <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                {markTarget.studentNumber} • {markTarget.course}
                {markTarget.batch ? ` · ${markTarget.batch}` : ''}
                {markTarget.semester ? ` · Sem ${markTarget.semester}` : ''}
              </p>
            </div>

            <div>
              <label
                htmlFor="manual-attendance-date"
                className="mb-1.5 block text-xs font-semibold text-slate-300"
              >
                Attendance date
              </label>
              <input
                id="manual-attendance-date"
                type="date"
                value={markDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setMarkDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-[#0a1026]/80 px-3.5 text-xs font-medium text-slate-100 outline-none transition-all focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10 [color-scheme:dark]"
              />
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                The student will be marked <span className="font-semibold text-emerald-300">PRESENT</span>{' '}
                for this date. This action is recorded in the audit trail with your name.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setMarkTarget(null)}
                disabled={marking}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                size="md"
                icon={CalendarPlus}
                loading={marking}
                onClick={handleConfirmMarkAttendance}
              >
                Mark Present
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Delete Student Record"
        message={
          deleteTarget
            ? `Are you sure you want to delete student "${deleteTarget.fullName}" (${deleteTarget.studentNumber})? This will permanently remove their records and facial biometrics.`
            : ''
        }
        confirmText="Delete Student"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
    </AnimatedGradientBackground>
  );
}

function FilterSelect({ value, onChange, placeholder, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        h-11 w-full cursor-pointer appearance-none truncate rounded-xl
        border border-white/10 bg-[#0a1026]/80 px-3 text-xs sm:text-[11.5px]
        font-medium text-slate-200 outline-none backdrop-blur-md transition-all
        focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10
      "
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
