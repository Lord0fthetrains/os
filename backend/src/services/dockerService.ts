import Docker from 'dockerode';

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  created: string;
  ports: string[];
  cpuUsage?: number;
  memoryUsage?: number;
  memoryLimit?: number;
}

export interface ContainerStats {
  id: string;
  cpuUsage: number;
  memoryUsage: number;
  memoryLimit: number;
  networkRx: number;
  networkTx: number;
  blockRead: number;
  blockWrite: number;
}

export class DockerService {
  private docker: Docker;

  constructor() {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  async getContainers(): Promise<ContainerInfo[]> {
    try {
      const containers = await this.docker.listContainers({ all: true });
      
      return containers.map(container => ({
        id: container.Id,
        name: container.Names[0]?.replace('/', '') || 'Unknown',
        image: container.Image,
        status: container.Status,
        state: container.State,
        created: container.Created,
        ports: Object.keys(container.Ports).map(port => 
          `${port.privatePort}${port.publicPort ? `:${port.publicPort}` : ''}`
        )
      }));
    } catch (error) {
      console.error('Error getting containers:', error);
      throw new Error('Failed to connect to Docker daemon. Make sure Docker is running and accessible.');
    }
  }

  async getContainerStats(containerId: string): Promise<ContainerStats> {
    try {
      const container = this.docker.getContainer(containerId);
      const stats = await container.stats({ stream: false });
      
      const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
      const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
      const cpuUsage = systemDelta > 0 ? (cpuDelta / systemDelta) * 100 : 0;
      
      const memoryUsage = stats.memory_stats.usage || 0;
      const memoryLimit = stats.memory_stats.limit || 0;
      
      const networkStats = stats.networks || {};
      const networkRx = Object.values(networkStats).reduce((sum: number, net: any) => sum + (net.rx_bytes || 0), 0);
      const networkTx = Object.values(networkStats).reduce((sum: number, net: any) => sum + (net.tx_bytes || 0), 0);
      
      const blockStats = stats.blkio_stats?.io_service_bytes_recursive || [];
      const blockRead = blockStats.find((stat: any) => stat.op === 'Read')?.value || 0;
      const blockWrite = blockStats.find((stat: any) => stat.op === 'Write')?.value || 0;
      
      return {
        id: containerId,
        cpuUsage: Math.round(cpuUsage * 100) / 100,
        memoryUsage,
        memoryLimit,
        networkRx,
        networkTx,
        blockRead,
        blockWrite
      };
    } catch (error) {
      console.error('Error getting container stats:', error);
      throw error;
    }
  }

  async startContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.start();
    } catch (error) {
      console.error('Error starting container:', error);
      throw error;
    }
  }

  async stopContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.stop();
    } catch (error) {
      console.error('Error stopping container:', error);
      throw error;
    }
  }

  async restartContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.restart();
    } catch (error) {
      console.error('Error restarting container:', error);
      throw error;
    }
  }

  async getContainerLogs(containerId: string, tail: number = 100): Promise<string> {
    try {
      const container = this.docker.getContainer(containerId);
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail,
        timestamps: true
      });
      
      return logs.toString();
    } catch (error) {
      console.error('Error getting container logs:', error);
      throw error;
    }
  }

  async streamContainerLogs(containerId: string, callback: (data: string) => void): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      const stream = await container.logs({
        stdout: true,
        stderr: true,
        follow: true,
        timestamps: true
      });
      
      stream.on('data', (chunk) => {
        callback(chunk.toString());
      });
      
      stream.on('error', (error) => {
        console.error('Error streaming container logs:', error);
      });
    } catch (error) {
      console.error('Error setting up log stream:', error);
      throw error;
    }
  }
}
