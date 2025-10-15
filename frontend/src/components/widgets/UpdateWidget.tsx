import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { apiCall } from '../../utils/api';

interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  isUpToDate: boolean;
  updateAvailable: boolean;
  lastChecked: string;
}

interface UpdateWidgetProps {
  className?: string;
}

export const UpdateWidget: React.FC<UpdateWidgetProps> = ({ className = '' }) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);

  // Add console log
  const addConsoleLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleOutput(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Check for updates
  const checkForUpdates = async () => {
    setIsChecking(true);
    addConsoleLog('Checking for updates...');
    try {
      const response = await apiCall('/api/update/check');
      if (!response.ok) {
        addConsoleLog(`Error: HTTP ${response.status} - ${response.statusText}`);
        throw new Error('Failed to check for updates');
      }
      
      const data = await response.json();
      addConsoleLog(`Current version: ${data.currentVersion}, Latest: ${data.latestVersion}`);
      addConsoleLog(`Update available: ${data.updateAvailable ? 'Yes' : 'No'}`);
      setUpdateInfo(data);
    } catch (error) {
      console.error('Error checking for updates:', error);
      addConsoleLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUpdateStatus('Failed to check for updates');
    } finally {
      setIsChecking(false);
    }
  };

  // Perform update
  const performUpdate = async () => {
    setIsUpdating(true);
    setUpdateStatus('Starting update...');
    setConsoleOutput([]); // Clear previous console output
    addConsoleLog('Starting update process...');
    
    try {
      addConsoleLog('Sending update request to backend...');
      const response = await apiCall('/api/update/perform', {
        method: 'POST'
      });
      
      addConsoleLog(`Response status: ${response.status} ${response.statusText}`);
      const data = await response.json();
      addConsoleLog(`Response data: ${JSON.stringify(data, null, 2)}`);
      
      if (!response.ok) {
        addConsoleLog(`Error: ${data.error || 'Update failed'}`);
        throw new Error(data.error || 'Update failed');
      }
      
      if (data.noChanges) {
        addConsoleLog('No changes detected - already up to date');
        setUpdateStatus('Already up to date - no changes needed');
      } else {
        addConsoleLog('Update completed successfully');
        setUpdateStatus(data.message || 'Update completed successfully');
        
        if (data.changes) {
          addConsoleLog(`Changes: ${data.changes.from} → ${data.changes.to}`);
          setUpdateStatus(`${data.message} (${data.changes.from} → ${data.changes.to})`);
        }
      }
      
      // Refresh update info after successful update
      setTimeout(() => {
        addConsoleLog('Refreshing update info...');
        checkForUpdates();
      }, 3000);
      
    } catch (error) {
      console.error('Error updating:', error);
      addConsoleLog(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUpdateStatus(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
      addConsoleLog('Update process finished');
    }
  };

  // Check for updates on component mount
  useEffect(() => {
    checkForUpdates();
  }, []);

  const getStatusIcon = () => {
    if (isChecking || isUpdating) {
      return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    
    if (updateInfo?.isUpToDate) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    if (updateInfo?.updateAvailable) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    
    return <AlertCircle className="w-5 h-5 text-gray-500" />;
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking for updates...';
    if (isUpdating) return 'Updating...';
    if (updateInfo?.isUpToDate) return 'Currently at the latest version';
    if (updateInfo?.updateAvailable) return 'Update available';
    return 'Unable to check updates';
  };

  const getVersionInfo = () => {
    if (!updateInfo) return null;
    
    if (updateInfo.isUpToDate) {
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Version {updateInfo.currentVersion} is up to date
        </div>
      );
    }
    
    if (updateInfo.updateAvailable) {
      return (
        <div className="text-sm text-yellow-600 dark:text-yellow-400">
          New version available: v{updateInfo.latestVersion}
        </div>
      );
    }
    
    return null;
  };

  const getStatusColor = () => {
    if (isChecking || isUpdating) return 'text-blue-600 dark:text-blue-400';
    if (updateInfo?.isUpToDate) return 'text-green-600 dark:text-green-400';
    if (updateInfo?.updateAvailable) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className={`widget ${className}`}>
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-primary-600" />
          <h3 className="widget-title">Update</h3>
        </div>
        {updateInfo && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            v{updateInfo.currentVersion}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Version Info */}
        {getVersionInfo()}

        {/* Update Info */}
        {updateInfo && updateInfo.updateAvailable && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
            <div className="text-sm">
              <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                New version available!
              </div>
              <div className="text-yellow-700 dark:text-yellow-300">
                Current: v{updateInfo.currentVersion} → Latest: v{updateInfo.latestVersion}
              </div>
            </div>
          </div>
        )}

        {/* Update Status */}
        {updateStatus && (
          <div className={`p-3 rounded-lg text-sm ${
            updateStatus.includes('success') || updateStatus.includes('completed')
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200'
              : updateStatus.includes('failed') || updateStatus.includes('error')
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'
              : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200'
          }`}>
            {updateStatus}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={checkForUpdates}
            disabled={isChecking || isUpdating}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            Check Updates
          </button>
          
          {updateInfo?.updateAvailable && (
            <button
              onClick={performUpdate}
              disabled={isUpdating}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              {isUpdating ? 'Updating...' : 'Update Now'}
            </button>
          )}

          {/* Console Toggle */}
          <button
            onClick={() => setShowConsole(!showConsole)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-xs">📋</span>
            {showConsole ? 'Hide Console' : 'Show Console'}
          </button>
        </div>

        {/* Console Output */}
        {showConsole && (
          <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs max-h-48 overflow-y-auto">
            <div className="text-gray-500 mb-2 text-xs">Console Output:</div>
            {consoleOutput.length === 0 ? (
              <div className="text-gray-600">No console output yet...</div>
            ) : (
              consoleOutput.map((line, index) => (
                <div key={index} className="mb-1">
                  {line}
                </div>
              ))
            )}
          </div>
        )}

        {/* Last Checked */}
        {updateInfo?.lastChecked && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last checked: {new Date(updateInfo.lastChecked).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};
