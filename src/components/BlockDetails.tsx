import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { formatBytes, formatTimeAgo } from '../utils/format';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

interface BlockDetails {
  hash: string;
  height: number;
  timestamp: number;
  previous_block: string;
  txs: string[];
  size: number;
}

const BlockDetails = () => {
  const { hash } = useParams<{ hash: string }>();
  
  const { data: block, isLoading } = useQuery<BlockDetails>(
    ['block', hash],
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/block/${hash}`);
      const data = await response.json();
      return {
        ...data,
        timestamp: data.timestamp * 1000 // Convert to milliseconds
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

  if (!block) {
    return <div className="text-center py-8">Block not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-dark mb-6">Block Details</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Height</p>
            <p className="font-medium text-dark">{block.height}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium text-dark">{formatTimeAgo(block.timestamp)}</p>
          </div>

          <div className="col-span-1 md:col-span-2">
            <p className="text-sm text-gray-500">Hash</p>
            <p className="font-medium text-dark break-all">{block.hash}</p>
          </div>

          <div className="col-span-1 md:col-span-2">
            <p className="text-sm text-gray-500">Previous Block</p>
            <p className="font-medium text-dark break-all">{block.previous_block}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Size</p>
            <p className="font-medium text-dark">{formatBytes(block.size)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Transactions</p>
            <p className="font-medium text-dark">{block.txs.length}</p>
          </div>
        </div>

        {block.txs.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-dark mb-4">Transactions</h2>
            <div className="space-y-2">
              {block.txs.map((tx, index) => (
                <div key={tx} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 break-all">{tx}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockDetails; 