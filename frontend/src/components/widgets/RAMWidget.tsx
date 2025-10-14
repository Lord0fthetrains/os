import React from 'react';
import { MemoryStick } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface RAMWidgetProps {
  stats: {
    total: number;
    used: number;
    free: number;
    cached: number;
    swap: {
      total: number;
      used: number;
      free: number;
    };
  };
}

export const RAMWidget: React.FC<RAMWidgetProps> = ({ stats }) => {
  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const usagePercentage = Math.round((stats.used / stats.total) * 100);
  const swapUsagePercentage = stats.swap.total > 0 ? Math.round((stats.swap.used / stats.swap.total) * 100) : 0;

  const ramData = [
    { name: 'Used', value: stats.used, color: '#ef4444' },
    { name: 'Cached', value: stats.cached, color: '#f59e0b' },
    { name: 'Free', value: stats.free, color: '#10b981' }
  ];

  // const swapData = [
  //   { name: 'Used', value: stats.swap.used, color: '#ef4444' },
  //   { name: 'Free', value: stats.swap.free, color: '#10b981' }
  // ];

  const getUsageColor = (usage: number) => {
    if (usage < 60) return 'text-green-600 dark:text-green-400';
    if (usage < 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <MemoryStick className="w-5 h-5 text-primary-600" />
          <h3 className="widget-title">Memory Usage</h3>
        </div>
        <div className={`text-lg font-bold ${getUsageColor(usagePercentage)}`}>
          {usagePercentage}%
        </div>
      </div>

      <div className="space-y-4">
        {/* RAM Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">RAM</span>
            <span className="font-semibold">
              {formatBytes(stats.used)} / {formatBytes(stats.total)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                usagePercentage < 60 ? 'bg-green-500' : 
                usagePercentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* RAM Breakdown Chart */}
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ramData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {ramData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatBytes(value), '']}
                labelFormatter={(label) => `${label} Memory`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Memory Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="metric-card">
            <div className="metric-value text-sm truncate" title={formatBytes(stats.used)}>{formatBytes(stats.used)}</div>
            <div className="metric-label">Used</div>
          </div>
          <div className="metric-card">
            <div className="metric-value text-sm truncate" title={formatBytes(stats.cached)}>{formatBytes(stats.cached)}</div>
            <div className="metric-label">Cached</div>
          </div>
          <div className="metric-card">
            <div className="metric-value text-sm truncate" title={formatBytes(stats.free)}>{formatBytes(stats.free)}</div>
            <div className="metric-label">Free</div>
          </div>
          <div className="metric-card">
            <div className="metric-value text-sm truncate" title={formatBytes(stats.total)}>{formatBytes(stats.total)}</div>
            <div className="metric-label">Total</div>
          </div>
        </div>

        {/* Swap Usage */}
        {stats.swap.total > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-dark-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Swap</span>
              <span className="font-semibold">
                {formatBytes(stats.swap.used)} / {formatBytes(stats.swap.total)}
                <span className="ml-1 text-xs">({swapUsagePercentage}%)</span>
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${
                  swapUsagePercentage < 50 ? 'bg-blue-500' : 
                  swapUsagePercentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(swapUsagePercentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
