import * as net from 'net';

export interface DetectedService {
  port: number;
  service: string;
  status: 'open' | 'closed' | 'filtered';
  response?: string;
  url?: string;
}

export class PortScannerService {
  private static readonly COMMON_PORTS = [
    { port: 80, service: 'HTTP' },
    { port: 443, service: 'HTTPS' },
    { port: 3000, service: 'React Dev Server' },
    { port: 3001, service: 'Node.js App' },
    { port: 8080, service: 'HTTP Alt' },
    { port: 8081, service: 'HTTP Alt' },
    { port: 9000, service: 'SonarQube' },
    { port: 8000, service: 'HTTP Alt' },
    { port: 5000, service: 'Flask Dev' },
    { port: 4000, service: 'Node.js App' },
    { port: 3200, service: 'Dashboard' },
    { port: 5200, service: 'Dashboard API' },
    { port: 8001, service: 'HTTP Alt' },
    { port: 9001, service: 'HTTP Alt' },
    { port: 9443, service: 'HTTPS Alt' },
    { port: 8888, service: 'Jupyter' },
    { port: 8889, service: 'Jupyter Alt' },
    { port: 3001, service: 'Node.js App' },
    { port: 5001, service: 'Flask Alt' },
    { port: 6000, service: 'HTTP Alt' },
    { port: 7000, service: 'HTTP Alt' },
    { port: 8002, service: 'HTTP Alt' },
    { port: 9002, service: 'HTTP Alt' },
    { port: 10000, service: 'Webmin' },
    { port: 10001, service: 'HTTP Alt' },
    { port: 11000, service: 'HTTP Alt' },
    { port: 12000, service: 'HTTP Alt' },
    { port: 13000, service: 'HTTP Alt' },
    { port: 14000, service: 'HTTP Alt' },
    { port: 15000, service: 'HTTP Alt' }
  ];

  static async scanPorts(host: string = 'localhost', ports?: number[]): Promise<DetectedService[]> {
    const portsToScan = ports || this.COMMON_PORTS.map(p => p.port);
    const results: DetectedService[] = [];

    const promises = portsToScan.map(port => this.checkPort(host, port));
    const portResults = await Promise.allSettled(promises);

    portResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      }
    });

    return results.sort((a, b) => a.port - b.port);
  }

  private static async checkPort(host: string, port: number): Promise<DetectedService | null> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = 2000; // 2 second timeout

      socket.setTimeout(timeout);

      socket.on('connect', () => {
        socket.destroy();
        const service = this.COMMON_PORTS.find(p => p.port === port)?.service || 'Unknown';
        resolve({
          port,
          service,
          status: 'open',
          url: this.generateUrl(host, port)
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(null);
      });

      socket.on('error', () => {
        socket.destroy();
        resolve(null);
      });

      socket.connect(port, host);
    });
  }

  private static generateUrl(host: string, port: number): string {
    const protocol = port === 443 || port === 9443 ? 'https' : 'http';
    return `${protocol}://${host}:${port}`;
  }

  static async getLocalIP(): Promise<string> {
    return new Promise((resolve, reject) => {
      const { networkInterfaces } = require('os');
      const nets = networkInterfaces();
      
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            resolve(net.address);
            return;
          }
        }
      }
      reject(new Error('No external IPv4 address found'));
    });
  }
}
