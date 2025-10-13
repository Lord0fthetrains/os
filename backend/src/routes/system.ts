import { Router } from 'express';
import { SystemMonitor } from '../services/systemMonitor';

const router = Router();
const systemMonitor = new SystemMonitor();

// Get current system stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await systemMonitor.getSystemStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting system stats:', error);
    res.status(500).json({ error: 'Failed to get system stats' });
  }
});

// Get CPU usage history (for charts)
router.get('/cpu-history', async (req, res) => {
  try {
    const stats = await systemMonitor.getSystemStats();
    res.json({
      usage: stats.cpu.usage,
      cores: stats.cpu.cores,
      temperature: stats.cpu.temperature,
      loadAverage: stats.cpu.loadAverage,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error getting CPU history:', error);
    res.status(500).json({ error: 'Failed to get CPU data' });
  }
});

// Get memory usage history
router.get('/memory-history', async (req, res) => {
  try {
    const stats = await systemMonitor.getSystemStats();
    res.json({
      total: stats.memory.total,
      used: stats.memory.used,
      free: stats.memory.free,
      cached: stats.memory.cached,
      swap: stats.memory.swap,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error getting memory history:', error);
    res.status(500).json({ error: 'Failed to get memory data' });
  }
});

// Get disk usage
router.get('/disk-usage', async (req, res) => {
  try {
    const stats = await systemMonitor.getSystemStats();
    res.json({
      disks: stats.disk,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error getting disk usage:', error);
    res.status(500).json({ error: 'Failed to get disk data' });
  }
});

// Get network stats
router.get('/network-stats', async (req, res) => {
  try {
    const stats = await systemMonitor.getSystemStats();
    res.json({
      interfaces: stats.network,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error getting network stats:', error);
    res.status(500).json({ error: 'Failed to get network data' });
  }
});

export default router;
