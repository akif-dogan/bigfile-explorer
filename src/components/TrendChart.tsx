import React from 'react';

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
  // Şimdilik basit bir görünüm
  const latestValue = data.length > 0 ? data[data.length - 1].value : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-4">
        <p className="text-2xl font-semibold text-gray-900">
          {formatValue(latestValue)}{suffix}
        </p>
      </div>
    </div>
  );
};

export default TrendChart; 