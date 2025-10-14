import React, { useState, useEffect } from 'react';
import { 
  Server, 
  ExternalLink, 
  RefreshCw, 
  Globe, 
  Monitor,
  Database,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

interface DetectedService {
  port: number;
  service: string;
  status: 'open' | 'closed' | 'filtered';
  url?: string;
}


export const ServicesPage: React.FC = () => {
  const [detectedServices, setDetectedServices] = useState<DetectedService[]>([]);
  const [localIP, setLocalIP] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<Date | null>(null);

  const scanForServices = async () => {
    setIsScanning(true);
    try {
      const ipResponse = await fetch('/api/ports/local-ip');
      const ipData = await ipResponse.json();
      const hostIp = ipData.ip || 'localhost';

      const servicesResponse = await fetch(`/api/ports/scan?host=${encodeURIComponent(hostIp)}`);
      
      const servicesData = await servicesResponse.json();
      
      setDetectedServices(servicesData.services || []);
      setLocalIP(hostIp);
      setLastScanned(new Date());
    } catch (error) {
      console.error('Error scanning for services:', error);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    scanForServices();
  }, []);

  const getServiceIcon = (service: string) => {
    const serviceLower = service.toLowerCase();
    if (serviceLower.includes('http')) return Globe;
    if (serviceLower.includes('database') || serviceLower.includes('db')) return Database;
    if (serviceLower.includes('monitor') || serviceLower.includes('dashboard')) return Monitor;
    if (serviceLower.includes('api')) return Zap;
    if (serviceLower.includes('secure') || serviceLower.includes('https')) return Shield;
    return Server;
  };

  const getServiceColor = (service: string) => {
    const serviceLower = service.toLowerCase();
    if (serviceLower.includes('http')) return 'text-blue-600 dark:text-blue-400';
    if (serviceLower.includes('https')) return 'text-green-600 dark:text-green-400';
    if (serviceLower.includes('api')) return 'text-purple-600 dark:text-purple-400';
    if (serviceLower.includes('database')) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const formatLastScanned = () => {
    if (!lastScanned) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastScanned.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" style={{ color: 'var(--serversphere-text)' }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--serversphere-text)' }}>
          Detected Services
        </h1>
        <p style={{ color: 'var(--serversphere-text-muted)' }}>
          Discover and access web services running on your system
        </p>
      </div>

      {/* Controls */}
      <div className="rounded-lg shadow-sm border p-6 mb-6" style={{ 
        backgroundColor: 'var(--serversphere-card)', 
        borderColor: 'var(--serversphere-border)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
      }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Port Scanner
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Scan for running web services on common ports
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 inline mr-1" />
              Last scanned: {formatLastScanned()}
            </div>
            <button
              onClick={scanForServices}
              disabled={isScanning}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Scan Ports'}
            </button>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {detectedServices.length === 0 ? (
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-12 text-center">
          <Server className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Services Detected
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Click "Scan Ports" to discover running web services
          </p>
          <button
            onClick={scanForServices}
            disabled={isScanning}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            Start Scan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {detectedServices.map((service) => {
            const Icon = getServiceIcon(service.service);
            const colorClass = getServiceColor(service.service);
            
            return (
              <div
                key={service.port}
                className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-dark-700 rounded-lg">
                      <Icon className={`w-5 h-5 ${colorClass}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {service.service}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Port {service.port}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Online
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {service.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">URL:</span>
                    <span className="font-mono text-xs text-gray-900 dark:text-white">
                      {localIP}:{service.port}
                    </span>
                  </div>

                  {service.url && (
                    <a
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Service
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {detectedServices.length > 0 && (
        <div className="mt-8 bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Scan Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {detectedServices.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Services Found
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {detectedServices.filter(s => s.status === 'open').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Online Services
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {localIP}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Local IP Address
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
