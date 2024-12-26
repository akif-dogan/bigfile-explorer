import React from 'react';
import { motion } from 'framer-motion';
import { CubeIcon } from '@heroicons/react/24/outline';
import { formatBytes, formatBlockTime, formatNumber } from '../utils/format';

interface BlockListProps {
  blocks: Array<{
    hash: string;
    height: number;
    timestamp: number;
    size: number;
    txCount: number;
  }>;
  onBlockClick: (hash: string) => void;
}

const BlockList: React.FC<BlockListProps> = ({ blocks, onBlockClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Recent Blocks</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
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
          <tbody className="bg-white divide-y divide-gray-100">
            {blocks.map((block, index) => (
              <motion.tr
                key={block.hash}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                onClick={() => onBlockClick(block.hash)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-blue-50 mr-3">
                      <CubeIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      #{formatNumber(block.height)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {formatBytes(block.size)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {block.txCount}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {formatBlockTime(block.timestamp)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default BlockList; 