import React, { useState } from 'react';
import { 
  Home, 
  Settings, 
  Server, 
  Download, 
  RefreshCw, 
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useVersion } from '../contexts/VersionContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

interface DetectedService {
  port: number;
  service: string;
  status: 'open' | 'closed' | 'filtered';
  url?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  onNavigate, 
  currentPage 
}) => {
  const { versionInfo, isChecking, checkForUpdates } = useVersion();
  const [detectedServices, setDetectedServices] = useState<DetectedService[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const scanForServices = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/ports/scan');
      const data = await response.json();
      setDetectedServices(data.services || []);
    } catch (error) {
      console.error('Error scanning for services:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch('/api/version/update', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        // Restart services after update
        await fetch('/api/version/restart', { method: 'POST' });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'services', label: 'Services', icon: Server },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 transition-all duration-300 z-40 ${
      isOpen ? 'w-80' : 'w-16'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700">
        {isOpen && (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dashboard
          </h2>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Version Info */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-dark-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Version</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {versionInfo?.current || '1.2.0'}
              </span>
            </div>
            
            {versionInfo?.isUpdateAvailable && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Update Available
                  </span>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                  v{versionInfo.latest} is available
                </p>
                <button
                  onClick={handleUpdate}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded transition-colors"
                >
                  Update Now
                </button>
              </div>
            )}

            <button
              onClick={checkForUpdates}
              disabled={isChecking}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span className="text-sm">Check Updates</span>
            </button>
          </div>
        </div>
      )}

      {/* Detected Services */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Detected Services
            </span>
            <button
              onClick={scanForServices}
              disabled={isScanning}
              className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {detectedServices.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No services detected. Click refresh to scan.
              </p>
            ) : (
              detectedServices.map((service) => (
                <div
                  key={service.port}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-700 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {service.service}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      :{service.port}
                    </span>
                  </div>
                  {service.url && (
                    <a
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-gray-200 dark:hover:bg-dark-600 rounded transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
