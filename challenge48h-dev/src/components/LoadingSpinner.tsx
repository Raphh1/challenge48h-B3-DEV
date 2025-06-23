import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bordeaux"></div>
        <p className="mt-4 text-gray-600">Chargement des associations...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;