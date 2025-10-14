import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const router = Router();
const execAsync = promisify(exec);

// Get current version from package.json
const getCurrentVersion = (): string => {
  try {
    const packagePath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version || '1.0.0';
  } catch (error) {
    console.error('Error reading package.json:', error);
    return '1.0.0';
  }
};

// Check for updates
router.get('/check', async (req, res) => {
  try {
    const currentVersion = getCurrentVersion();
    
    // Get latest version from GitHub
    const { stdout } = await execAsync('git ls-remote --tags https://github.com/Lord0fthetrains/os.git | tail -1');
    const latestVersion = stdout.trim().split('/').pop()?.replace('v', '') || currentVersion;
    
    // Check if we're up to date
    const isUpToDate = currentVersion === latestVersion;
    const updateAvailable = !isUpToDate;
    
    res.json({
      currentVersion,
      latestVersion,
      isUpToDate,
      updateAvailable,
      lastChecked: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking for updates:', error);
    res.status(500).json({ 
      error: 'Failed to check for updates',
      currentVersion: getCurrentVersion(),
      isUpToDate: true,
      updateAvailable: false,
      lastChecked: new Date().toISOString()
    });
  }
});

// Perform update
router.post('/perform', async (req, res) => {
  try {
    // Check if we're in a git repository
    const { stdout: gitStatus } = await execAsync('git status --porcelain');
    if (gitStatus.trim()) {
      return res.status(400).json({ 
        error: 'Working directory has uncommitted changes. Please commit or stash them first.' 
      });
    }

    // Pull latest changes
    await execAsync('git pull origin main');
    
    // Rebuild and restart services
    await execAsync('docker-compose down');
    await execAsync('docker-compose up -d --build');
    
    res.json({ 
      message: 'Update completed successfully. Services are restarting...',
      success: true 
    });
  } catch (error) {
    console.error('Error performing update:', error);
    res.status(500).json({ 
      error: 'Failed to perform update',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get update status
router.get('/status', async (req, res) => {
  try {
    const currentVersion = getCurrentVersion();
    
    // Check if update is in progress
    const { stdout: dockerStatus } = await execAsync('docker-compose ps --format json');
    const containers = JSON.parse(`[${dockerStatus.replace(/\n/g, ',').slice(0, -1)}]`);
    
    const isUpdating = containers.some((container: any) => 
      container.State === 'restarting' || container.State === 'starting'
    );
    
    res.json({
      currentVersion,
      isUpdating,
      containers: containers.map((c: any) => ({
        name: c.Name,
        state: c.State,
        status: c.Status
      }))
    });
  } catch (error) {
    console.error('Error getting update status:', error);
    res.status(500).json({ error: 'Failed to get update status' });
  }
});

export default router;
