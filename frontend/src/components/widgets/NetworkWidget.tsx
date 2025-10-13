import React from 'react';
import { Wifi, Upload, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface NetworkWidgetProps {
  interfaces: Array<{
    interface: string;
    rx_sec: number;
    tx_sec: number;
    rx_bytes: number;
    tx_bytes: number;
  }>;
  history?: Array<{ time: string; rx: number; tx: number }>;
}

export const NetworkWidget: React.FC<NetworkWidgetProps> = ({ interfaces, history = [] }) => {
  const formatBytes = (bytes: number) => {
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    if (bytes === 0) return '0 B/s';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatTotalBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const totalRx = interfaces.reduce((sum, iface) => sum + iface.rx_sec, 0);
  const totalTx = interfaces.reduce((sum, iface) => sum + iface.tx_sec, 0);
  const totalRxBytes = interfaces.reduce((sum, iface) => sum + iface.rx_bytes, 0);
  const totalTxBytes = interfaces.reduce((sum, iface) => sum + iface.tx_bytes, 0);

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Wifi className="w-5 h-5 text-primary-600" />
          <h3 className="widget-title">Network Activity</h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {interfaces.length} interface{interfaces.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-4">
        {/* Current Speed */}
        <div className="grid grid-cols-2 gap-4">
          <div className="metric-card">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Download</span>
            </div>
            <div className="metric-value text-lg">{formatBytes(totalRx)}</div>
          </div>
          <div className="metric-card">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Upload</span>
            </div>
            <div className="metric-value text-lg">{formatBytes(totalTx)}</div>
          </div>
        </div>

        {/* Network Chart */}
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
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => formatBytes(value)}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                  formatter={(value, name) => [formatBytes(value as number), name === 'rx' ? 'Download' : 'Upload']}
                />
                <Line 
                  type="monotone" 
                  dataKey="rx" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                  name="rx"
                />
                <Line 
                  type="monotone" 
                  dataKey="tx" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  name="tx"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Interface Details */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Interfaces</div>
          {interfaces.map((iface, index) => (
            <div key={index} className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">{iface.interface}</span>
                <div className="flex gap-4 text-xs">
                  <span className="text-green-600 dark:text-green-400">
                    ↓ {formatBytes(iface.rx_sec)}
                  </span>
                  <span className="text-blue-600 dark:text-blue-400">
                    ↑ {formatBytes(iface.tx_sec)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div>Total ↓: {formatTotalBytes(iface.rx_bytes)}</div>
                <div>Total ↑: {formatTotalBytes(iface.tx_bytes)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Data */}
        <div className="pt-2 border-t border-gray-200 dark:border-dark-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatTotalBytes(totalRxBytes)}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Total Downloaded</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatTotalBytes(totalTxBytes)}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Total Uploaded</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
