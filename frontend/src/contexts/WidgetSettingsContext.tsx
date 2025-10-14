import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WidgetConfig {
  id: string;
  name: string;
  enabled: boolean;
  size: {
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  };
}

interface WidgetSettingsContextType {
  widgetConfigs: WidgetConfig[];
  toggleWidget: (widgetId: string) => void;
  updateWidgetSize: (widgetId: string, size: Partial<WidgetConfig['size']>) => void;
  resetToDefaults: () => void;
}

const defaultWidgetConfigs: WidgetConfig[] = [
  { id: 'cpu', name: 'CPU Usage', enabled: true, size: { w: 3, h: 4, minW: 2, minH: 3 } },
  { id: 'ram', name: 'Memory Usage', enabled: true, size: { w: 3, h: 4, minW: 2, minH: 3 } },
  { id: 'disk', name: 'Disk Usage', enabled: true, size: { w: 3, h: 4, minW: 2, minH: 3 } },
  { id: 'network', name: 'Network Activity', enabled: true, size: { w: 3, h: 4, minW: 2, minH: 3 } },
  { id: 'docker', name: 'Docker Containers', enabled: true, size: { w: 6, h: 6, minW: 4, minH: 4 } },
  { id: 'weather', name: 'Weather', enabled: true, size: { w: 3, h: 4, minW: 2, minH: 3 } },
  { id: 'news', name: 'News', enabled: true, size: { w: 3, h: 4, minW: 2, minH: 3 } },
  { id: 'crypto', name: 'Cryptocurrency', enabled: true, size: { w: 3, h: 4, minW: 2, minH: 3 } },
];

const WidgetSettingsContext = createContext<WidgetSettingsContextType | undefined>(undefined);

export const useWidgetSettings = () => {
  const context = useContext(WidgetSettingsContext);
  if (context === undefined) {
    throw new Error('useWidgetSettings must be used within a WidgetSettingsProvider');
  }
  return context;
};

interface WidgetSettingsProviderProps {
  children: React.ReactNode;
}

export const WidgetSettingsProvider: React.FC<WidgetSettingsProviderProps> = ({ children }) => {
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('widget-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultWidgetConfigs;
      }
    }
    return defaultWidgetConfigs;
  });

  useEffect(() => {
    localStorage.setItem('widget-settings', JSON.stringify(widgetConfigs));
  }, [widgetConfigs]);

  const toggleWidget = (widgetId: string) => {
    setWidgetConfigs(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, enabled: !widget.enabled }
          : widget
      )
    );
  };

  const updateWidgetSize = (widgetId: string, size: Partial<WidgetConfig['size']>) => {
    setWidgetConfigs(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, size: { ...widget.size, ...size } }
          : widget
      )
    );
  };

  const resetToDefaults = () => {
    setWidgetConfigs(defaultWidgetConfigs);
  };

  const value = {
    widgetConfigs,
    toggleWidget,
    updateWidgetSize,
    resetToDefaults
  };

  return (
    <WidgetSettingsContext.Provider value={value}>
      {children}
    </WidgetSettingsContext.Provider>
  );
};
