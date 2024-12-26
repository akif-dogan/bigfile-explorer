import React from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  TooltipProps
} from 'recharts';
import { NameType } from 'recharts/types/component/DefaultTooltipContent';

// CustomTooltip için props tipini tanımlayalım
interface CustomTooltipProps extends TooltipProps<number, NameType> {
  formatValue: (value: number) => string;
  suffix?: string;
}

// CustomTooltip bileşenini tanımlayalım
const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  formatValue,
  suffix = ''
}) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0];
  if (!dataPoint || typeof dataPoint.value !== 'number') return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-100">
      <p className="text-sm text-gray-600">
        {label}
      </p>
      <p className="text-lg font-semibold text-gray-900">
        {formatValue(dataPoint.value)} {suffix}
      </p>
    </div>
  );
};

interface TrendChartProps {
  title: string;
  data: Array<{ timestamp: string; value: number }>;
  formatValue: (value: number) => string;
  suffix?: string;
  gradient: {
    from: string;
    to: string;
  };
}

const TrendChart: React.FC<TrendChartProps> = ({
  title,
  data,
  formatValue,
  suffix = '',
  gradient
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradient.from} stopOpacity={0.3} />
                <stop offset="100%" stopColor={gradient.to} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            
            <XAxis
              dataKey="timestamp"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={formatValue}
            />
            
            <Tooltip
              content={(props: TooltipProps<number, NameType>) => (
                <CustomTooltip 
                  {...props} 
                  formatValue={formatValue}
                  suffix={suffix}
                />
              )}
            />
            
            <Area
              type="monotone"
              dataKey="value"
              stroke={gradient.from}
              strokeWidth={2}
              fill={`url(#gradient-${title})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default TrendChart; 