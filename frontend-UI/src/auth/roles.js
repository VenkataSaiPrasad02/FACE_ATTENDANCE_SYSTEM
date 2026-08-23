export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
};

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  MANAGE_STUDENTS: 'MANAGE_STUDENTS',
  MANAGE_TEACHERS: 'MANAGE_TEACHERS',
  MANAGE_ATTENDANCE: 'MANAGE_ATTENDANCE',
  VIEW_ATTENDANCE_HISTORY: 'VIEW_ATTENDANCE_HISTORY',
  MANAGE_FACE_REGISTRATION: 'MANAGE_FACE_REGISTRATION',
  MANAGE_CALENDAR: 'MANAGE_CALENDAR',
  MANAGE_ACADEMIC_PERIODS: 'MANAGE_ACADEMIC_PERIODS',
  VIEW_USERS: 'VIEW_USERS',
  CREATE_ADMIN: 'CREATE_ADMIN',
};

/*
 * Frontend UI permissions mirror the current backend security model.
 * Spring Security remains the final authority; these permissions only
 * decide which UI/routes are shown to each role.
 * SUPER_ADMIN receives the ADMIN UI permissions plus SUPER_ADMIN-only actions.
 */
const ADMIN_PERMISSIONS = [
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.MANAGE_STUDENTS,
  PERMISSIONS.MANAGE_TEACHERS,
  PERMISSIONS.MANAGE_ATTENDANCE,
  PERMISSIONS.VIEW_ATTENDANCE_HISTORY,
  PERMISSIONS.MANAGE_FACE_REGISTRATION,
  PERMISSIONS.MANAGE_CALENDAR,
  PERMISSIONS.MANAGE_ACADEMIC_PERIODS,
  PERMISSIONS.VIEW_USERS,
];

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    ...ADMIN_PERMISSIONS,
    PERMISSIONS.CREATE_ADMIN,
  ],

  [ROLES.ADMIN]: ADMIN_PERMISSIONS,

  [ROLES.TEACHER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.VIEW_ATTENDANCE_HISTORY,
  ],

  [ROLES.STUDENT]: [],
};

export function normalizeRole(role) {
  return role?.replace('ROLE_', '').toUpperCase() || null;
}

export function hasRole(role, allowedRoles = []) {
  const current = normalizeRole(role);
  const allowed = allowedRoles.map(normalizeRole);

  if (!current) return false;
  if (allowed.includes(current)) return true;

  // SUPER_ADMIN inherits ADMIN-level UI access.
  return current === ROLES.SUPER_ADMIN && allowed.includes(ROLES.ADMIN);
}

export function hasPermission(role, permission) {
  const normalized = normalizeRole(role);
  return ROLE_PERMISSIONS[normalized]?.includes(permission) ?? false;
}

export function isAdminLike(role) {
  return hasRole(role, [ROLES.ADMIN]);
}

export function canManageStudents(role) {
  return hasPermission(role, PERMISSIONS.MANAGE_STUDENTS);
}
