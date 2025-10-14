import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  systemStats: SystemStats | null;
  dockerContainers: ContainerInfo[];
  dockerStats: Map<string, ContainerStats>;
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

interface SystemStats {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    cached: number;
    swap: {
      total: number;
      used: number;
      free: number;
    };
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  }[];
  network: {
    interface: string;
    rx_sec: number;
    tx_sec: number;
    rx_bytes: number;
    tx_bytes: number;
  }[];
  uptime: number;
  os: {
    platform: string;
    distro: string;
    release: string;
    arch: string;
  };
}

interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  created: string;
  ports: string[];
}

interface ContainerStats {
  id: string;
  cpuUsage: number;
  memoryUsage: number;
  memoryLimit: number;
  networkRx: number;
  networkTx: number;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [dockerContainers, setDockerContainers] = useState<ContainerInfo[]>([]);
  const [dockerStats, setDockerStats] = useState<Map<string, ContainerStats>>(new Map());

  useEffect(() => {
    const newSocket = io();
    
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      
      // Subscribe to monitoring events once connected
      newSocket.emit('subscribe:system');
      newSocket.emit('subscribe:docker');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
    });

    newSocket.on('system:stats', (stats: SystemStats) => {
      console.log('Received system stats:', stats);
      setSystemStats(stats);
    });

    newSocket.on('docker:containers', (containers: ContainerInfo[]) => {
      console.log('Received docker containers:', containers);
      setDockerContainers(containers);
    });

    newSocket.on('docker:stats', ({ containerId, stats }: { containerId: string; stats: ContainerStats }) => {
      console.log('Received docker stats for container:', containerId, stats);
      setDockerStats((prev: Map<string, ContainerStats>) => new Map(prev.set(containerId, stats)));
    });

    newSocket.on('system:error', (error: any) => {
      console.error('System error:', error);
    });

    newSocket.on('docker:error', (error: any) => {
      console.error('Docker error:', error);
    });

    setSocket(newSocket);

    return () => {
      // Unsubscribe from monitoring events before closing
      if (newSocket.connected) {
        newSocket.emit('unsubscribe:system');
        newSocket.emit('unsubscribe:docker');
      }
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
