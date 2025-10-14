import { Server as SocketIOServer } from 'socket.io';
import { SystemMonitor } from '../services/systemMonitor';
import { DockerService } from '../services/dockerService';

export class SocketHandler {
  private io: SocketIOServer;
  private systemMonitor: SystemMonitor;
  private dockerService: DockerService;
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.systemMonitor = new SystemMonitor();
    this.dockerService = new DockerService();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // System monitoring events
      socket.on('subscribe:system', () => {
        this.startSystemMonitoring(socket);
      });

      socket.on('unsubscribe:system', () => {
        this.stopSystemMonitoring(socket);
      });

      // Docker monitoring events
      socket.on('subscribe:docker', () => {
        this.startDockerMonitoring(socket);
      });

      socket.on('unsubscribe:docker', () => {
        this.stopDockerMonitoring(socket);
      });

      // Container logs streaming
      socket.on('stream:logs', (containerId: string) => {
        this.streamContainerLogs(socket, containerId);
      });

      socket.on('stop:logs', (containerId: string) => {
        this.stopLogStream(socket, containerId);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        this.cleanup(socket);
      });
    });
  }

  private async startSystemMonitoring(socket: any) {
    console.log('Starting system monitoring for socket:', socket.id);
    const intervalId = setInterval(async () => {
      try {
        const stats = await this.systemMonitor.getSystemStats();
        console.log('Sending system stats to socket:', socket.id, 'CPU usage:', stats.cpu.usage);
        socket.emit('system:stats', stats);
      } catch (error) {
        console.error('Error sending system stats:', error);
        socket.emit('system:error', { message: 'Failed to get system stats' });
      }
    }, 2000); // Update every 2 seconds

    this.intervals.set(`system:${socket.id}`, intervalId);
  }

  private stopSystemMonitoring(socket: any) {
    const intervalId = this.intervals.get(`system:${socket.id}`);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(`system:${socket.id}`);
    }
  }

  private async startDockerMonitoring(socket: any) {
    const intervalId = setInterval(async () => {
      try {
        const containers = await this.dockerService.getContainers();
        socket.emit('docker:containers', containers);

        // Get stats for running containers
        const runningContainers = containers.filter(c => c.state === 'running');
        for (const container of runningContainers) {
          try {
            const stats = await this.dockerService.getContainerStats(container.id);
            socket.emit('docker:stats', { containerId: container.id, stats });
          } catch (error) {
            console.error(`Error getting stats for container ${container.id}:`, error);
          }
        }
      } catch (error) {
        console.error('Error sending docker data:', error);
        socket.emit('docker:error', { message: 'Failed to get docker data' });
      }
    }, 3000); // Update every 3 seconds

    this.intervals.set(`docker:${socket.id}`, intervalId);
  }

  private stopDockerMonitoring(socket: any) {
    const intervalId = this.intervals.get(`docker:${socket.id}`);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(`docker:${socket.id}`);
    }
  }

  private async streamContainerLogs(socket: any, containerId: string) {
    try {
      await this.dockerService.streamContainerLogs(containerId, (data: string) => {
        socket.emit('docker:logs', { containerId, data });
      });
    } catch (error) {
      console.error('Error streaming container logs:', error);
      socket.emit('docker:logs:error', { containerId, message: 'Failed to stream logs' });
    }
  }

  private stopLogStream(socket: any, containerId: string) {
    // Note: In a real implementation, you'd need to track and stop specific log streams
    // For now, we'll just emit a stop event
    socket.emit('docker:logs:stopped', { containerId });
  }

  private cleanup(socket: any) {
    // Clean up all intervals for this socket
    this.intervals.forEach((intervalId, key) => {
      if (key.includes(socket.id)) {
        clearInterval(intervalId);
        this.intervals.delete(key);
      }
    });
  }
}
