
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 animate-fade-in">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-primary"></div>
      <h2 className="text-2xl font-semibold text-white mt-6">Analyzing Your Meal...</h2>
      <p className="text-gray-400 mt-2">Our AI nutritionist is hard at work. This may take a moment.</p>
    </div>
  );
};

export default LoadingSpinner;
