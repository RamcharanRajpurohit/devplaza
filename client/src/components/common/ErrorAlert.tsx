import React from 'react';

interface ErrorAlertProps {
  message: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => (
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center">
    <div className="bg-red-900/50 border border-red-800 text-red-200 px-6 py-4 rounded-lg">
      {message}
    </div>
  </div>
);

export default ErrorAlert;
