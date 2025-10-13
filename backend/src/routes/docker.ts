import { Router } from 'express';
import { DockerService } from '../services/dockerService';

const router = Router();
const dockerService = new DockerService();

// Get all containers
router.get('/containers', async (req, res) => {
  try {
    const containers = await dockerService.getContainers();
    res.json(containers);
  } catch (error) {
    console.error('Error getting containers:', error);
    res.status(500).json({ error: 'Failed to get containers' });
  }
});

// Get container stats
router.get('/containers/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await dockerService.getContainerStats(id);
    res.json(stats);
  } catch (error) {
    console.error('Error getting container stats:', error);
    res.status(500).json({ error: 'Failed to get container stats' });
  }
});

// Get container logs
router.get('/containers/:id/logs', async (req, res) => {
  try {
    const { id } = req.params;
    const { tail = '100' } = req.query;
    const logs = await dockerService.getContainerLogs(id, parseInt(tail as string));
    res.json({ logs });
  } catch (error) {
    console.error('Error getting container logs:', error);
    res.status(500).json({ error: 'Failed to get container logs' });
  }
});

// Start container
router.post('/containers/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    await dockerService.startContainer(id);
    res.json({ message: 'Container started successfully' });
  } catch (error) {
    console.error('Error starting container:', error);
    res.status(500).json({ error: 'Failed to start container' });
  }
});

// Stop container
router.post('/containers/:id/stop', async (req, res) => {
  try {
    const { id } = req.params;
    await dockerService.stopContainer(id);
    res.json({ message: 'Container stopped successfully' });
  } catch (error) {
    console.error('Error stopping container:', error);
    res.status(500).json({ error: 'Failed to stop container' });
  }
});

// Restart container
router.post('/containers/:id/restart', async (req, res) => {
  try {
    const { id } = req.params;
    await dockerService.restartContainer(id);
    res.json({ message: 'Container restarted successfully' });
  } catch (error) {
    console.error('Error restarting container:', error);
    res.status(500).json({ error: 'Failed to restart container' });
  }
});

export default router;
