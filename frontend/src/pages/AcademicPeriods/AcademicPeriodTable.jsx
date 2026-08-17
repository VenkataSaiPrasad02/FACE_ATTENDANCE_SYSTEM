import { motion } from 'framer-motion';
import {
  Edit3,
  Power,
  PowerOff,
  Trash2,
  CalendarDays,
  BookOpen,
  Layers3,
  GraduationCap,
  Clock3,
} from 'lucide-react';

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AcademicPeriodTable({
  periods = [],
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}) {
  return (
    <div className="w-full">

      {/* =========================
          TABLE CARD
      ========================== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">

        {/* =========================
            TABLE HEADER
        ========================== */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="text-base font-bold tracking-tight text-slate-900">
                Academic Periods
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Manage academic courses, batches, semesters and their active status.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-blue-500" />

              <span className="text-xs font-semibold text-slate-600">
                {periods.length}{' '}
                {periods.length === 1 ? 'Period' : 'Periods'}
              </span>
            </div>

          </div>
        </div>

        {/* =========================
            EMPTY STATE
        ========================== */}
        {periods.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-16 text-center">

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <CalendarDays
                size={28}
                className="text-slate-400"
              />
            </div>

            <h3 className="text-base font-bold text-slate-800">
              No academic periods found
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create an academic period to start managing courses,
              batches and semesters.
            </p>

          </div>
        ) : (

          /* =========================
             RESPONSIVE TABLE
          ========================== */
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px]">

              {/* =========================
                  TABLE HEAD
              ========================== */}
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">

                  <th className="w-16 px-6 py-4 text-left">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      #
                    </span>
                  </th>

                  <th className="px-5 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <BookOpen
                        size={14}
                        className="text-slate-400"
                      />

                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Course
                      </span>
                    </div>
                  </th>

                  <th className="px-5 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <GraduationCap
                        size={14}
                        className="text-slate-400"
                      />

                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Batch
                      </span>
                    </div>
                  </th>

                  <th className="px-5 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Layers3
                        size={14}
                        className="text-slate-400"
                      />

                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Semester
                      </span>
                    </div>
                  </th>

                  <th className="px-5 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={14}
                        className="text-slate-400"
                      />

                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Start Date
                      </span>
                    </div>
                  </th>

                  <th className="px-5 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Clock3
                        size={14}
                        className="text-slate-400"
                      />

                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        End Date
                      </span>
                    </div>
                  </th>

                  <th className="px-5 py-4 text-left">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </span>
                  </th>

                  <th className="px-6 py-4 text-right">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </span>
                  </th>

                </tr>
              </thead>

              {/* =========================
                  TABLE BODY
              ========================== */}
              <tbody className="divide-y divide-slate-100">

                {periods.map((period, index) => (

                  <motion.tr
                    key={period.id}
                    initial={{
                      opacity: 0,
                      y: 6,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.22,
                      delay: Math.min(index * 0.025, 0.25),
                    }}
                    className="group transition-colors duration-200 hover:bg-slate-50/70"
                  >

                    {/* =====================
                        NUMBER
                    ====================== */}
                    <td className="px-6 py-5 align-middle">

                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                        {index + 1}
                      </span>

                    </td>

                    {/* =====================
                        COURSE
                    ====================== */}
                    <td className="px-5 py-5 align-middle">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <BookOpen size={17} />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {period.course || '—'}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            Academic Course
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* =====================
                        BATCH
                    ====================== */}
                    <td className="px-5 py-5 align-middle">

                      <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                        {period.batch || '—'}
                      </span>

                    </td>

                    {/* =====================
                        SEMESTER
                    ====================== */}
                    <td className="px-5 py-5 align-middle">

                      <div className="flex items-center gap-2">

                        <Layers3
                          size={15}
                          className="text-slate-400"
                        />

                        <span className="text-sm font-medium text-slate-700">
                          {period.semester || '—'}
                        </span>

                      </div>

                    </td>

                    {/* =====================
                        START DATE
                    ====================== */}
                    <td className="px-5 py-5 align-middle">

                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {formatDate(period.startDate)}
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Start
                        </p>
                      </div>

                    </td>

                    {/* =====================
                        END DATE
                    ====================== */}
                    <td className="px-5 py-5 align-middle">

                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {formatDate(period.endDate)}
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          End
                        </p>
                      </div>

                    </td>

                    {/* =====================
                        STATUS
                    ====================== */}
                    <td className="px-5 py-5 align-middle">

                      {period.active ? (

                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">

                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                          </span>

                          <span className="text-xs font-bold text-emerald-700">
                            Active
                          </span>

                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">

                          <span className="h-2 w-2 rounded-full bg-slate-400" />

                          <span className="text-xs font-semibold text-slate-500">
                            Inactive
                          </span>

                        </span>

                      )}

                    </td>

                    {/* =====================
                        ACTIONS
                    ====================== */}
                    <td className="px-6 py-5 align-middle">

                      <div className="flex items-center justify-end gap-1.5">

                        {/* Edit */}
                        <motion.button
                          type="button"
                          whileHover={{
                            scale: 1.06,
                          }}
                          whileTap={{
                            scale: 0.94,
                          }}
                          onClick={() => onEdit?.(period)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
                          title="Edit academic period"
                          aria-label="Edit academic period"
                        >
                          <Edit3 size={16} />
                        </motion.button>

                        {/* Activate */}
                        {!period.active && (
                          <motion.button
                            type="button"
                            whileHover={{
                              scale: 1.06,
                            }}
                            whileTap={{
                              scale: 0.94,
                            }}
                            onClick={() => onActivate?.(period)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600"
                            title="Activate academic period"
                            aria-label="Activate academic period"
                          >
                            <Power size={16} />
                          </motion.button>
                        )}

                        {/* Deactivate */}
                        {period.active && (
                          <motion.button
                            type="button"
                            whileHover={{
                              scale: 1.06,
                            }}
                            whileTap={{
                              scale: 0.94,
                            }}
                            onClick={() => onDeactivate?.(period)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-amber-50 hover:text-amber-600"
                            title="Deactivate academic period"
                            aria-label="Deactivate academic period"
                          >
                            <PowerOff size={16} />
                          </motion.button>
                        )}

                        {/* Delete */}
                        <motion.button
                          type="button"
                          whileHover={{
                            scale: 1.06,
                          }}
                          whileTap={{
                            scale: 0.94,
                          }}
                          onClick={() => onDelete?.(period)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                          title="Delete academic period"
                          aria-label="Delete academic period"
                        >
                          <Trash2 size={16} />
                        </motion.button>

                      </div>

                    </td>

                  </motion.tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}