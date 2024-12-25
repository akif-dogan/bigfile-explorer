import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { formatBytes, formatBlockTime, formatNumber } from '../utils/format';
import { 
  ArrowTrendingUpIcon, 
  UsersIcon, 
  CircleStackIcon, 
  CpuChipIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  ServerStackIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart,
  Area
} from 'recharts';
import TransactionSearch from './TransactionSearch';
import StatCard from './StatCard';
import TrendChart from './TrendChart';
import LoadingSpinner from './LoadingSpinner';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

// Örnek veri - normalde API'den alınacak
const historicalData = [
  { timestamp: '00:00', tps: 2.1, size: 120, hashRate: 45 },
  { timestamp: '04:00', tps: 2.4, size: 122, hashRate: 48 },
  { timestamp: '08:00', tps: 2.2, size: 125, hashRate: 46 },
  { timestamp: '12:00', tps: 2.8, size: 128, hashRate: 50 },
  { timestamp: '16:00', tps: 3.0, size: 130, hashRate: 52 },
  { timestamp: '20:00', tps: 2.7, size: 133, hashRate: 49 },
  { timestamp: '24:00', tps: 2.5, size: 135, hashRate: 47 },
];

interface Block {
  hash: string;
  height: number;
  timestamp: number;
  size: number;
  txCount: number;
}

const REFETCH_INTERVAL = 30000;

const Dashboard = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery('dashboard', async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard`);
    return response.json();
  }, {
    refetchInterval: REFETCH_INTERVAL,
    staleTime: 15000,
    cacheTime: 60000,
    refetchOnWindowFocus: true,
    retry: 2,
    onError: (error) => {
      console.error('Dashboard data fetch error:', error);
    }
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Transactions"
          value={formatNumber(data.current.totalTransactions)}
          icon={<DocumentIcon className="w-6 h-6" />}
          change={data.current.changes.transactions}
        />
        <StatCard
          title="TPS"
          value={data.current.tps.toFixed(2)}
          icon={<ChartBarIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Active Nodes"
          value={formatNumber(data.current.peerCount)}
          icon={<UsersIcon className="w-6 h-6" />}
          change={data.current.changes.peers}
        />
        <StatCard
          title="Storage Cost"
          value={`${data.current.storageCost.toFixed(3)} BIG/GiB`}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Weave Size"
          value={formatBytes(data.current.weaveSize)}
          icon={<CircleStackIcon className="w-6 h-6" />}
          change={data.current.changes.size}
        />
        <StatCard
          title="Network Size"
          value={formatBytes(data.current.networkSize)}
          icon={<ServerStackIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Proof Rate"
          value={`${formatNumber(data.current.proofRate)} P/s`}
          icon={<CpuChipIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Block Height"
          value={`#${formatNumber(data.current.height)}`}
          icon={<CubeIcon className="w-6 h-6" />}
        />
      </div>

      {/* Charts Section */}
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
              {data.recentBlocks.map((block: Block) => (
                <tr 
                  key={block.hash}
                  onClick={() => navigate(`/block/${block.hash}`)}
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