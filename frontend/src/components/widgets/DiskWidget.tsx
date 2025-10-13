import React from 'react';
import { HardDrive } from 'lucide-react';

interface DiskWidgetProps {
  disks: Array<{
    total: number;
    used: number;
    free: number;
    usage: number;
  }>;
}

export const DiskWidget: React.FC<DiskWidgetProps> = ({ disks }) => {
  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getUsageColor = (usage: number) => {
    if (usage < 70) return 'text-green-600 dark:text-green-400';
    if (usage < 90) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getBarColor = (usage: number) => {
    if (usage < 70) return 'bg-green-500';
    if (usage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-primary-600" />
          <h3 className="widget-title">Disk Usage</h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {disks.length} drive{disks.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-4">
        {disks.map((disk, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drive {index + 1}
              </span>
              <span className={`text-sm font-bold ${getUsageColor(disk.usage)}`}>
                {disk.usage}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getBarColor(disk.usage)}`}
                style={{ width: `${Math.min(disk.usage, 100)}%` }}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatBytes(disk.used)}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Used</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatBytes(disk.free)}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Free</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatBytes(disk.total)}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Total</div>
              </div>
            </div>
          </div>
        ))}

        {/* Summary */}
        {disks.length > 1 && (
          <div className="pt-3 border-t border-gray-200 dark:border-dark-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatBytes(disks.reduce((sum, disk) => sum + disk.used, 0))}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Total Used</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatBytes(disks.reduce((sum, disk) => sum + disk.total, 0))}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Total Space</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
