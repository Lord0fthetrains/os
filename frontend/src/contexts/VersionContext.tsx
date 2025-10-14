import React, { createContext, useContext, useState, useEffect } from 'react';
import { VersionService, VersionInfo } from '../services/versionService';

interface VersionContextType {
  versionInfo: VersionInfo | null;
  isChecking: boolean;
  lastChecked: Date | null;
  checkForUpdates: () => Promise<void>;
  error: string | null;
}

const VersionContext = createContext<VersionContextType | undefined>(undefined);

export const useVersion = () => {
  const context = useContext(VersionContext);
  if (context === undefined) {
    throw new Error('useVersion must be used within a VersionProvider');
  }
  return context;
};

interface VersionProviderProps {
  children: React.ReactNode;
}

export const VersionProvider: React.FC<VersionProviderProps> = ({ children }) => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkForUpdates = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const info = await VersionService.checkForUpdates();
      setVersionInfo(info);
      setLastChecked(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check for updates');
    } finally {
      setIsChecking(false);
    }
  };

  // Check for updates on mount
  useEffect(() => {
    checkForUpdates();
  }, []);

  const value = {
    versionInfo,
    isChecking,
    lastChecked,
    checkForUpdates,
    error
  };

  return (
    <VersionContext.Provider value={value}>
      {children}
    </VersionContext.Provider>
  );
};
