import * as si from 'systeminformation';

export interface SystemStats {
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

export class SystemMonitor {
  private lastNetworkStats: Map<string, { rx_bytes: number; tx_bytes: number; timestamp: number }> = new Map();

  async getSystemStats(): Promise<SystemStats> {
    try {
      const [cpu, memory, disk, network, uptime, os] = await Promise.all([
        this.getCpuStats(),
        this.getMemoryStats(),
        this.getDiskStats(),
        this.getNetworkStats(),
        si.time(),
        si.osInfo()
      ]);

      return {
        cpu,
        memory,
        disk,
        network,
        uptime: uptime.uptime,
        os: {
          platform: os.platform,
          distro: os.distro,
          release: os.release,
          arch: os.arch
        }
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      throw error;
    }
  }

  private async getCpuStats() {
    const [cpuLoad, cpuTemp] = await Promise.all([
      si.currentLoad(),
      si.cpuTemperature()
    ]);

    return {
      usage: Math.round(cpuLoad.currentLoad),
      cores: cpuLoad.cpus.length,
      temperature: cpuTemp.main || 0,
      loadAverage: cpuLoad.avgLoad
    };
  }

  private async getMemoryStats() {
    const mem = await si.mem();
    const memLayout = await si.memLayout();
    
    return {
      total: mem.total,
      used: mem.used,
      free: mem.free,
      cached: mem.cached || 0,
      swap: {
        total: mem.swaptotal,
        used: mem.swapused,
        free: mem.swapfree
      }
    };
  }

  private async getDiskStats() {
    const fsSize = await si.fsSize();
    
    return fsSize.map(disk => ({
      total: disk.size,
      used: disk.used,
      free: disk.available,
      usage: Math.round((disk.used / disk.size) * 100)
    }));
  }

  private async getNetworkStats() {
    const networkStats = await si.networkStats();
    const currentTime = Date.now();
    
    return networkStats.map(iface => {
      const lastStats = this.lastNetworkStats.get(iface.iface);
      const timeDiff = currentTime - (lastStats?.timestamp || currentTime);
      
      let rx_sec = 0;
      let tx_sec = 0;
      
      if (lastStats && timeDiff > 0) {
        rx_sec = ((iface.rx_bytes - lastStats.rx_bytes) / timeDiff) * 1000;
        tx_sec = ((iface.tx_bytes - lastStats.tx_bytes) / timeDiff) * 1000;
      }
      
      this.lastNetworkStats.set(iface.iface, {
        rx_bytes: iface.rx_bytes,
        tx_bytes: iface.tx_bytes,
        timestamp: currentTime
      });
      
      return {
        interface: iface.iface,
        rx_sec: Math.max(0, rx_sec),
        tx_sec: Math.max(0, tx_sec),
        rx_bytes: iface.rx_bytes,
        tx_bytes: iface.tx_bytes
      };
    });
  }
}
