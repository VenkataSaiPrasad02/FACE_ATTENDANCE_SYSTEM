import React from 'react';
import ErrorPage from './ErrorPage';

export default function ForbiddenPage() {
  return (
    <ErrorPage
      statusCode="403"
      title="Access denied"
      description="You do not have the required administrative permissions to access this page."
    />
  );
}
