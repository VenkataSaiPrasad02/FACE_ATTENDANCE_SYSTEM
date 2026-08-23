import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasRole, hasPermission } from '../auth/roles';

export default function PrivateRoute({
  children,
  allowedRoles,
  permission
}) {

  const { token, role } = useAuth();

  if (!token) {
    return (
      <Navigate
        to="/login"
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