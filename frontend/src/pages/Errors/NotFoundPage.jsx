import React from 'react';
import ErrorPage from './ErrorPage';

export default function NotFoundPage() {
  return (
    <ErrorPage
      statusCode="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or may have been moved."
    />
  );
}
