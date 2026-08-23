import React from 'react';
import ErrorPage from './ErrorPage';

export default function UnauthorizedPage() {
  return (
    <ErrorPage
      statusCode="401"
      title="Authentication required"
      description="Please sign in to your institutional account to access this resource."
    />
  );
}
