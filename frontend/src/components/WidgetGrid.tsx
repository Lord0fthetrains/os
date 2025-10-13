import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { CPUWidget } from './widgets/CPUWidget';
import { RAMWidget } from './widgets/RAMWidget';
import { DiskWidget } from './widgets/DiskWidget';
import { NetworkWidget } from './widgets/NetworkWidget';
import { DockerWidget } from './widgets/DockerWidget';
import { WeatherWidget } from './widgets/WeatherWidget';
import { NewsWidget } from './widgets/NewsWidget';
import { CryptoWidget } from './widgets/CryptoWidget';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useTheme } from '../contexts/ThemeContext';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetGridProps {
  className?: string;
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({ className = '' }) => {
  const { systemStats, dockerContainers, dockerStats, socket } = useWebSocket();
  const { theme } = useTheme();
  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>({});
  const [mounted, setMounted] = useState(false);

  // Load layouts from localStorage
  useEffect(() => {
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    if (savedLayouts) {
      setLayouts(JSON.parse(savedLayouts));
    }
    setMounted(true);
  }, []);

  // Save layouts to localStorage
  const handleLayoutChange = (layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    setLayouts(layouts);
    localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
  };

  // Docker actions
  const handleStartContainer = async (id: string) => {
    try {
      const response = await fetch(`/api/docker/containers/${id}/start`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to start container');
    } catch (error) {
      console.error('Error starting container:', error);
    }
  };

  const handleStopContainer = async (id: string) => {
    try {
      const response = await fetch(`/api/docker/containers/${id}/stop`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to stop container');
    } catch (error) {
      console.error('Error stopping container:', error);
    }
  };

  const handleRestartContainer = async (id: string) => {
    try {
      const response = await fetch(`/api/docker/containers/${id}/restart`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to restart container');
    } catch (error) {
      console.error('Error restarting container:', error);
    }
  };

  // Subscribe to system monitoring
  useEffect(() => {
    if (socket && socket.connected) {
      socket.emit('subscribe:system');
      socket.emit('subscribe:docker');
    }
  }, [socket]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-pulse text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const defaultLayouts = {
    lg: [
      { i: 'cpu', x: 0, y: 0, w: 3, h: 4 },
      { i: 'ram', x: 3, y: 0, w: 3, h: 4 },
      { i: 'disk', x: 6, y: 0, w: 3, h: 4 },
      { i: 'network', x: 9, y: 0, w: 3, h: 4 },
      { i: 'docker', x: 0, y: 4, w: 6, h: 6 },
      { i: 'weather', x: 6, y: 4, w: 3, h: 4 },
      { i: 'news', x: 9, y: 4, w: 3, h: 4 },
      { i: 'crypto', x: 6, y: 8, w: 6, h: 4 },
    ],
    md: [
      { i: 'cpu', x: 0, y: 0, w: 6, h: 4 },
      { i: 'ram', x: 6, y: 0, w: 6, h: 4 },
      { i: 'disk', x: 0, y: 4, w: 6, h: 4 },
      { i: 'network', x: 6, y: 4, w: 6, h: 4 },
      { i: 'docker', x: 0, y: 8, w: 12, h: 6 },
      { i: 'weather', x: 0, y: 14, w: 6, h: 4 },
      { i: 'news', x: 6, y: 14, w: 6, h: 4 },
      { i: 'crypto', x: 0, y: 18, w: 12, h: 4 },
    ],
    sm: [
      { i: 'cpu', x: 0, y: 0, w: 12, h: 4 },
      { i: 'ram', x: 0, y: 4, w: 12, h: 4 },
      { i: 'disk', x: 0, y: 8, w: 12, h: 4 },
      { i: 'network', x: 0, y: 12, w: 12, h: 4 },
      { i: 'docker', x: 0, y: 16, w: 12, h: 6 },
      { i: 'weather', x: 0, y: 22, w: 12, h: 4 },
      { i: 'news', x: 0, y: 26, w: 12, h: 4 },
      { i: 'crypto', x: 0, y: 30, w: 12, h: 4 },
    ],
  };

  const currentLayouts = Object.keys(layouts).length > 0 ? layouts : defaultLayouts;

  return (
    <div className={`${className} p-4`}>
      <ResponsiveGridLayout
        className="layout"
        layouts={currentLayouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 6, xxs: 2 }}
        rowHeight={60}
        isDraggable={true}
        isResizable={true}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        useCSSTransforms={false}
        draggableHandle=".widget-header"
      >
        {/* System Monitoring Widgets */}
        <div key="cpu" className="widget">
          <CPUWidget 
            stats={systemStats?.cpu || { usage: 0, cores: 0, temperature: 0, loadAverage: [0, 0, 0] }}
            history={[]}
          />
        </div>

        <div key="ram" className="widget">
          <RAMWidget 
            stats={systemStats?.memory || { 
              total: 0, used: 0, free: 0, cached: 0, 
              swap: { total: 0, used: 0, free: 0 } 
            }}
          />
        </div>

        <div key="disk" className="widget">
          <DiskWidget 
            disks={systemStats?.disk || []}
          />
        </div>

        <div key="network" className="widget">
          <NetworkWidget 
            interfaces={systemStats?.network || []}
            history={[]}
          />
        </div>

        {/* Docker Widget */}
        <div key="docker" className="widget">
          <DockerWidget
            containers={dockerContainers}
            containerStats={dockerStats}
            onStartContainer={handleStartContainer}
            onStopContainer={handleStopContainer}
            onRestartContainer={handleRestartContainer}
          />
        </div>

        {/* API Widgets */}
        <div key="weather" className="widget">
          <WeatherWidget city="London" />
        </div>

        <div key="news" className="widget">
          <NewsWidget category="technology" limit={5} />
        </div>

        <div key="crypto" className="widget">
          <CryptoWidget limit={5} />
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};
