import React from 'react';
import ErrorPage from './ErrorPage';

export default function ServerErrorPage({ onRetry }) {
  return (
    <ErrorPage
      statusCode="500"
      title="Internal Server Error"
      description="The application server encountered an unexpected condition. Please try again shortly."
      onRetry={onRetry}
    />
  );
}
