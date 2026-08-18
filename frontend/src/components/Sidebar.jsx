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
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { hasPermission, PERMISSIONS } from '../auth/roles';

const mainLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.VIEW_DASHBOARD },
  { to: '/students', label: 'Students', icon: Users, permission: PERMISSIONS.MANAGE_STUDENTS },
  { to: '/face-registration', label: 'Face Registration', icon: ScanFace, permission: PERMISSIONS.MANAGE_FACE_REGISTRATION },
  { to: '/attendance', label: 'Take Attendance', icon: CheckCircle, permission: PERMISSIONS.MANAGE_ATTENDANCE },
  { to: '/history', label: 'Attendance History', icon: FileText, permission: PERMISSIONS.VIEW_ATTENDANCE_HISTORY },
];

function Item({ to, label, Icon, end }) {
  return (
    <NavLink to={to} end={end} aria-label={label} className="block">
      {({ isActive }) => (
        <motion.div
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.99 }}
          className={`
            group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium
            transition-colors duration-200
            ${isActive
              ? 'bg-neutral-900/[0.06] text-neutral-900'
              : 'text-neutral-600 hover:bg-neutral-900/[0.04] hover:text-neutral-900'}
          `}
        >
          {isActive && (
            <motion.span
              layoutId="activeIndicator"
              className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-neutral-900"
            />
          )}
          <Icon size={18} strokeWidth={isActive ? 2.25 : 1.9} className={isActive ? 'text-neutral-900' : 'text-neutral-500 group-hover:text-neutral-800'} />
          <span className="hidden truncate lg:inline">{label}</span>
        </motion.div>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { role } = useAuth();

  const canManageTeachers = hasPermission(role, PERMISSIONS.MANAGE_TEACHERS);
  const canManageCalendar = hasPermission(role, PERMISSIONS.MANAGE_CALENDAR);
  const canManageAcademicPeriods = hasPermission(role, PERMISSIONS.MANAGE_ACADEMIC_PERIODS);
  const canCreateAdmin = hasPermission(role, PERMISSIONS.CREATE_ADMIN);

  return (
    <nav
      className="sticky top-16 flex h-[calc(100vh-4rem)] w-20 shrink-0 flex-col overflow-y-auto border-r border-black/[0.06] lg:w-64"
      style={{
        background: 'rgba(255,255,255,0.62)',
        backdropFilter: 'saturate(180%) blur(14px)',
        WebkitBackdropFilter: 'saturate(180%) blur(14px)',
      }}
    >
      {/* Brand */}
      <div className="border-b border-black/[0.06] px-3 py-4 lg:px-4">
        <div className="flex items-center justify-center gap-3 lg:justify-start">
          <motion.div
            whileHover={{ rotate: 3, scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <GraduationCap size={18} className="text-neutral-800" />
          </motion.div>

          <div className="hidden lg:block">
            <div className="text-[13.5px] font-semibold leading-tight tracking-tight text-neutral-900">
              Face Attendance
            </div>
            <div className="text-[11px] font-medium text-neutral-500">System</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-4 lg:px-3 lg:py-5">
        <div className="mb-2 hidden px-2 lg:block">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
            Workspace
          </span>
        </div>

        <div className="space-y-1">
          {mainLinks
            .filter(({ permission }) => !permission || hasPermission(role, permission))
            .map(({ to, label, icon }) => (
              <Item key={to} to={to} label={label} Icon={icon} end={to === '/'} />
            ))}
        </div>

        {(canManageTeachers || canManageCalendar || canManageAcademicPeriods) && (
          <>
            <div className="my-4 hidden border-t border-black/[0.06] lg:block" />
            <div className="mb-2 hidden px-2 lg:block">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Administration
              </span>
            </div>
            <div className="space-y-1">
              {canManageTeachers && <Item to="/teachers" label="Faculty" Icon={UserRound} />}
              {canManageCalendar && <Item to="/calendar" label="Calendar" Icon={CalendarDays} />}
              {canManageAcademicPeriods && <Item to="/academic-periods" label="Academic Periods" Icon={CalendarRange} />}
            </div>
          </>
        )}

        {canCreateAdmin && (
          <>
            <div className="my-4 hidden border-t border-black/[0.06] lg:block" />
            <div className="mb-2 hidden px-2 lg:block">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                System
              </span>
            </div>
            <div className="space-y-1">
              <Item to="/admin-management" label="Admin Management" Icon={ShieldCheck} />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-black/[0.06] px-4 py-3">
        <div className="hidden text-center text-[11px] text-neutral-400 lg:block">
          <div className="font-medium text-neutral-500">Powered by TEAM LAZY</div>
          <div className="mt-0.5">v1.0.0</div>
        </div>
      </div>
    </nav>
  );
}
