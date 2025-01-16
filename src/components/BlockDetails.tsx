import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { formatBytes, formatNumber, formatTimeAgo } from '../utils/format';
import { 
  CubeIcon, 
  ClockIcon, 
  HashtagIcon,
  DocumentDuplicateIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  UserIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../utils/config';
import LoadingSpinner from './LoadingSpinner';

interface BlockDetailsData {
  indep_hash: string;
  height: number;
  timestamp: number;
  previous_block: string;
  diff: string;
  hash: string;
  tx_root: string;
  txs: string[];
  wallet_list: string;
  reward_addr: string;
  tags: Array<{
    name: string;
    value: string;
  }>;
  reward_pool: number;
  weave_size: number;
  block_size: number;
  cumulative_diff: string;
  hash_list_merkle: string;
  poa: {
    option: string;
    tx_path: string;
    data_path: string;
    chunk: string;
  };
}

const BlockDetailsComponent = () => {
  const { hashOrHeight } = useParams<{ hashOrHeight: string }>();

  const { data: block, isLoading } = useQuery<BlockDetailsData>(
    ['block', hashOrHeight],
    async () => {
      try {
        console.log('Fetching block data for:', hashOrHeight);
        const response = await fetch(`${API_BASE_URL}/block/height/${hashOrHeight}`);
        
        if (!response.ok) {
          console.error('Block fetch error:', response.status);
          throw new Error('Block not found');
        }

        const data = await response.json();
        console.log('Block data received:', data);

        // API'den gelen veriyi interface'e uygun şekilde dönüştür
        return {
          indep_hash: data.indep_hash || data.hash,
          height: parseInt(hashOrHeight as string),
          timestamp: data.timestamp,
          previous_block: data.previous_block,
          diff: data.diff,
          hash: data.hash,
          tx_root: data.tx_root,
          txs: data.txs || [],
          wallet_list: data.wallet_list,
          reward_addr: data.reward_addr,
          tags: data.tags || [],
          reward_pool: data.reward_pool,
          weave_size: data.weave_size || 0,
          block_size: data.block_size || 0,
          cumulative_diff: data.cumulative_diff,
          hash_list_merkle: data.hash_list_merkle,
          poa: data.poa || {
            option: '',
            tx_path: '',
            data_path: '',
            chunk: ''
          }
        };
      } catch (error) {
        console.error('Error fetching block:', error);
        throw error;
      }
    },
    {
      refetchInterval: 30000,
      retry: 2,
      onError: (error) => {
        console.error('Block query error:', error);
      }
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (!block) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link 
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Home
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-sm text-gray-700">Block #{formatNumber(block?.height || 0)}</span>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">
                Block #{formatNumber(block?.height || 0)}
              </h1>
              <div className="flex space-x-4">
                <Link 
                  to={`/block/${(block?.height || 0) - 1}`}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 bg-white rounded-md border border-gray-200 hover:border-gray-300"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Previous
                </Link>
                <Link 
                  to={`/block/${(block?.height || 0) + 1}`}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 bg-white rounded-md border border-gray-200 hover:border-gray-300"
                >
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Block Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-white">
            {/* Sol Kolon */}
            <div className="space-y-6">
              <DetailItem
                icon={<HashtagIcon className="h-5 w-5" />}
                label="Block Hash"
                value={block?.indep_hash}
                isCopyable
              />
              <DetailItem
                icon={<ClockIcon className="h-5 w-5" />}
                label="Timestamp"
                value={formatTimeAgo(block?.timestamp * 1000)}
              />
              <DetailItem
                icon={<UserIcon className="h-5 w-5" />}
                label="Miner"
                value={block?.reward_addr}
                isCopyable
              />
              <DetailItem
                icon={<ScaleIcon className="h-5 w-5" />}
                label="Block Size"
                value={formatBytes(block?.block_size || 0)}
              />
            </div>

            {/* Sağ Kolon */}
            <div className="space-y-6">
              <DetailItem
                icon={<CubeIcon className="h-5 w-5" />}
                label="Transactions"
                value={`${block?.txs.length || 0} transactions`}
              />
              <DetailItem
                icon={<HashtagIcon className="h-5 w-5" />}
                label="Previous Block"
                value={block?.previous_block}
                isLink
                to={`/block/${(block?.height || 0) - 1}`}
              />
              <DetailItem
                icon={<HashtagIcon className="h-5 w-5" />}
                label="Merkle Root"
                value={block?.tx_root}
                isCopyable
              />
              <DetailItem
                icon={<HashtagIcon className="h-5 w-5" />}
                label="Weave Size"
                value={formatBytes(block?.weave_size || 0)}
              />
            </div>
          </div>

          {/* Transactions List */}
          {block?.txs.length > 0 && (
            <div className="border-t border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Transactions ({block.txs.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TX ID
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {block.txs.map((txId) => (
                      <tr key={txId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link 
                            to={`/tx/${txId}`}
                            className="text-blue-600 hover:text-blue-900 font-mono"
                          >
                            {txId}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          -
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  isCopyable?: boolean;
  isLink?: boolean;
  to?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value, isCopyable, isLink, to }) => (
  <div className="flex items-start space-x-3">
    <div className="text-gray-400 mt-0.5">{icon}</div>
    <div className="flex-1">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-sm text-gray-900 break-all font-mono">
        {isLink && to ? (
          <Link to={to} className="text-blue-600 hover:text-blue-800">
            {value}
          </Link>
        ) : (
          <span>{value}</span>
        )}
        {isCopyable && (
          <button 
            onClick={() => navigator.clipboard.writeText(value.toString())}
            className="ml-2 text-gray-400 hover:text-gray-600 inline-flex items-center"
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  </div>
);

export default BlockDetailsComponent; 