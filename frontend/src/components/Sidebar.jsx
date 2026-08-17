import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ScanFace,
  CheckCircle,
  FileText,
  GraduationCap,
  UserRound,
  CalendarDays,
  CalendarRange,
  ShieldCheck
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { hasPermission, PERMISSIONS } from '../auth/roles';

const links = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    permission: PERMISSIONS.VIEW_DASHBOARD
  },
  {
    to: '/students',
    label: 'Students',
    icon: Users,
    permission: PERMISSIONS.MANAGE_STUDENTS
  },
  {
    to: '/face-registration',
    label: 'Face Registration',
    icon: ScanFace,
    permission: PERMISSIONS.MANAGE_FACE_REGISTRATION
  },
  {
    to: '/attendance',
    label: 'Take Attendance',
    icon: CheckCircle,
    permission: PERMISSIONS.MANAGE_ATTENDANCE
  },
  {
    to: '/history',
    label: 'Attendance History',
    icon: FileText,
    permission: PERMISSIONS.VIEW_ATTENDANCE_HISTORY
  }
];

export default function Sidebar() {

  const { role } = useAuth();

  const canManageTeachers = hasPermission(role, PERMISSIONS.MANAGE_TEACHERS);
  const canManageCalendar = hasPermission(role, PERMISSIONS.MANAGE_CALENDAR);
  const canManageAcademicPeriods = hasPermission(role, PERMISSIONS.MANAGE_ACADEMIC_PERIODS);
  const canCreateAdmin = hasPermission(role, PERMISSIONS.CREATE_ADMIN);

  return (
    <nav className="sticky top-16 flex h-[calc(100vh-4rem)] w-20 shrink-0 flex-col overflow-y-auto border-r border-gray-800 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl lg:w-64">

      {/* Logo */}
      <div className="border-b border-gray-800 p-4 lg:p-6">
        <div className="flex items-center justify-center gap-3 lg:justify-start">

          <motion.div
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{
              type: 'spring',
              stiffness: 300
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg"
          >
            <GraduationCap
              size={24}
              className="text-white"
            />
          </motion.div>

          <div className="hidden lg:block">
            <div className="text-base font-bold leading-tight text-white">
              Face Attendance
            </div>

            <div className="text-xs font-medium text-gray-400">
              System
            </div>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-5 lg:py-6">

        <div className="mb-3 hidden px-3 lg:block">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Navigation
          </span>
        </div>

        <div className="space-y-1.5">

          {/* Dashboard + Students + Attendance etc */}
          {links.filter(({ permission }) => !permission || hasPermission(role, permission)).map(({ to, label, icon: Icon }) => (

            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              aria-label={label}
              className="block"
            >

              {({ isActive }) => (

                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative flex justify-center gap-3 rounded-lg px-3 py-3
                    text-sm font-medium transition-transform duration-200
                    lg:justify-start
                    ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white"
                    />
                  )}

                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  <span className="hidden lg:inline">
                    {label}
                  </span>

                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-white lg:block"
                    />
                  )}

                </motion.div>

              )}

            </NavLink>

          ))}


          {/* ================================================= */}
          {/* TEACHERS - ADMIN ONLY */}
          {/* ================================================= */}

          {canManageTeachers && (
            <NavLink
              to="/teachers"
              aria-label="Teachers"
              className="mt-4 block border-t border-gray-800/60 pt-4"
            >

              {({ isActive }) => (

                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative flex justify-center gap-3 rounded-lg px-3 py-3
                    text-sm font-medium transition-transform duration-200
                    lg:justify-start
                    ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white"
                    />
                  )}

                  <UserRound
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  <span className="hidden lg:inline">
                    Teachers
                  </span>

                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-white lg:block"
                    />
                  )}

                </motion.div>

              )}

            </NavLink>
          )}


          {/* ================================================= */}
          {/* CALENDAR - ADMIN ONLY */}
          {/* ================================================= */}

          {canManageCalendar && (
            <NavLink
              to="/calendar"
              aria-label="Calendar"
              className="mt-4 block border-t border-gray-800/60 pt-4"
            >

              {({ isActive }) => (

                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative flex justify-center gap-3 rounded-lg px-3 py-3
                    text-sm font-medium transition-transform duration-200
                    lg:justify-start
                    ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white"
                    />
                  )}

                  <CalendarDays
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  <span className="hidden lg:inline">
                    Calendar
                  </span>

                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-white lg:block"
                    />
                  )}

                </motion.div>

              )}

            </NavLink>
          )}


          {/* ================================================= */}
          {/* ACADEMIC PERIODS - ADMIN ONLY
              ================================================= */}

          {canManageAcademicPeriods && (
            <NavLink
              to="/academic-periods"
              aria-label="Academic Periods"
              className="mt-4 block border-t border-gray-800/60 pt-4"
            >

              {({ isActive }) => (

                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative flex justify-center gap-3 rounded-lg px-3 py-3
                    text-sm font-medium transition-transform duration-200
                    lg:justify-start
                    ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white"
                    />
                  )}

                  <CalendarRange
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  <span className="hidden lg:inline">
                    Academic Periods
                  </span>

                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-white lg:block"
                    />
                  )}

                </motion.div>

              )}

            </NavLink>
          )}

          {/* ================================================= */}
          {/* ADMIN MANAGEMENT - SUPER ADMIN ONLY */}
          {/* ================================================= */}

          {canCreateAdmin && (
            <NavLink
              to="/admin-management"
              aria-label="Admin Management"
              className="mt-4 block border-t border-gray-800/60 pt-4"
            >
              {({ isActive }) => (
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex justify-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-transform duration-200 lg:justify-start ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                  {isActive && <motion.div layoutId="activeIndicator" className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white" />}
                  <ShieldCheck size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="hidden lg:inline">Admin Management</span>
                  {isActive && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-white lg:block" />}
                </motion.div>
              )}
            </NavLink>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-gray-800 p-4">
        <div className="hidden text-center text-xs text-gray-500 lg:block">
          <div className="font-medium">
            Powered by InsightFace
          </div>

          <div className="mt-1 text-gray-600">
            v1.0.0
          </div>
        </div>
      </div>

    </nav>
  );
}