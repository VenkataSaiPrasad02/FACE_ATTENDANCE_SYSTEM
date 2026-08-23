import React from 'react';
import ErrorPage from './ErrorPage';

export default function BadGatewayPage({ onRetry }) {
  return (
    <ErrorPage
      statusCode="502"
      title="Bad Gateway"
      description="The application gateway received an invalid response from upstream servers. Please retry."
      onRetry={onRetry}
    />
  );
}
