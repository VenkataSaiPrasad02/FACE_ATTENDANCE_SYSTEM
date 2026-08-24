import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasRole, hasPermission } from '../auth/roles';

export default function PrivateRoute({
  children,
  allowedRoles,
  permission
}) {

  const { token, role, mustChangePassword } = useAuth();
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /*
   * First-login guard: until the initial password is replaced, the
   * only destination allowed is the change-password page. The backend
   * enforces the same rule for every API call.
   */
  if (mustChangePassword && location.pathname !== '/change-password') {
    return (
      <Navigate
        to="/change-password"
        replace
      />
    );
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !hasRole(role, allowedRoles)
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (permission && !hasPermission(role, permission)) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}