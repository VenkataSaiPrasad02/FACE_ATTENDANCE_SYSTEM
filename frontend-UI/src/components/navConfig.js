import {
  LayoutDashboard,
  Users,
  ScanFace,
  CheckCircle,
  FileText,
  Radio,
  Smartphone,
  UserRound,
  CalendarDays,
  CalendarRange,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { hasPermission, PERMISSIONS } from '../auth/roles';

/*
 * Single source of truth for primary navigation.
 * Consumed by the desktop sidebar and the mobile bottom bar so both
 * surfaces can never drift apart.
 */

export const MAIN_NAV_LINKS = [
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
    to: '/open-attendance',
    label: 'Open Session',
    icon: Radio,
    permission: PERMISSIONS.OPEN_ATTENDANCE_SESSION,
  },
  {
    to: '/attendance',
    label: 'Attendance',
    icon: CheckCircle,
    permission: PERMISSIONS.MANAGE_ATTENDANCE,
  },
  {
    to: '/history',
    label: 'History',
    icon: FileText,
    permission: PERMISSIONS.VIEW_ATTENDANCE_HISTORY,
  },
  /*
   * Student-only entries — visible only when the signed-in role
   * carries the matching permission.
   */
  {
    to: '/take-attendance',
    label: 'Scan',
    icon: Smartphone,
    permission: PERMISSIONS.TAKE_ATTENDANCE,
  },
  {
    to: '/my-attendance',
    label: 'My Attendance',
    icon: FileText,
    permission: PERMISSIONS.VIEW_OWN_ATTENDANCE,
  },
];

export const ADMIN_NAV_LINKS = [
  {
    to: '/teachers',
    label: 'Faculty',
    icon: UserRound,
    permission: PERMISSIONS.MANAGE_TEACHERS,
  },
  {
    to: '/calendar',
    label: 'Calendar',
    icon: CalendarDays,
    permission: PERMISSIONS.MANAGE_CALENDAR,
  },
  {
    to: '/academic-periods',
    label: 'Academic Periods',
    icon: CalendarRange,
    permission: PERMISSIONS.MANAGE_ACADEMIC_PERIODS,
  },
  {
    to: '/manage-autofill',
    label: 'Auto Fill',
    icon: Sparkles,
    permission: PERMISSIONS.MANAGE_AUTO_FILL,
  },
];

export const SYSTEM_NAV_LINKS = [
  {
    to: '/admin-management',
    label: 'Admin Management',
    icon: ShieldCheck,
    permission: PERMISSIONS.CREATE_ADMIN,
  },
];

export function getPermittedMainLinks(role) {
  return MAIN_NAV_LINKS.filter(
    ({ permission }) => !permission || hasPermission(role, permission)
  );
}

export function getPermittedAdminLinks(role) {
  return ADMIN_NAV_LINKS.filter(({ permission }) =>
    hasPermission(role, permission)
  );
}

export function getPermittedSystemLinks(role) {
  return SYSTEM_NAV_LINKS.filter(({ permission }) =>
    hasPermission(role, permission)
  );
}
