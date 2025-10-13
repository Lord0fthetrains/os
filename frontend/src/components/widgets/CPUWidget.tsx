import React from 'react';
import { Cpu, Thermometer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CPUWidgetProps {
  stats: {
    usage: number;
    cores: number;
    temperature: number;
    loadAverage: number[];
  };
  history?: Array<{ time: string; usage: number }>;
}

export const CPUWidget: React.FC<CPUWidgetProps> = ({ stats, history = [] }) => {
  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'text-green-600 dark:text-green-400';
    if (usage < 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 60) return 'text-green-600 dark:text-green-400';
    if (temp < 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary-600" />
          <h3 className="widget-title">CPU Usage</h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {stats.cores} cores
        </div>
      </div>

      <div className="space-y-4">
        {/* Current Usage */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getUsageColor(stats.usage)}`}>
            {stats.usage}%
          </div>
          <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                stats.usage < 50 ? 'bg-green-500' : 
                stats.usage < 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(stats.usage, 100)}%` }}
            />
          </div>
        </div>

        {/* Temperature */}
        <div className="flex items-center justify-center gap-2">
          <Thermometer className="w-4 h-4 text-gray-500" />
          <span className={`text-lg font-semibold ${getTemperatureColor(stats.temperature)}`}>
            {stats.temperature}°C
          </span>
        </div>

        {/* Load Average */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">1m</div>
            <div className="font-semibold">{stats.loadAverage[0]?.toFixed(2) || '0.00'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">5m</div>
            <div className="font-semibold">{stats.loadAverage[1]?.toFixed(2) || '0.00'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">15m</div>
            <div className="font-semibold">{stats.loadAverage[2]?.toFixed(2) || '0.00'}</div>
          </div>
        </div>

        {/* Usage Chart */}
        {history.length > 0 && (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                  formatter={(value) => [`${value}%`, 'Usage']}
                />
                <Line 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
