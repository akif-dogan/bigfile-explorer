import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const TransactionSearch = () => {
  const [searchTx, setSearchTx] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTx.trim()) {
      navigate(`/tx/${searchTx.trim()}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTx}
            onChange={(e) => setSearchTx(e.target.value)}
            placeholder="Search transaction by ID..."
            className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default TransactionSearch; 