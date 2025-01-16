import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { formatBytes, formatNumber, formatTimeAgo } from '../utils/format';
import { 
  CubeIcon, 
  ClockIcon, 
  ScaleIcon,
  HashtagIcon,
  DocumentDuplicateIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  UserIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ServerIcon,
  ShieldCheckIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL, API_ENDPOINTS, CACHE_CONFIG } from '../utils/config';
import LoadingSpinner from './LoadingSpinner';

export interface BlockDetailsData {
  hash: string;
  height: number;
  timestamp: number;
  previousBlock: string;
  nextBlock: string | null;
  size: number;
  txCount: number;
  transactions: Array<{
    id: string;
    owner: string;
    recipient: string;
    fee: number;
    size: number;
    dataRoot: string;
    tags?: Array<{ name: string; value: string }>;
    data_type?: string;
    confirmations?: number;
    bundledIn?: string;
  }>;
  reward: number;
  miner: string;
  weaveSize: number;
  blockTime: number;
  difficulty: number;
  metrics: {
    hashRate: number;
    networkUtilization: number;
    packing_density: number;
  };
  nonce: string;
  previousBlockHash: string;
  merkleRoot: string;
  networkInfo: {
    version: string;
    height: number;
    blocks: number;
    peers: number;
    queueLength: number;
  };
}

const BlockDetailsComponent: React.FC = () => {
  const { hashOrHeight } = useParams<{ hashOrHeight: string }>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();

  const { data: block, isLoading, error } = useQuery<BlockDetailsData>(
    ['block', hashOrHeight],
    async () => {
      if (!hashOrHeight) throw new Error('Block identifier is required');
      
      console.log('Fetching block:', hashOrHeight);

      if (!isNaN(Number(hashOrHeight)) && Number(hashOrHeight) < 0) {
        throw new Error('Invalid block height');
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.block(hashOrHeight)}`);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Block fetch error:', errorData);
        throw new Error(errorData.message || 'Block not found');
      }

      const data = await response.json();
      console.log('Block data received:', data);
      return data;
    },
    {
      staleTime: CACHE_CONFIG.staleTime,
      cacheTime: CACHE_CONFIG.cacheTime,
      refetchInterval: CACHE_CONFIG.refetchInterval,
      enabled: !!hashOrHeight,
      retry: 1,
      onError: (error) => {
        console.error('Block fetch error:', error);
      }
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Block not found</h2>
        <p className="mt-2 text-gray-600">The requested block could not be found.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
  if (!block) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">No data available</h2>
        <p className="mt-2 text-gray-600">Could not load block details.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Block #{formatNumber(block.height)}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(block.timestamp * 1000).toLocaleString()}
              </p>
            </div>
            <div className="flex space-x-4">
              {block.previousBlock && (
                <Link 
                  to={`/block/${block.height - 1}`}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-1" />
                  Previous Block
                </Link>
              )}
              {block.nextBlock && (
                <Link 
                  to={`/block/${block.height + 1}`}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  Next Block
                  <ArrowRightIcon className="h-5 w-5 ml-1" />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Block Summary</h3>
            <div className="mt-4 space-y-4">
              <DetailRow
                icon={<HashtagIcon className="h-5 w-5" />}
                label="Block Hash"
                value={block.hash}
                copyable
              />
              <DetailRow
                icon={<ClockIcon className="h-5 w-5" />}
                label="Timestamp"
                value={formatTimeAgo(block.timestamp * 1000)}
              />
              <DetailRow
                icon={<UserIcon className="h-5 w-5" />}
                label="Mined By"
                value={block.miner}
                copyable
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Block Details</h3>
            <div className="mt-4 space-y-4">
              <DetailRow
                icon={<DocumentDuplicateIcon className="h-5 w-5" />}
                label="Size"
                value={formatBytes(block.size)}
              />
              <DetailRow
                icon={<CubeIcon className="h-5 w-5" />}
                label="Transactions"
                value={formatNumber(block.txCount)}
              />
              <DetailRow
                icon={<CurrencyDollarIcon className="h-5 w-5" />}
                label="Block Reward"
                value={`${formatNumber(block.reward)} BIG`}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Network Status</h3>
            <div className="mt-4 space-y-4">
              <DetailRow
                icon={<ScaleIcon className="h-5 w-5" />}
                label="Difficulty"
                value={formatNumber(block.difficulty || 0)}
              />
              <DetailRow
                icon={<ChartBarIcon className="h-5 w-5" />}
                label="Network Size"
                value={formatBytes(block.weaveSize || 0)}
              />
              <DetailRow
                icon={<ServerIcon className="h-5 w-5" />}
                label="Block Time"
                value={typeof block.blockTime === 'number' ? `${block.blockTime.toFixed(2)}s` : 'N/A'}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Technical Details</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailRow
              icon={<ShieldCheckIcon className="h-5 w-5" />}
              label="Nonce"
              value={block.nonce}
              copyable
            />
            <DetailRow
              icon={<ClipboardDocumentIcon className="h-5 w-5" />}
              label="Merkle Root"
              value={block.merkleRoot}
              copyable
            />
            <DetailRow
              icon={<HashtagIcon className="h-5 w-5" />}
              label="Previous Block"
              value={block.previousBlockHash}
              copyable
            />
          </div>
        </div>
      </div>

      {block.transactions && block.transactions.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Transactions ({block.txCount})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fee
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {block.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        to={`/tx/${tx.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {tx.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {tx.owner?.substring(0, 8)}...{tx.owner?.substring(tx.owner.length - 8) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {tx.recipient ? 
                          `${tx.recipient.substring(0, 8)}...${tx.recipient.substring(tx.recipient.length - 8)}` : 
                          '-'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {tx.data_type || 'Data'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">
                        {formatBytes(tx.size)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatNumber(tx.fee)} BIG
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6 text-center text-gray-500">
          No transactions in this block
        </div>
      )}
    </div>
  );
};

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  copyable?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value, copyable }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 text-gray-400">{icon}</div>
    <div className="ml-3 flex-1">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="flex items-center mt-1">
        <p className="text-sm text-gray-900 break-all">{value}</p>
        {copyable && (
          <button
            onClick={() => navigator.clipboard.writeText(value.toString())}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  </div>
);

export default BlockDetailsComponent; 