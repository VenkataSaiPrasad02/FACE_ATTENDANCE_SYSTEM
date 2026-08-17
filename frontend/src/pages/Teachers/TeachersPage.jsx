import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus,
  Search,
  Users,
  UserCheck,
  Building2,
  Clock,
  SlidersHorizontal,
  X
} from 'lucide-react';

import teacherService from '../../services/teacherService';

import TeacherTable from './TeacherTable';
import TeacherForm from './TeacherForm';

export default function TeachersPage() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [pageData, setPageData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');

  const [modal, setModal] = useState(null);


  // ==========================================================
  // LOAD TEACHERS
  // ==========================================================

  const loadTeachers = async (
    page = currentPage
  ) => {

    try {

      setLoading(true);
      setError('');

      const response =
        await teacherService.getAll(
          page,
          pageSize
        );

      setPageData(response);

    } catch (e) {

      setError(
        e?.response?.data?.message ||
        'Failed to load teachers.'
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // INITIAL LOAD / PAGE CHANGE
  // ==========================================================

  useEffect(() => {

    loadTeachers(currentPage);

  }, [currentPage]);


  // ==========================================================
  // DEPARTMENTS
  // ==========================================================

  const departments = useMemo(() => {

    const values = new Set();

    pageData?.content?.forEach((teacher) => {

      if (teacher.department?.trim()) {

        values.add(
          teacher.department.trim()
        );

      }

    });

    return Array.from(values).sort(
      (a, b) => a.localeCompare(b)
    );

  }, [pageData]);


  // ==========================================================
  // FILTER CURRENT PAGE
  // ==========================================================

  const filteredTeachers = useMemo(() => {

    const query =
      search.trim().toLowerCase();

    return (pageData?.content || [])
      .filter((teacher) => {

        const matchesSearch =
          !query ||
          teacher.username
            ?.toLowerCase()
            .includes(query) ||
          teacher.email
            ?.toLowerCase()
            .includes(query) ||
          teacher.phone
            ?.toLowerCase()
            .includes(query);

        const matchesDepartment =
          department === 'ALL' ||
          teacher.department === department;

        return (
          matchesSearch &&
          matchesDepartment
        );

      })
      .sort((a, b) =>
        (a.username || '').localeCompare(
          b.username || ''
        )
      );

  }, [
    pageData,
    search,
    department
  ]);


  // ==========================================================
  // SUMMARY METRICS (derived from real data only)
  // ==========================================================

  const summary = useMemo(() => {

    const totalTeachers =
      pageData?.totalElements ?? 0;

    const totalDepartments =
      departments.length;

    /*
     * "Recently added" = teachers created within
     * the last 7 days, only if createdAt is present
     * on the teacher response. If it isn't, we don't
     * fabricate this metric.
     */

    const hasCreatedAt =
      (pageData?.content || []).some(
        (t) => Boolean(t.createdAt)
      );

    let recentlyAdded = null;

    if (hasCreatedAt) {

      const sevenDaysAgo =
        Date.now() - 7 * 24 * 60 * 60 * 1000;

      recentlyAdded =
        (pageData?.content || []).filter((t) => {

          const created =
            new Date(t.createdAt).getTime();

          return (
            !Number.isNaN(created) &&
            created >= sevenDaysAgo
          );

        }).length;

    }

    return {
      totalTeachers,
      totalDepartments,
      recentlyAdded
    };

  }, [pageData, departments]);


  // ==========================================================
  // CREATE / UPDATE
  // ==========================================================

  const handleSubmit = async (data) => {

    try {

      if (modal === 'create') {

        await teacherService.create(data);

      } else {

        await teacherService.update(
          modal.id,
          data
        );

      }

      setModal(null);

      await loadTeachers(currentPage);

    } catch (e) {

      setError(
        e?.response?.data?.message ||
        'Failed to save teacher.'
      );

    }

  };


  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (teacher) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${teacher.username}?`
      );

    if (!confirmed) {
      return;
    }

    try {

      await teacherService.remove(
        teacher.id
      );

      /*
       * If the deleted teacher was the
       * only teacher on the current page,
       * go back one page.
       */

      if (
        pageData?.number > 0 &&
        pageData?.numberOfElements === 1
      ) {

        setCurrentPage(
          currentPage - 1
        );

      } else {

        await loadTeachers(
          currentPage
        );

      }

    } catch (e) {

      setError(
        e?.response?.data?.message ||
        'Failed to delete teacher.'
      );

    }

  };


  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {

    setSearch('');
    setDepartment('ALL');

  };


  const hasFilters =
    search.trim() !== '' ||
    department !== 'ALL';


  const teachers =
    filteredTeachers;


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

      transition={{
        duration: 0.45,
        ease: 'easeOut'
      }}

      className="mx-auto max-w-[1600px] px-4 pb-10 sm:px-6 lg:px-10"
    >


      {/* ======================================================
          HEADER
         ====================================================== */}

      <motion.div

        initial={{
          opacity: 0,
          y: -15
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        transition={{
          duration: 0.45
        }}

        className="mb-8 flex flex-col gap-5 pt-2 sm:flex-row sm:items-center sm:justify-between"
      >

        <div>

          <div className="mb-2 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <Users size={21} />
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
              Faculty Management
            </span>

          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Teachers
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Manage teaching staff and their account information.
          </p>

        </div>


        <motion.button

          type="button"

          whileHover={{
            scale: 1.03,
            y: -2
          }}

          whileTap={{
            scale: 0.97
          }}

          onClick={() =>
            setModal('create')
          }

          className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700"
        >

          <Plus
            size={19}
            className="transition-transform duration-200 group-hover:rotate-90"
          />

          Add Teacher

        </motion.button>

      </motion.div>


      {/* ======================================================
          SUMMARY CARDS
         ====================================================== */}

      <motion.div

        initial={{
          opacity: 0,
          y: 15
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        transition={{
          delay: 0.05,
          duration: 0.4
        }}

        className={`mb-6 grid gap-4 ${
          summary.recentlyAdded !== null
            ? 'sm:grid-cols-3'
            : 'sm:grid-cols-2'
        }`}
      >

        {/* Total Teachers */}

        <div className="rounded-2xl border border-gray-200/80 bg-white px-8 py-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="translate-x-4">
              <p className="text-sm font-medium text-gray-500">
                Total Teachers
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {summary.totalTeachers}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={22} />
            </div>

          </div>

        </div>


        {/* Departments */}

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="translate-x-4">
              <p className="text-sm font-medium text-gray-500">
                Departments
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {summary.totalDepartments}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 size={22} />
            </div>

          </div>

        </div>


        {/* Recently Added — only shown if createdAt exists on the data */}

        {summary.recentlyAdded !== null && (

          <div className="rounded-2xl border border-gray-200/80 bg-white px-8 py-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="translate-x-4">
                <p className="text-sm font-medium text-gray-500">
                  Recently Added
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {summary.recentlyAdded}
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                     Last 7 days
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Clock size={22} />
              </div>

            </div>

          </div>

        )}

      </motion.div>


{/* ======================================================
          SEARCH + FILTER
         ====================================================== */}

      <motion.div

        initial={{
          opacity: 0,
          y: 15
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        transition={{
          delay: 0.1,
          duration: 0.4
        }}

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
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search by teacher name, email or phone..."
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


        {/* Department */}

        <div className="group flex h-12 items-stretch overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-all duration-200 hover:border-gray-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 sm:w-60">

          <div className="flex w-11 shrink-0 items-center justify-center text-gray-400 transition-colors group-focus-within:text-blue-600">
            <Building2 size={17} />
          </div>

          <select

            value={department}

            onChange={(e) =>
              setDepartment(e.target.value)
            }

            className="h-full w-full cursor-pointer appearance-none bg-transparent pr-9 text-sm font-medium text-gray-700 outline-none"
          >

            <option value="ALL">
              All Departments
            </option>

            {departments.map((item) => (

              <option
                key={item}
                value={item}
              >
                {item}
              </option>

            ))}

          </select>

          <div className="pointer-events-none flex w-9 shrink-0 items-center justify-center text-gray-400">
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </div>

        </div>


        {/* Clear filters */}

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
      {/* ======================================================
          ERROR
         ====================================================== */}

      <AnimatePresence>

        {error && (

          <motion.div

            initial={{
              opacity: 0,
              y: -8
            }}

            animate={{
              opacity: 1,
              y: 0
            }}

            exit={{
              opacity: 0,
              y: -8
            }}

            className="mb-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-5 py-4 text-sm text-red-700 shadow-sm"
          >

            <div className="flex items-center justify-between gap-3">

              <div className="flex items-center gap-3">

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">

                  ⚠️

                </span>

                <span>
                  {error}
                </span>

              </div>


              <button

                type="button"

                onClick={() =>
                  setError('')
                }

                className="rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
              >

                <X size={16} />

              </button>

            </div>

          </motion.div>

        )}

      </AnimatePresence>



      {/* ======================================================
          LOADING
         ====================================================== */}

      {loading ? (

        <motion.div

          initial={{
            opacity: 0
          }}

          animate={{
            opacity: 1
          }}

          className="rounded-2xl border border-gray-200 bg-white p-12 shadow-sm"
        >

          <div className="flex flex-col items-center justify-center">

            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="mt-4 text-sm font-semibold text-gray-600">

              Loading teachers...

            </p>

            <p className="mt-1 text-xs text-gray-400">

              Fetching faculty information

            </p>

          </div>

        </motion.div>


      ) : teachers.length === 0 ? (


        /* ====================================================
           EMPTY STATE
           ==================================================== */

        <motion.div

          initial={{
            opacity: 0,
            scale: 0.98
          }}

          animate={{
            opacity: 1,
            scale: 1
          }}

          className="rounded-2xl border border-gray-200 bg-linear-to-br from-white to-blue-50/40 p-16 text-center shadow-sm"
        >

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">

            <Users size={28} />

          </div>


          <h3 className="mt-5 text-lg font-bold text-gray-900">

            No teachers found

          </h3>


          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">

            {hasFilters
              ? 'There are no teachers matching your current search/filter.'
              : 'There are no teachers available yet. Add your first teacher to get started.'}

          </p>


          {hasFilters ? (

            <button

              type="button"

              onClick={clearFilters}

              className="mt-6 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            >

              Clear Filters

            </button>

          ) : (

            <button

              type="button"

              onClick={() =>
                setModal('create')
              }

              className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5"
            >

              <Plus
                size={16}
                className="mr-2 inline"
              />

              Add Teacher

            </button>

          )}

        </motion.div>


      ) : (


        /* ====================================================
           TEACHER TABLE
           ==================================================== */

        <TeacherTable

          teachers={teachers}

          onEdit={(teacher) =>
            setModal(teacher)
          }

          onDelete={handleDelete}

          pagination={pageData}

          onPageChange={(newPage) =>
            setCurrentPage(newPage)
          }

        />

      )}



      {/* ======================================================
          ADD / UPDATE TEACHER MODAL
         ====================================================== */}

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

            className="fixed inset-0 z-1000 flex items-center justify-center bg-slate-950/50 p-5 backdrop-blur-md sm:p-8"
            onClick={() =>
              setModal(null)
            }
          >

            <motion.div

              initial={{
                opacity: 0,
                scale: 0.94,
                y: 20
              }}

              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}

              exit={{
                opacity: 0,
                scale: 0.94,
                y: 20
              }}

              transition={{
                type: 'spring',
                damping: 24,
                stiffness: 280
              }}

              className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/60 bg-white p-6 shadow-2xl shadow-black/20 sm:p-8"

              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* Modal header */}

              <div className="mb-7 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-5 shadow-lg shadow-indigo-500/15">

                <div className="flex items-center gap-3">

                  <motion.div

                    initial={{
                      rotate: -10,
                      scale: 0.8
                    }}

                    animate={{
                      rotate: 0,
                      scale: 1
                    }}

                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl text-white backdrop-blur-sm"
                  >

                    👨‍🏫

                  </motion.div>


                  <div className="min-w-0 flex-1">

                    <h2 className="text-xl font-bold text-white">

                      {modal === 'create'
                        ? 'Add New Teacher'
                        : 'Update Teacher'}

                    </h2>


                    <p className="mt-1 text-xs text-blue-100">

                      {modal === 'create'
                        ? 'Create a new faculty account'
                        : 'Update teacher information'}

                    </p>

                  </div>


                  <button

                    type="button"

                    onClick={() =>
                      setModal(null)
                    }

                    className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                    title="Close"
                  >

                    <X size={19} />

                  </button>

                </div>

              </div>


              {/* Teacher form */}

              <TeacherForm

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

    </motion.div>
  );
}