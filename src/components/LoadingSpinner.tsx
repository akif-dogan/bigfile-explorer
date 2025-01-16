import React from 'react';

const LoadingSpinner = () => {
  const [showTimeout, setShowTimeout] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 10000); // 10 saniye sonra timeout mesajını göster

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">Loading blockchain data...</p>
      {showTimeout && (
        <div className="mt-4 text-center">
          <p className="text-amber-600">Taking longer than expected...</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-amber-100 text-amber-800 rounded hover:bg-amber-200"
          >
            Refresh Page
          </button>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner; 