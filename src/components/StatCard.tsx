import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 rounded-lg bg-indigo-50">
        <div className="text-indigo-600">{icon}</div>
      </div>
      {change && (
        <div className={`text-sm font-medium ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
        </div>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default StatCard; 