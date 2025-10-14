import React, { useEffect, useState } from 'react';
import { AlertTriangle, Cpu, HardDrive, MemoryStick } from 'lucide-react';

interface AlertItem {
  level: 'warning' | 'critical';
  message: string;
}

export const AlertsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<{ cpuLoad1: number; usedMemPct: number; diskPct: number } | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const fetchAlerts = async () => {
    const res = await fetch('/api/alerts');
    const data = await res.json();
    setMetrics(data.metrics || null);
    setAlerts(data.alerts || []);
  };

  useEffect(() => { fetchAlerts(); }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto" style={{ color: 'var(--serversphere-text)' }}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Alerts</h1>
        <p style={{ color: 'var(--serversphere-text-muted)' }}>Threshold checks and recent issues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="metric-card">
          <div className="flex items-center justify-center gap-2">
            <Cpu className="w-5 h-5" />
            <span className="metric-label">CPU Load (1m)</span>
          </div>
          <div className="metric-value">{metrics ? metrics.cpuLoad1.toFixed(2) : '-'}</div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-center gap-2">
            <MemoryStick className="w-5 h-5" />
            <span className="metric-label">Memory Used</span>
          </div>
          <div className="metric-value">{metrics ? `${metrics.usedMemPct}%` : '-'}</div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-center gap-2">
            <HardDrive className="w-5 h-5" />
            <span className="metric-label">Disk Used (/)</span>
          </div>
          <div className="metric-value">{metrics && !Number.isNaN(metrics.diskPct) ? `${metrics.diskPct}%` : '-'}</div>
        </div>
      </div>

      <div className="rounded-lg shadow-sm border p-4" style={{ backgroundColor: 'var(--serversphere-card)', borderColor: 'var(--serversphere-border)' }}>
        <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--serversphere-text-muted)' }}>
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Active Alerts</span>
        </div>
        {alerts.length === 0 ? (
          <p style={{ color: 'var(--serversphere-text-muted)' }}>No alerts</p>
        ) : (
          <ul className="space-y-2">
            {alerts.map((a, i) => (
              <li key={i} className="p-2 rounded" style={{ backgroundColor: '#2a2a4e' }}>
                <span className="font-medium capitalize">{a.level}</span>: {a.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};


