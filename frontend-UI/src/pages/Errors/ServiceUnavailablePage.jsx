import React from 'react';
import ErrorPage from './ErrorPage';

export default function ServiceUnavailablePage({ onRetry }) {
  return (
    <ErrorPage
      statusCode="503"
      title="Service Unavailable"
      description="The server is currently unable to handle the request due to maintenance or high traffic."
      onRetry={onRetry}
    />
  );
}
