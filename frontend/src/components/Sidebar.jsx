import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  X,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { hasPermission, PERMISSIONS } from '../auth/roles';

const mainLinks = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    permission: PERMISSIONS.VIEW_DASHBOARD,
  },
  {
    to: '/students',
    label: 'Students',
    icon: Users,
    permission: PERMISSIONS.MANAGE_STUDENTS,
  },
  {
    to: '/face-registration',
    label: 'Face Registration',
    icon: ScanFace,
    permission: PERMISSIONS.MANAGE_FACE_REGISTRATION,
  },
  {
    to: '/attendance',
    label: 'Take Attendance',
    icon: CheckCircle,
    permission: PERMISSIONS.MANAGE_ATTENDANCE,
  },
  {
    to: '/history',
    label: 'Attendance History',
    icon: FileText,
    permission: PERMISSIONS.VIEW_ATTENDANCE_HISTORY,
  },
];

function NavItem({ to, label, Icon, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      onClick={onNavigate}
      className={({ isActive }) => `
        group relative flex items-center gap-3
        rounded-xl
        px-3 py-2.5
        text-xs font-semibold
        transition-all duration-200 ease-out
        select-none

        ${
          isActive
            ? `
              border border-white/80
              bg-gradient-to-r
              from-blue-500
              to-indigo-600
              text-white
              shadow-md
              shadow-indigo-500/20
            `
            : `
              border border-transparent
              text-slate-600
              hover:border-white/80
              hover:bg-white/70
              hover:text-slate-900
              hover:shadow-sm
            `
        }
      `}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="
                absolute left-0 top-1/2
                h-6 w-1
                -translate-y-1/2
                rounded-r-full
                bg-white
              "
              aria-hidden="true"
            />
          )}

          <span
            className={`
              flex h-8 w-8 shrink-0
              items-center justify-center
              rounded-lg
              transition-all duration-200

              ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-white/70 text-slate-400 group-hover:bg-white group-hover:text-indigo-600'
              }
            `}
          >
            <Icon
              size={17}
              strokeWidth={isActive ? 2.3 : 1.9}
            />
          </span>

          <span className="truncate tracking-tight">
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { role } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const canManageTeachers = hasPermission(
    role,
    PERMISSIONS.MANAGE_TEACHERS
  );

  const canManageCalendar = hasPermission(
    role,
    PERMISSIONS.MANAGE_CALENDAR
  );

  const canManageAcademicPeriods = hasPermission(
    role,
    PERMISSIONS.MANAGE_ACADEMIC_PERIODS
  );

  const canCreateAdmin = hasPermission(
    role,
    PERMISSIONS.CREATE_ADMIN
  );

  /*
   * Navbar sends this event when the hamburger button
   * is clicked.
   */
  useEffect(() => {
    const openSidebar = () => {
      setMobileOpen(true);
    };

    window.addEventListener(
      'open-mobile-sidebar',
      openSidebar
    );

    return () => {
      window.removeEventListener(
        'open-mobile-sidebar',
        openSidebar
      );
    };
  }, []);

  /*
   * Prevent body scrolling while mobile sidebar is open.
   */
  useEffect(() => {
    if (!mobileOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  /*
   * Escape key closes drawer.
   */
  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [mobileOpen]);

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      {/* =====================================================
          BRAND
      ====================================================== */}
      <div className="mb-5 border-b border-indigo-100/70 pb-5">
        <div className="flex items-center justify-between gap-3 lg:justify-start">

          <div className="flex items-center gap-3">
            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-2xl
                bg-gradient-to-br
                from-blue-500
                to-indigo-600
                text-white
                shadow-md
                shadow-indigo-500/20
              "
            >
              <GraduationCap
                size={20}
                strokeWidth={2.2}
              />
            </div>

            <div>
              <div className="text-xs font-bold leading-tight tracking-tight text-slate-900">
                Face Attendance
              </div>

              <div className="mt-0.5 text-[10px] font-medium text-slate-500">
                Admin & Faculty Portal
              </div>
            </div>
          </div>

          {/* Mobile close */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            aria-label="Close navigation menu"
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-xl
              border border-indigo-100
              bg-white/70
              text-slate-500
              transition-all
              hover:bg-white
              hover:text-indigo-600
              lg:hidden
            "
          >
            <X size={19} />
          </button>
        </div>
      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}
      <div className="flex-1 overflow-y-auto pr-1">

        {/* WORKSPACE */}
        <section className="mb-7">
          <div className="mb-2.5 px-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-400">
              Workspace
            </span>
          </div>

          <div className="space-y-1.5">
            {mainLinks
              .filter(
                ({ permission }) =>
                  !permission ||
                  hasPermission(role, permission)
              )
              .map(({ to, label, icon }) => (
                <NavItem
                  key={to}
                  to={to}
                  label={label}
                  Icon={icon}
                  end={to === '/'}
                  onNavigate={closeMobileSidebar}
                />
              ))}
          </div>
        </section>

        {/* ADMINISTRATION */}
        {(canManageTeachers ||
          canManageCalendar ||
          canManageAcademicPeriods) && (
          <section className="mb-7">
            <div className="mb-2.5 px-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-400">
                Administration
              </span>
            </div>

            <div className="space-y-1.5">
              {canManageTeachers && (
                <NavItem
                  to="/teachers"
                  label="Faculty"
                  Icon={UserRound}
                  onNavigate={closeMobileSidebar}
                />
              )}

              {canManageCalendar && (
                <NavItem
                  to="/calendar"
                  label="Calendar"
                  Icon={CalendarDays}
                  onNavigate={closeMobileSidebar}
                />
              )}

              {canManageAcademicPeriods && (
                <NavItem
                  to="/academic-periods"
                  label="Academic Periods"
                  Icon={CalendarRange}
                  onNavigate={closeMobileSidebar}
                />
              )}
            </div>
          </section>
        )}

        {/* SYSTEM */}
        {canCreateAdmin && (
          <section>
            <div className="mb-2.5 px-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-400">
                System
              </span>
            </div>

            <div className="space-y-1.5">
              <NavItem
                to="/admin-management"
                label="Admin Management"
                Icon={ShieldCheck}
                onNavigate={closeMobileSidebar}
              />
            </div>
          </section>
        )}
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <div className="mt-6 border-t border-indigo-100/70 pt-4 text-center">
        <p className="text-[11px] font-semibold text-slate-500">
          Powered by TEAM LAZY
        </p>

        <p className="mt-0.5 text-[10px] text-slate-400">
          v1.0.0
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}
      <nav
        aria-label="Main Navigation"
        className="
          sticky top-16
          hidden
          h-[calc(100vh-4rem)]
          w-64
          shrink-0
          flex-col
          overflow-hidden
          border-r border-indigo-100/70
          bg-gradient-to-b
          from-blue-50
          via-indigo-50/80
          to-violet-50
          p-4
          shadow-sm
          backdrop-blur-md
          lg:flex
        "
      >
        {sidebarContent}
      </nav>

      {/* =====================================================
          MOBILE / TABLET DRAWER
      ====================================================== */}

      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-50
          bg-slate-950/35
          backdrop-blur-[2px]
          transition-opacity duration-300
          lg:hidden

          ${
            mobileOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0'
          }
        `}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        aria-label="Mobile Navigation"
        aria-hidden={!mobileOpen}
        className={`
          fixed left-0 top-0 z-[60]
          flex h-screen
          w-[290px]
          max-w-[85vw]
          flex-col
          overflow-hidden
          border-r border-white/70
          bg-gradient-to-b
          from-blue-50
          via-indigo-50
          to-violet-100
          p-4
          shadow-2xl
          backdrop-blur-xl

          transition-transform
          duration-300
          ease-out

          lg:hidden

          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}