import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { CubeIcon } from '@heroicons/react/24/outline';
import { formatBytes, formatNumber, formatBlockTime } from '../utils/format';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/config';
import LoadingSpinner from './LoadingSpinner';
import TrendChart from './TrendChart';

interface DashboardData {
  current: {
    totalTransactions: number;
    tps: number;
    activeAddresses: number;
    storageCost: number;
    weaveSize: number;
    networkSize: number;
    proofRate: number;
    height: number;
    peerCount: number;
    changes: {
      transactions: { value: number; isPositive: boolean };
      size: { value: number; isPositive: boolean };
      peers: { value: number; isPositive: boolean };
    };
  };
  trends: {
    transactions: {
      data: Array<{ timestamp: string; value: number }>;
      total24h: number;
      eodEstimate: number;
    };
    weaveSize: {
      data: Array<{ timestamp: string; value: number }>;
      total24h: number;
      eodEstimate: number;
    };
    dataUploaded: {
      data: Array<{ timestamp: string; value: number }>;
      total24h: number;
      eodEstimate: number;
    };
  };
  recentBlocks: Array<{
    hash: string;
    height: number;
    timestamp: number;
    size: number;
    txCount: number;
  }>;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery<DashboardData>(
    'dashboard',
    async () => {
      console.log('Fetching dashboard data...');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.dashboard}`);
      if (!response.ok) {
        console.error('Dashboard fetch error:', response.status);
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    {
      refetchInterval: 30000,
      staleTime: 10000,
      cacheTime: 60000,
      retry: 1,
      onError: (error) => {
        console.error('Dashboard query error:', error);
      }
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-center">
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="text-red-800 font-medium">Error loading dashboard data</h3>
        <p className="text-red-600 mt-2">{(error as Error).message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    </div>
  );
  if (!data) return <div>No data available</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Network Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {formatNumber(data.current.totalTransactions)}
            </p>
            <p className="ml-2 flex items-baseline text-sm font-semibold">
              {data.current.changes.transactions.isPositive ? '+' : '-'}
              {data.current.changes.transactions.value}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Network Size</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {formatBytes(data.current.networkSize)}
            </p>
            <p className="ml-2 flex items-baseline text-sm font-semibold">
              {data.current.changes.size.isPositive ? '+' : '-'}
              {data.current.changes.size.value}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Block Height</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            #{formatNumber(data.current.height)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Connected Peers</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {data.current.peerCount}
            </p>
            <p className="ml-2 flex items-baseline text-sm font-semibold">
              {data.current.changes.peers.isPositive ? '+' : '-'}
              {data.current.changes.peers.value}
            </p>
          </div>
        </div>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <TrendChart
          title="Transactions"
          data={data.trends.transactions.data}
          formatValue={formatNumber}
          suffix="tx"
          gradient={{ from: '#3B82F6', to: '#1D4ED8' }}
        />
        <TrendChart
          title="Network Size"
          data={data.trends.weaveSize.data}
          formatValue={formatBytes}
          gradient={{ from: '#8B5CF6', to: '#6D28D9' }}
        />
        <TrendChart
          title="Data Uploaded"
          data={data.trends.dataUploaded.data}
          formatValue={formatBytes}
          suffix="/day"
          gradient={{ from: '#10B981', to: '#059669' }}
        />
      </div>

      {/* Recent Blocks Table */}
      <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Blocks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Block
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.recentBlocks.map((block) => (
                <tr 
                  key={block.hash}
                  onClick={() => navigate(`/block/${block.height}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CubeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        #{formatNumber(block.height)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatBytes(block.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {block.txCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatBlockTime(block.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 