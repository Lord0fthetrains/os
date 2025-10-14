import React, { useEffect, useState } from 'react';
import { RefreshCw, FileText, Box } from 'lucide-react';

export const LogsPage: React.FC = () => {
  const [source, setSource] = useState<'system' | 'docker'>('system');
  const [container, setContainer] = useState('linux-dashboard-backend');
  const [lines, setLines] = useState(200);
  const [log, setLog] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const url = source === 'system'
        ? `/api/logs/system?lines=${lines}`
        : `/api/logs/docker?container=${encodeURIComponent(container)}&lines=${lines}`;
      const res = await fetch(url);
      const data = await res.json();
      setLog(data.log || '');
    } catch (e) {
      setLog('Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  return (
    <div className="p-6 max-w-7xl mx-auto" style={{ color: 'var(--serversphere-text)' }}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Logs</h1>
        <p style={{ color: 'var(--serversphere-text-muted)' }}>View system and container logs</p>
      </div>

      <div className="rounded-lg shadow-sm border p-4 mb-4" style={{ backgroundColor: 'var(--serversphere-card)', borderColor: 'var(--serversphere-border)' }}>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm mb-1">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as 'system' | 'docker')}
              className="bg-transparent border rounded px-3 py-2"
              style={{ borderColor: 'var(--serversphere-border)' }}
            >
              <option value="system">System</option>
              <option value="docker">Docker</option>
            </select>
          </div>

          {source === 'docker' && (
            <div>
              <label className="block text-sm mb-1">Container</label>
              <input
                value={container}
                onChange={(e) => setContainer(e.target.value)}
                className="bg-transparent border rounded px-3 py-2"
                style={{ borderColor: 'var(--serversphere-border)' }}
                placeholder="container name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">Lines</label>
            <input
              type="number"
              value={lines}
              onChange={(e) => setLines(Number(e.target.value))}
              className="bg-transparent border rounded px-3 py-2 w-28"
              style={{ borderColor: 'var(--serversphere-border)' }}
              min={50}
              step={50}
            />
          </div>

          <button onClick={fetchLogs} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 rounded"
            style={{ backgroundColor: '#2a2a4e' }}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-lg shadow-sm border p-4" style={{ backgroundColor: 'var(--serversphere-card)', borderColor: 'var(--serversphere-border)' }}>
        <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--serversphere-text-muted)' }}>
          {source === 'system' ? <FileText className="w-4 h-4" /> : <Box className="w-4 h-4" />}
          <span className="text-sm">Newest {lines} lines</span>
        </div>
        <pre className="whitespace-pre-wrap text-sm overflow-auto" style={{ maxHeight: 600, color: 'var(--serversphere-text)' }}>{log}</pre>
      </div>
    </div>
  );
};


