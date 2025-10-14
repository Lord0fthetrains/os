import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const router = Router();
const execAsync = promisify(exec);

// Get current version
router.get('/current', (req, res) => {
  try {
    const version = process.env.npm_package_version || '1.2.0';
    res.json({ version });
  } catch (error) {
    console.error('Error getting current version:', error);
    res.status(500).json({ error: 'Failed to get current version' });
  }
});

// Check for updates
router.get('/check', async (req, res) => {
  try {
    const { stdout } = await execAsync('git fetch && git log HEAD..origin/main --oneline');
    const hasUpdates = stdout.trim().length > 0;
    
    res.json({
      hasUpdates,
      pendingCommits: stdout.trim().split('\n').filter(line => line.length > 0)
    });
  } catch (error) {
    console.error('Error checking for updates:', error);
    res.status(500).json({ error: 'Failed to check for updates' });
  }
});

// Update to latest version
router.post('/update', async (req, res) => {
  try {
    const { stdout, stderr } = await execAsync('git pull origin main');
    
    if (stderr && !stderr.includes('Already up to date')) {
      console.error('Git pull stderr:', stderr);
    }
    
    res.json({
      success: true,
      message: 'Update completed successfully',
      output: stdout
    });
  } catch (error) {
    console.error('Error updating:', error);
    res.status(500).json({ 
      error: 'Failed to update', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Restart services after update
router.post('/restart', async (req, res) => {
  try {
    // This would typically restart the Docker containers
    const { stdout } = await execAsync('docker-compose restart');
    
    res.json({
      success: true,
      message: 'Services restarted successfully',
      output: stdout
    });
  } catch (error) {
    console.error('Error restarting services:', error);
    res.status(500).json({ 
      error: 'Failed to restart services', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
