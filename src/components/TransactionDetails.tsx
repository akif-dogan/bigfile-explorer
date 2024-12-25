import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { formatBytes } from '../utils/format';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

interface Transaction {
  id: string;
  block_height: number;
  block_hash: string;
  data_size: number;
  timestamp: number;
  fee: number;
  data_root: string;
  owner: string;
}

const TransactionDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: tx, isLoading, error } = useQuery<Transaction>(
    ['transaction', id],
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/tx/${id}`);
      if (!response.ok) {
        throw new Error('Transaction not found');
      }
      const data = await response.json();
      return {
        ...data,
        timestamp: data.timestamp * 1000 // Convert to milliseconds if needed
      };
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Transaction not found or an error occurred
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-dark mb-6">Transaction Details</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-sm text-gray-500">Transaction ID</p>
            <p className="font-medium text-dark break-all">{tx.id}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Block</p>
            <Link 
              to={`/block/${tx.block_hash}`}
              className="font-medium text-primary hover:text-primary-dark"
            >
              #{tx.block_height}
            </Link>
          </div>

          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium text-dark">
              {new Date(tx.timestamp).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Size</p>
            <p className="font-medium text-dark">{formatBytes(tx.data_size)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Fee</p>
            <p className="font-medium text-dark">{tx.fee} BIG</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Owner</p>
            <p className="font-medium text-dark break-all">{tx.owner}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Data Root</p>
            <p className="font-medium text-dark break-all">{tx.data_root}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails; 