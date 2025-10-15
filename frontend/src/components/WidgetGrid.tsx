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
import { UpdateWidget } from './widgets/UpdateWidget';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useWidgetSettings } from '../contexts/WidgetSettingsContext';
import { apiCall } from '../utils/api';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetGridProps {
  className?: string;
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({ className = '' }) => {
  const { systemStats, dockerContainers, dockerStats, socket } = useWebSocket();
  const { widgetConfigs, updateWidgetSize } = useWidgetSettings();
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

  // Save layouts to localStorage and update widget settings
  const handleLayoutChange = (layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    setLayouts(layouts);
    localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
    
    // Update widget sizes in settings
    layout.forEach(item => {
      updateWidgetSize(item.i, {
        w: item.w,
        h: item.h,
        minW: item.minW,
        minH: item.minH,
        maxW: item.maxW,
        maxH: item.maxH
      });
    });
  };

  // Docker actions
  const handleStartContainer = async (id: string) => {
    try {
      const response = await apiCall(`/api/docker/containers/${id}/start`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to start container');
    } catch (error) {
      console.error('Error starting container:', error);
    }
  };

  const handleStopContainer = async (id: string) => {
    try {
      const response = await apiCall(`/api/docker/containers/${id}/stop`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to stop container');
    } catch (error) {
      console.error('Error stopping container:', error);
    }
  };

  const handleRestartContainer = async (id: string) => {
    try {
      const response = await apiCall(`/api/docker/containers/${id}/restart`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to restart container');
    } catch (error) {
      console.error('Error restarting container:', error);
    }
  };

  // Subscribe to system monitoring
  useEffect(() => {
    if (socket && socket.connected) {
      console.log('Subscribing to system and docker monitoring');
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


  // Generate layouts based on enabled widgets
  const generateLayouts = () => {
    const enabledWidgets = widgetConfigs.filter(widget => widget.enabled);
    const layouts: { [key: string]: Layout[] } = {};
    
    // Generate layouts for each breakpoint
    const breakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'];
    breakpoints.forEach(bp => {
      layouts[bp] = enabledWidgets.map((widget, index) => ({
        i: widget.id,
        x: (index * widget.size.w) % 12,
        y: Math.floor((index * widget.size.w) / 12) * widget.size.h,
        w: widget.size.w,
        h: widget.size.h,
        minW: widget.size.minW || 2,
        minH: widget.size.minH || 3,
        maxW: widget.size.maxW,
        maxH: widget.size.maxH
      }));
    });
    
    return layouts;
  };

  const currentLayouts = Object.keys(layouts).length > 0 ? layouts : generateLayouts();

  return (
    <div className={`${className} widget-grid-container`}>
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
        {/* Render only enabled widgets */}
        {widgetConfigs
          .filter(widget => widget.enabled)
          .map(widget => {
            switch (widget.id) {
              case 'cpu':
                return (
                  <div key="cpu" className="widget">
                    <CPUWidget 
                      stats={systemStats?.cpu || { usage: 0, cores: 0, temperature: 0, loadAverage: [0, 0, 0] }}
                      history={[]}
                    />
                  </div>
                );
              case 'ram':
                return (
                  <div key="ram" className="widget">
                    <RAMWidget 
                      stats={systemStats?.memory || { 
                        total: 0, used: 0, free: 0, cached: 0, 
                        swap: { total: 0, used: 0, free: 0 } 
                      }}
                    />
                  </div>
                );
              case 'disk':
                return (
                  <div key="disk" className="widget">
                    <DiskWidget 
                      disks={systemStats?.disk || []}
                    />
                  </div>
                );
              case 'network':
                return (
                  <div key="network" className="widget">
                    <NetworkWidget 
                      interfaces={systemStats?.network || []}
                      history={[]}
                    />
                  </div>
                );
              case 'docker':
                return (
                  <div key="docker" className="widget">
                    <DockerWidget
                      containers={dockerContainers}
                      containerStats={dockerStats}
                      onStartContainer={handleStartContainer}
                      onStopContainer={handleStopContainer}
                      onRestartContainer={handleRestartContainer}
                    />
                  </div>
                );
              case 'weather':
                return (
                  <div key="weather" className="widget">
                    <WeatherWidget city="London" />
                  </div>
                );
              case 'news':
                return (
                  <div key="news" className="widget">
                    <NewsWidget category="technology" limit={5} />
                  </div>
                );
              case 'crypto':
                return (
                  <div key="crypto" className="widget">
                    <CryptoWidget limit={5} />
                  </div>
                );
              case 'update':
                return (
                  <div key="update" className="widget">
                    <UpdateWidget />
                  </div>
                );
              default:
                return null;
            }
          })}
      </ResponsiveGridLayout>
    </div>
  );
};
