import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { formatBytes, formatTimeAgo } from '../utils/format';
import { CubeIcon } from '@heroicons/react/24/outline';

interface Block {
  hash: string;
  height: number;
  timestamp: number;
  size: number;
  txCount: number;
}

const BlockList = () => {
  const { data, isLoading } = useQuery<Block[]>('blocks', async () => {
    const response = await fetch('http://thebigfile.info:1984/blocks');
    return response.json();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-dark mb-8">Son Bloklar</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map(block => (
          <Link to={`/block/${block.hash}`} key={block.hash} className="block-card">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <CubeIcon className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-lg font-semibold text-dark">#{block.height}</p>
                  <p className="text-sm text-gray-500">{block.hash.substring(0, 16)}...</p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Boyut</p>
                <p className="font-medium text-dark">{formatBytes(block.size)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Zaman</p>
                <p className="font-medium text-dark">{formatTimeAgo(block.timestamp)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlockList; 