import React, { useState } from 'react';
import { Container, Play, Square, RotateCcw, Terminal, Eye, EyeOff } from 'lucide-react';

interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  created: string;
  ports: string[];
}

interface ContainerStats {
  id: string;
  cpuUsage: number;
  memoryUsage: number;
  memoryLimit: number;
  networkRx: number;
  networkTx: number;
}

interface DockerWidgetProps {
  containers: ContainerInfo[];
  containerStats: Map<string, ContainerStats>;
  onStartContainer: (id: string) => void;
  onStopContainer: (id: string) => void;
  onRestartContainer: (id: string) => void;
}

export const DockerWidget: React.FC<DockerWidgetProps> = ({
  containers,
  containerStats,
  onStartContainer,
  onStopContainer,
  onRestartContainer
}) => {
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  // const getStatusColor = (state: string) => {
  //   switch (state) {
  //     case 'running':
  //       return 'text-green-600 dark:text-green-400';
  //     case 'exited':
  //       return 'text-red-600 dark:text-red-400';
  //     case 'paused':
  //       return 'text-yellow-600 dark:text-yellow-400';
  //     default:
  //       return 'text-gray-600 dark:text-gray-400';
  //   }
  // };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'running':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'exited':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      case 'paused':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(parseInt(dateString) * 1000).toLocaleDateString();
  };

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Container className="w-5 h-5 text-primary-600" />
          <h3 className="widget-title">Docker Containers</h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {containers.length} container{containers.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-3">
        {containers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Container className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No containers found</p>
            <p className="text-sm">Make sure Docker is running</p>
          </div>
        ) : (
          containers.map((container) => {
            const stats = containerStats.get(container.id);
            return (
              <div
                key={container.id}
                className={`border rounded-lg p-3 transition-colors ${
                  selectedContainer === container.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(container.state)}
                    <span className="font-medium text-sm truncate">
                      {container.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedContainer(
                        selectedContainer === container.id ? null : container.id
                      )}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-dark-700 rounded"
                    >
                      {selectedContainer === container.id ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {container.image} • {formatDate(container.created)}
                </div>

                {stats && (
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">CPU:</span>
                      <span className="ml-1 font-semibold">{stats.cpuUsage.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">RAM:</span>
                      <span className="ml-1 font-semibold">{formatBytes(stats.memoryUsage)}</span>
                    </div>
                  </div>
                )}

                {selectedContainer === container.id && (
                  <div className="pt-2 border-t border-gray-200 dark:border-dark-700">
                    <div className="flex gap-1 mb-2">
                      {container.state !== 'running' && (
                        <button
                          onClick={() => onStartContainer(container.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          Start
                        </button>
                      )}
                      {container.state === 'running' && (
                        <button
                          onClick={() => onStopContainer(container.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          <Square className="w-3 h-3" />
                          Stop
                        </button>
                      )}
                      <button
                        onClick={() => onRestartContainer(container.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Restart
                      </button>
                      <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        <Terminal className="w-3 h-3" />
                        {showLogs ? 'Hide' : 'Show'} Logs
                      </button>
                    </div>

                    {container.ports.length > 0 && (
                      <div className="text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Ports:</span>
                        <span className="ml-1 font-mono">{container.ports.join(', ')}</span>
                      </div>
                    )}

                    {showLogs && (
                      <div className="mt-2 p-2 bg-black text-green-400 text-xs font-mono rounded max-h-32 overflow-y-auto">
                        <div className="text-gray-500">Loading logs...</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
