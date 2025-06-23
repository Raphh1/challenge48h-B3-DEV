import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-gray-700 text-center mb-4 max-w-md">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-bordeaux text-white rounded-md hover:bg-bordeaux-dark transition-colors duration-200"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Réessayer
      </button>
    </div>
  );
};

export default ErrorMessage;