import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Logo ve Testnet Uyarısı */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-gray-900">BigFile</span>
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-md">
                  Priv. Testnet
                </span>
              </Link>
            </div>
          </div>
          
          {/* Menü */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Network Status
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 