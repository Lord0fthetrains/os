import React, { useEffect, useState } from 'react';
import { Power, RotateCw, Play, Square, Search } from 'lucide-react';

export const ServiceControlsPage: React.FC = () => {
  const [query, setQuery] = useState('nginx|apache2|docker|ssh|sshd');
  const [output, setOutput] = useState('');
  const [service, setService] = useState('nginx');
  const [isBusy, setIsBusy] = useState(false);

  const listServices = async () => {
    const res = await fetch(`/api/services?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setOutput(data.output || '');
  };

  const perform = async (name: string, action: 'start' | 'stop' | 'restart' | 'status') => {
    setIsBusy(true);
    try {
      const res = await fetch(`/api/services/${encodeURIComponent(name)}/${action}`, { method: 'POST' });
      const data = await res.json();
      setOutput((prev) => `${prev}\n\n$ systemctl ${action} ${name}\n${data.output || data.error || ''}`.trim());
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => { listServices(); }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto" style={{ color: 'var(--serversphere-text)' }}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Service Controls</h1>
        <p style={{ color: 'var(--serversphere-text-muted)' }}>Start, stop, and restart systemd services</p>
      </div>

      <div className="rounded-lg shadow-sm border p-4 mb-4" style={{ backgroundColor: 'var(--serversphere-card)', borderColor: 'var(--serversphere-border)' }}>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-sm mb-1">Filter</label>
            <div className="flex items-center gap-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 bg-transparent border rounded px-3 py-2" style={{ borderColor: 'var(--serversphere-border)' }} />
              <button onClick={listServices} className="px-3 py-2 rounded flex items-center gap-2" style={{ backgroundColor: '#2a2a4e' }}>
                <Search className="w-4 h-4" />
                List
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Service</label>
            <input value={service} onChange={(e) => setService(e.target.value)} className="bg-transparent border rounded px-3 py-2" style={{ borderColor: 'var(--serversphere-border)' }} />
          </div>

          <div className="flex items-center gap-2">
            <button disabled={isBusy} onClick={() => perform(service, 'start')} className="px-3 py-2 rounded flex items-center gap-2" style={{ backgroundColor: '#2a2a4e' }}>
              <Play className="w-4 h-4" /> Start
            </button>
            <button disabled={isBusy} onClick={() => perform(service, 'stop')} className="px-3 py-2 rounded flex items-center gap-2" style={{ backgroundColor: '#2a2a4e' }}>
              <Square className="w-4 h-4" /> Stop
            </button>
            <button disabled={isBusy} onClick={() => perform(service, 'restart')} className="px-3 py-2 rounded flex items-center gap-2" style={{ backgroundColor: '#2a2a4e' }}>
              <RotateCw className="w-4 h-4" /> Restart
            </button>
            <button disabled={isBusy} onClick={() => perform(service, 'status')} className="px-3 py-2 rounded flex items-center gap-2" style={{ backgroundColor: '#2a2a4e' }}>
              <Power className="w-4 h-4" /> Status
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg shadow-sm border p-4" style={{ backgroundColor: 'var(--serversphere-card)', borderColor: 'var(--serversphere-border)' }}>
        <pre className="whitespace-pre-wrap text-sm overflow-auto" style={{ maxHeight: 600 }}>{output}</pre>
      </div>
    </div>
  );
};


