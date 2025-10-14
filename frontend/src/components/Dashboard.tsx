import React, { useState } from 'react';
import { Settings, Sun, Moon, Wifi, WifiOff, Menu } from 'lucide-react';
import { WidgetGrid } from './WidgetGrid';
import { SettingsPanel } from './SettingsPanel';
import { Sidebar } from './Sidebar';
import { ServicesPage } from './ServicesPage';
import { LogsPage } from './LogsPage';
import { UsersPage } from './UsersPage';
import { AlertsPage } from './AlertsPage';
import { ServiceControlsPage } from './ServiceControlsPage';
import { useTheme } from '../contexts/ThemeContext';
import { useWebSocket } from '../contexts/WebSocketContext';

export const Dashboard: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isConnected } = useWebSocket();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="min-h-screen serversphere-main transition-colors">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
      />

      {/* Header */}
      <header className={`serversphere-header shadow-sm transition-all duration-300 ${
        isSidebarOpen ? 'ml-80' : 'ml-16'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                title="Toggle Sidebar"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-2xl font-bold serversphere-logo">
                ServerSphere
              </h1>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm">Disconnected</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${
        isSidebarOpen ? 'ml-80' : 'ml-16'
      }`}>
        {currentPage === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <WidgetGrid />
          </div>
        )}
        {currentPage === 'services' && <ServicesPage />}
        {currentPage === 'logs' && <LogsPage />}
        {currentPage === 'users' && <UsersPage />}
        {currentPage === 'alerts' && <AlertsPage />}
        {currentPage === 'controls' && <ServiceControlsPage />}
        {currentPage === 'settings' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Settings panel is accessible via the gear icon in the header.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`serversphere-header border-t mt-8 transition-all duration-300 ${
        isSidebarOpen ? 'ml-80' : 'ml-16'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <div>
              Linux Dashboard v1.2.0 - Monitor your system with ease
            </div>
            <div className="flex items-center gap-4">
              <span>Built with React & Node.js</span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};
