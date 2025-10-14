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

  // Check for updates
  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      const response = await apiCall('/api/update/check');
      if (!response.ok) throw new Error('Failed to check for updates');
      
      const data = await response.json();
      setUpdateInfo(data);
    } catch (error) {
      console.error('Error checking for updates:', error);
      setUpdateStatus('Failed to check for updates');
    } finally {
      setIsChecking(false);
    }
  };

  // Perform update
  const performUpdate = async () => {
    setIsUpdating(true);
    setUpdateStatus('Starting update...');
    
    try {
      const response = await apiCall('/api/update/perform', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Update failed');
      }
      
      if (data.noChanges) {
        setUpdateStatus('Already up to date - no changes needed');
      } else {
        setUpdateStatus(data.message || 'Update completed successfully');
        
        if (data.changes) {
          setUpdateStatus(`${data.message} (${data.changes.from} → ${data.changes.to})`);
        }
      }
      
      // Refresh update info after successful update
      setTimeout(() => {
        checkForUpdates();
      }, 3000);
      
    } catch (error) {
      console.error('Error updating:', error);
      setUpdateStatus(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
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
        </div>

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
