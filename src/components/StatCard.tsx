import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: {
    from: string;
    to: string;
  };
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  change,
  gradient = { from: '#3B82F6', to: '#2563EB' }
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br"
        style={{ 
          background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` 
        }}
      />
      
      <div className="px-6 py-5 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-xl" 
            style={{ 
              background: `linear-gradient(135deg, ${gradient.from}20, ${gradient.to}20)` 
            }}>
            {icon}
          </div>
          {change && (
            <div className={`flex items-center space-x-1 text-sm ${
              change.isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {change.isPositive ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
              <span>{change.value}%</span>
            </div>
          )}
        </div>
        
        <h3 className="text-gray-500 text-sm font-medium mb-1">
          {title}
        </h3>
        <div className="text-2xl font-bold text-gray-900">
          {value}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard; 