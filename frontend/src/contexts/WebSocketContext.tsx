import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  systemStats: any;
  dockerContainers: any[];
  dockerStats: Map<string, any>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [dockerContainers, setDockerContainers] = useState<any[]>([]);
  const [dockerStats, setDockerStats] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3200');
    
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    newSocket.on('system:stats', (stats) => {
      console.log('Received system stats:', stats);
      setSystemStats(stats);
    });

    newSocket.on('docker:containers', (containers) => {
      setDockerContainers(containers);
    });

    newSocket.on('docker:stats', ({ containerId, stats }) => {
      setDockerStats(prev => new Map(prev.set(containerId, stats)));
    });

    newSocket.on('system:error', (error) => {
      console.error('System error:', error);
    });

    newSocket.on('docker:error', (error) => {
      console.error('Docker error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const value = {
    socket,
    isConnected,
    systemStats,
    dockerContainers,
    dockerStats
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
