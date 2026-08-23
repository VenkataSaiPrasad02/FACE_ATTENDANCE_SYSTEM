import React, { useEffect, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { toast } from 'react-toastify';

import studentService from '../../services/studentService';
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

export default function StudentsPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const [modal, setModal] = useState(null);

  // UI-only state for the delete confirmation flow
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { role } = useAuth();
  const canManageStudentsForUser = canManageStudents(role);

  // Load students
  const load = (pageNumber = 0, searchQuery = search) => {
    setLoading(true);
    setError('');

    studentService
      .getAll(pageNumber, 10, searchQuery)
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

  // Initial load / page change
  useEffect(() => {
    load(currentPage);
  }, [currentPage]);

  // Search
  const handleSearch = (query) => {
    setSearch(query);
    setCurrentPage(0);
    load(0, query);
  };

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
          <Card glass className="p-8">
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
          <Card glass className="p-8">
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
        />
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
