import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Navigation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim();

    // Hash/Height kontrolü
    if (query.length > 30) {
      // Transaction ID veya Block Hash olabilir
      if (query.startsWith('tx_')) {
        navigate(`/tx/${query}`);
      } else {
        navigate(`/block/${query}`);
      }
    } else if (!isNaN(Number(query))) {
      // Blok yüksekliği
      navigate(`/block/${query}`);
    } else {
      // Geçersiz sorgu
      alert('Please enter a valid Block Height, Block Hash or Transaction ID');
    }

    setSearchQuery('');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                BigFile Explorer
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search by Block Height, Block Hash or TX ID"
                />
                <button type="submit" className="sr-only">
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center">
            <Link
              to="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              to="/blocks"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Blocks
            </Link>
            <Link
              to="/transactions"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Transactions
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 