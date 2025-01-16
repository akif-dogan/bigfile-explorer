import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CubeIcon, 
  UsersIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ServerIcon, 
  HashtagIcon
} from '@heroicons/react/24/outline';
import { formatBytes, formatNumber, formatTimeAgo } from '../utils/format';
import { API_BASE_URL } from '../utils/config';
import LoadingSpinner from './LoadingSpinner';
import TrendChart from './TrendChart';

interface DashboardData {
  current: {
    height: number;
    peerCount: number;
    networkSize: number;
    totalTransactions: number;
    tps: number;
    addresses: number;
    storageCost: number;
    weaveSize: number;
    proofRate: number;
  };
  trends: {
    transactions: {
      total24h: number;
      eodEstimate: number;
      data: Array<{ timestamp: number; value: number }>;
    };
    weaveSize: {
      total24h: number;
      data: Array<{ timestamp: number; value: number }>;
    };
    dataUploaded: {
      total24h: number;
      eodEstimate: number;
      data: Array<{ timestamp: number; value: number }>;
    };
  };
  recentBlocks: Array<{
    hash: string;
    height: number;
    timestamp: number;
    size: number;
    txCount: number;
    miner?: string;
  }>;
  recentTransactions: Array<{
    id: string;
    from: string;
    size?: number;
    amount?: number;
    timestamp: number;
  }>;
}

