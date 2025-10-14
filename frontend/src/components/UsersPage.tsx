import React, { useEffect, useState } from 'react';
import { Users, TerminalSquare, RefreshCw } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [sessions, setSessions] = useState<Array<{ user: string; tty: string; date: string; host: string | null }>>([]);
  const [sshLog, setSshLog] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, sshRes] = await Promise.all([
        fetch('/api/users/sessions'),
        fetch('/api/users/ssh-history?lines=200')
      ]);
      const sessionsJson = await sessionsRes.json();
      const sshJson = await sshRes.json();
      setSessions(sessionsJson.sessions || []);
      setSshLog(sshJson.log || '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto" style={{ color: 'var(--serversphere-text)' }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Users</h1>
          <p style={{ color: 'var(--serversphere-text-muted)' }}>Current sessions and SSH activity</p>
        </div>
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded" style={{ backgroundColor: '#2a2a4e' }}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg shadow-sm border p-4" style={{ backgroundColor: 'var(--serversphere-card)', borderColor: 'var(--serversphere-border)' }}>
          <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--serversphere-text-muted)' }}>
            <Users className="w-5 h-5" />
            <span className="font-medium">Active Sessions</span>
          </div>
          {sessions.length === 0 ? (
            <p style={{ color: 'var(--serversphere-text-muted)' }}>No active sessions</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: '#2a2a4e' }}>
                  <div className="font-mono text-sm">{s.user}@{s.tty}</div>
                  <div className="text-sm" style={{ color: 'var(--serversphere-text-muted)' }}>{s.date}</div>
                  <div className="text-sm" style={{ color: 'var(--serversphere-text-muted)' }}>{s.host || '-'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg shadow-sm border p-4" style={{ backgroundColor: 'var(--serversphere-card)', borderColor: 'var(--serversphere-border)' }}>
          <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--serversphere-text-muted)' }}>
            <TerminalSquare className="w-5 h-5" />
            <span className="font-medium">SSH History</span>
          </div>
          <pre className="whitespace-pre-wrap text-sm overflow-auto" style={{ maxHeight: 600 }}>{sshLog}</pre>
        </div>
      </div>
    </div>
  );
};


