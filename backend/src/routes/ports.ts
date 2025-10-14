import { Router } from 'express';
import { PortScannerService } from '../services/portScannerService';

const router = Router();

// Scan for open ports
router.get('/scan', async (req, res) => {
  try {
    const { host = 'localhost', ports } = req.query;
    const portList = ports ? (ports as string).split(',').map(Number) : undefined;
    
    const detectedServices = await PortScannerService.scanPorts(
      host as string, 
      portList
    );
    
    res.json({
      host: host as string,
      services: detectedServices,
      count: detectedServices.length
    });
  } catch (error) {
    console.error('Error scanning ports:', error);
    res.status(500).json({ error: 'Failed to scan ports' });
  }
});

// Get local IP address
router.get('/local-ip', async (req, res) => {
  try {
    const localIP = await PortScannerService.getLocalIP();
    res.json({ ip: localIP });
  } catch (error) {
    console.error('Error getting local IP:', error);
    res.status(500).json({ error: 'Failed to get local IP' });
  }
});

// Get common ports list
router.get('/common-ports', (req, res) => {
  const commonPorts = [
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
    { port: 10000, service: 'Webmin' }
  ];
  
  res.json({ ports: commonPorts });
});

export default router;