// StatsCard bileşeni
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="text-gray-400">{icon}</div>
    </div>
    <div className="mt-2 flex items-baseline">
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {trend !== undefined && (
        <p className={`ml-2 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '+' : ''}{trend.toFixed(2)}%
        </p>
      )}
    </div>
  </div>
);

// StatRow bileşeni
interface StatRowProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatRow: React.FC<StatRowProps> = ({ label, value, icon }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div className="text-gray-400">{icon}</div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

// BlockRow bileşeni
interface BlockRowProps {
  block: {
    hash: string;
    height: number;
    timestamp: number;
    size: number;
    txCount: number;
  };
}

const BlockRow: React.FC<BlockRowProps> = ({ block }) => {
  const navigate = useNavigate();
  
  return (
    <tr 
      onClick={() => navigate(`/block/${block.height}`)}
      className="hover:bg-gray-50 cursor-pointer"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <CubeIcon className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-900">#{formatNumber(block.height)}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {/* Miner bilgisi eklenecek */}
        -
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {block.txCount}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatBytes(block.size)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatTimeAgo(block.timestamp)}
      </td>
    </tr>
  );
};

// TransactionRow bileşeni
interface TransactionRowProps {
  transaction: {
    id: string;
    from: string;
    size?: number;
    amount?: number;
    timestamp: number;
  };
}

const TransactionRow: React.FC<TransactionRowProps> = ({ transaction }) => (
  <div className="px-6 py-4 hover:bg-gray-50">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center text-sm">
          <Link 
            to={`/tx/${transaction.id}`}
            className="font-medium text-blue-600 hover:text-blue-800 truncate"
          >
            {transaction.id}
          </Link>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          From: {transaction.from}
        </div>
      </div>
      <div className="ml-4 flex-shrink-0 text-sm text-gray-500">
        {transaction.size && formatBytes(transaction.size)}
        {transaction.amount && `${transaction.amount} AR`}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { data, isLoading } = useQuery<DashboardData>(
    'dashboard',
    async () => {
      try {
        // Ana node'dan info bilgilerini al
        const infoResponse = await fetch(`${API_BASE_URL}/info`);
        const info = await infoResponse.json();
        console.log('Node Info:', info);

        // Network size ve TPS hesaplama için son bloğu al
        const lastBlockResponse = await fetch(`${API_BASE_URL}/block/height/${info.height}`);
        const lastBlock = await lastBlockResponse.json();
        console.log('Last Block:', lastBlock);

        // Bir önceki bloğu al (büyüme oranı için)
        const prevBlockResponse = await fetch(`${API_BASE_URL}/block/height/${info.height - 1}`);
        const prevBlock = await prevBlockResponse.json();

        // Network büyüme oranı hesapla
        const networkGrowth = ((lastBlock.weave_size - prevBlock.weave_size) / prevBlock.weave_size) * 100;

        // TPS hesaplama (son bloktaki işlem sayısı / ortalama blok süresi)
        const blockTime = info.block_time || 120; // varsayılan 120 saniye
        const tps = (lastBlock.txs?.length || 0) / blockTime;

        // Son blokları al
        const recentBlocks: Array<{
          hash: string;
          height: number;
          timestamp: number;
          size: number;
          txCount: number;
          miner?: string;
        }> = [];

        // Son 5 bloğu al
        for (let i = 0; i < 5; i++) {
          const height = info.height - i;
          if (height < 0) break;
          
          const blockResponse = await fetch(`${API_BASE_URL}/block/height/${height}`);
          if (blockResponse.ok) {
            const blockData = await blockResponse.json();
            recentBlocks.push({
              hash: blockData.indep_hash,
              height: height,
              timestamp: blockData.timestamp,
              size: blockData.weave_size || 0,
              txCount: blockData.txs?.length || 0,
              miner: blockData.reward_addr
            });
          }
        }

        // Son 24 saatteki işlemleri hesapla
        const transactions24h = recentBlocks.reduce((acc: number, block: { txCount: number }) => {
          return acc + block.txCount;
        }, 0);

        return {
          current: {
            height: info.height,
            peerCount: info.peers?.length || 0,
            networkSize: lastBlock.weave_size || 0,
            totalTransactions: info.tx_count || 0,
            tps: parseFloat(tps.toFixed(2)),
            addresses: info.wallet_count || 0,
            storageCost: parseFloat((info.storage_cost || 0).toFixed(6)),
            weaveSize: lastBlock.weave_size || 0,
            proofRate: parseInt(info.current_diff || '0')
          },
          trends: {
            transactions: {
              total24h: transactions24h,
              eodEstimate: Math.round(transactions24h * 1.5),
              data: recentBlocks.map(block => ({
                timestamp: block.timestamp * 1000,
                value: block.txCount
              })).reverse()
            },
            weaveSize: {
              total24h: networkGrowth,
              data: recentBlocks.map(block => ({
                timestamp: block.timestamp * 1000,
                value: block.size
              })).reverse()
            },
            dataUploaded: {
              total24h: transactions24h * (lastBlock.tx_size || 1024),
              eodEstimate: transactions24h * (lastBlock.tx_size || 1024) * 1.5,
              data: recentBlocks.map(block => ({
                timestamp: block.timestamp * 1000,
                value: block.txCount * (block.size / block.txCount || 1024)
              })).reverse()
            }
          },
          recentBlocks,
          recentTransactions: [] // Son işlemler için ayrı bir endpoint gerekebilir
        };
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
      }
    },
    {
      refetchInterval: 10000,
      retry: 3
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Network Stats */}
            <StatsCard
              title="Network Size"
              value={formatBytes(data.current.networkSize)}
              icon={<ServerIcon className="h-5 w-5" />}
              trend={data.trends.weaveSize.total24h}
            />
            <StatsCard
              title="Transactions"
              value={formatNumber(data.current.totalTransactions)}
              icon={<ChartBarIcon className="h-5 w-5" />}
              trend={data.trends.transactions.total24h}
            />
            <StatsCard
              title="Block Height"
              value={`#${formatNumber(data.current.height)}`}
              icon={<CubeIcon className="h-5 w-5" />}
            />
            <StatsCard
              title="TPS"
              value={data.current.tps.toFixed(2)}
              icon={<ArrowTrendingUpIcon className="h-5 w-5" />}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Charts */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Network Activity</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md">24H</button>
                  <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md">7D</button>
                  <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md">30D</button>
                </div>
              </div>
              <TrendChart 
                title="Transaction Activity"
                data={data.trends.transactions.data}
                formatValue={formatNumber}
                suffix=" txs"
                gradient={{
                  from: '#93C5FD',
                  to: '#3B82F6'
                }}
              />
            </div>

            {/* Recent Blocks */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Recent Blocks</h2>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Block
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Miner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Txs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.recentBlocks.map((block) => (
                      <BlockRow key={block.hash} block={block} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Network Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Network Stats</h2>
              <div className="space-y-4">
                <StatRow 
                  label="Storage Cost"
                  value={`${data.current.storageCost} AR/GB`}
                  icon={<CurrencyDollarIcon className="h-5 w-5" />}
                />
                <StatRow 
                  label="Active Addresses"
                  value={formatNumber(data.current.addresses)}
                  icon={<UsersIcon className="h-5 w-5" />}
                />
                <StatRow 
                  label="Proof Rate"
                  value={formatNumber(data.current.proofRate)}
                  icon={<HashtagIcon className="h-5 w-5" />}
                />
                <StatRow 
                  label="Connected Peers"
                  value={formatNumber(data.current.peerCount)}
                  icon={<ServerIcon className="h-5 w-5" />}
                />
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {data.recentTransactions.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 