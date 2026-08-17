import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';

import studentService from '../../services/studentService';

import StudentTable from './StudentTable';
import StudentSearch from './StudentSearch';
import StudentForm from './StudentForm';
import StudentsSkeleton from './StudentsSkeleton';

import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import ConfirmationModal from '../../components/ConfirmationModal';

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
  const [deleteTarget, setDeleteTarget] = useState(null); // the student object pending deletion
  const [deleting, setDeleting] = useState(false); // true while the existing DELETE API call is in-flight

  const { role } = useAuth();

  const canManageStudentsForUser = canManageStudents(role);


  // ==========================================================
  // LOAD STUDENTS
  // ==========================================================

  const load = (
    pageNumber = 0,
    searchQuery = search
  ) => {

    setLoading(true);
    setError('');

    studentService
      .getAll(
        pageNumber,
        10,
        searchQuery
      )
      .then((data) => {

        setPage(data);

      })
      .catch((e) => {

        setError(
          e?.response?.data?.message ||
          'Failed to load students'
        );

      })
      .finally(() => {

        setLoading(false);

      });
  };


  // ==========================================================
  // INITIAL LOAD / PAGE CHANGE
  // ==========================================================

  useEffect(() => {

    load(currentPage);

  }, [currentPage]);


  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = (query) => {

    setSearch(query);
    setCurrentPage(0);

    load(0, query);

  };


  // ==========================================================
  // DELETE
  // ADMIN + TEACHER
  // ==========================================================

  // Step 1: user clicks delete -> just open the confirmation modal.
  // Receives the full student object (from StudentTable) so we can
  // show their name in the modal.
  const handleDeleteClick = (student) => {
    setDeleteTarget(student);
  };

  // Step 2: user confirms in the modal -> run the existing DELETE API.
  const handleConfirmDelete = async () => {

    if (!deleteTarget) return;

    setDeleting(true);

    try {

      await studentService.remove(deleteTarget.id);

      setDeleteTarget(null);
      load(currentPage);

      toast.success('Student deleted successfully');

    } catch (e) {

      const message =
        e?.response?.data?.message ||
        'Delete failed';

      toast.error(message);

    } finally {

      setDeleting(false);

    }
  };

  const handleCancelDelete = () => {
    if (deleting) return; // prevent closing mid-request
    setDeleteTarget(null);
  };


  // ==========================================================
  // CREATE / UPDATE
  // ADMIN + TEACHER
  // ==========================================================

  const handleSubmit = async (data) => {

    try {

      const isCreate = modal === 'create';

      if (isCreate) {

        await studentService.create(data);

      } else {

        await studentService.update(
          modal.id,
          data
        );

      }

      setModal(null);

      load(currentPage);

      toast.success(
        isCreate
          ? 'Student created successfully'
          : 'Student updated successfully'
      );

    } catch (e) {

      const message =
        e?.response?.data?.message ||
        'Save failed';

      toast.error(message);

    }
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="mx-auto max-w-7xl"
    >

      {/* ====================================================
          HEADER
         ==================================================== */}

      <div className="mb-7">

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <h1 className="mb-1 text-3xl font-bold text-gray-900">
              Students
            </h1>

            <p className="text-base text-gray-500">
              Manage and register student biometric data
            </p>

          </div>


          {/* ADD STUDENT */}

          {canManageStudentsForUser && (

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              transition={{
                delay: 0.2
              }}
            >

              <Button
                variant="primary"
                icon={Plus}
                onClick={() =>
                  setModal('create')
                }
                className="w-full shadow-lg shadow-blue-500/30 sm:w-auto"
              >
                Add Student
              </Button>

            </motion.div>

          )}

        </div>


        {/* ==================================================
            SEARCH
           ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.1
          }}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
        >

          <StudentSearch
            onSearch={handleSearch}
          />

        </motion.div>

      </div>


      {/* ====================================================
          ERROR
         ==================================================== */}

      {error && (

        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="mb-6"
        >

          <ErrorState
            title="Error"
            message={error}
            onRetry={() =>
              load(currentPage)
            }
          />

        </motion.div>

      )}


      {/* ====================================================
          CONTENT
         ==================================================== */}

      {loading ? (

        <StudentsSkeleton />

      ) : !page?.content ||
        page.content.length === 0 ? (

        search ? (

          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
          >

            <EmptyState
              title="No results found"
              description={
                `No students match "${search}"`
              }
              action={{
                variant: 'secondary',
                children: 'Clear Search',
                onClick: () =>
                  handleSearch('')
              }}
            />

          </motion.div>

        ) : (

          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
          >

            <EmptyState
              title="No students yet"
              description="Add your first student to get started with face registration and attendance tracking."
              action={{
                variant: 'primary',
                icon: Plus,
                children: 'Add Student',
                onClick: () =>
                  setModal('create')
              }}
            />

          </motion.div>

        )

      ) : (

        <StudentTable
          students={page.content}
          onEdit={(student) =>
            setModal(student)
          }
          onDelete={handleDeleteClick}
          pagination={page}
          onPageChange={(newPage) => {
            setCurrentPage(newPage);
          }}
        />

      )}


      {/* ====================================================
          STUDENT MODAL
         ==================================================== */}

      <AnimatePresence>

        {modal && (

          <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={() =>
              setModal(null)
            }
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20
              }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300
              }}
              className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-8"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <h3 className="mb-6 text-2xl font-bold text-gray-900">

                {modal === 'create'
                  ? '✨ Add New Student'
                  : '✏️ Edit Student'}

              </h3>


              <StudentForm
                initialData={
                  modal === 'create'
                    ? null
                    : modal
                }
                onSubmit={handleSubmit}
                onCancel={() =>
                  setModal(null)
                }
              />

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>


      {/* ====================================================
          DELETE CONFIRMATION MODAL
         ==================================================== */}

      <ConfirmationModal
        open={!!deleteTarget}
        title="Confirm Deletion"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.fullName}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

    </motion.div>
  );
}