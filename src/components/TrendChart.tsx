import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendChartProps {
  title: string;
  data: any;
  formatValue: (value: number) => string;
  suffix?: string;
  gradient?: {
    from: string;
    to: string;
  };
}

const TrendChart: React.FC<TrendChartProps> = ({ 
  title, 
  data, 
  formatValue, 
  suffix,
  gradient = { from: '#8B5CF6', to: '#6366F1' }
}) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradient.from} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={gradient.to} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#6B7280"
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            stroke="#6B7280"
            tick={{ fontSize: 12 }}
            tickLine={false}
            tickFormatter={(value) => formatValue(value)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '12px',
            }}
            formatter={(value: any) => [formatValue(value), title]}
            labelStyle={{ color: '#374151', marginBottom: '4px' }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="value"
            stroke={gradient.from}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#gradient-${title})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm font-medium text-gray-500">24h Volume</p>
        <p className="text-lg font-semibold text-gray-900">
          {formatValue(data.total24h)}{suffix}
        </p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">EOD Estimate</p>
        <p className="text-lg font-semibold text-indigo-600">
          {formatValue(data.eodEstimate)}{suffix}
        </p>
      </div>
    </div>
  </div>
);

export default TrendChart; 