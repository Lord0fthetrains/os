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
    
    // Get latest version from GitHub - try multiple methods
    let latestVersion = currentVersion;
    
    try {
      // Method 1: Try to get latest tag (sorted by version)
      const { stdout: tagOutput } = await execAsync('git ls-remote --tags https://github.com/Lord0fthetrains/os.git | grep -E "refs/tags/v[0-9]" | sort -V | tail -1');
      if (tagOutput.trim()) {
        latestVersion = tagOutput.trim().split('/').pop()?.replace('v', '') || currentVersion;
        console.log('Latest tag found:', latestVersion);
      }
    } catch (tagError) {
      console.log('No tags found, checking commit hash...');
      
      try {
        // Method 2: Get latest commit hash and compare with local
        const { stdout: remoteHash } = await execAsync('git ls-remote https://github.com/Lord0fthetrains/os.git HEAD');
        const { stdout: localHash } = await execAsync('git rev-parse HEAD');
        
        if (remoteHash.trim() !== localHash.trim()) {
          // There are new commits available
          latestVersion = `${currentVersion}-new`;
        }
      } catch (commitError) {
        console.log('Could not check for updates:', commitError);
      }
    }
    
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
    console.log('Starting update process...');
    
    // Check if we're in a git repository
    const { stdout: gitStatus } = await execAsync('git status --porcelain');
    if (gitStatus.trim()) {
      return res.status(400).json({ 
        error: 'Working directory has uncommitted changes. Please commit or stash them first.',
        details: 'The following files have uncommitted changes: ' + gitStatus.trim()
      });
    }

    // Get current commit before update
    const { stdout: currentCommit } = await execAsync('git rev-parse HEAD');
    console.log('Current commit:', currentCommit.trim());

    // Fetch latest changes from GitHub
    console.log('Fetching latest changes from GitHub...');
    await execAsync('git fetch origin main');
    
    // Pull latest changes
    console.log('Pulling latest changes...');
    const { stdout: pullOutput } = await execAsync('git pull origin main');
    console.log('Pull output:', pullOutput);

    // Get new commit after update
    const { stdout: newCommit } = await execAsync('git rev-parse HEAD');
    console.log('New commit:', newCommit.trim());

    // Check if there were actually changes
    if (currentCommit.trim() === newCommit.trim()) {
      return res.json({ 
        message: 'Already up to date. No changes were pulled.',
        success: true,
        noChanges: true
      });
    }
    
    // Rebuild and restart services using restart script
    console.log('Restarting services using restart script...');
    try {
      // Use the simple restart script which handles Docker commands properly
      // Add timeout to prevent hanging
      await execAsync('timeout 300 bash ./restart-simple.sh || bash ./restart-simple.sh');
      console.log('Services restarted successfully');
    } catch (restartError) {
      console.log('Restart script failed, trying alternative methods...');
      try {
        // Fallback to docker-compose commands
        await execAsync('docker-compose down && docker-compose up -d --build');
        console.log('Services restarted using docker-compose');
      } catch (dockerError) {
        console.log('Docker-compose not available, trying docker compose...');
        try {
          await execAsync('docker compose down && docker compose up -d --build');
          console.log('Services restarted using docker compose');
        } catch (dockerComposeError) {
          console.log('Docker not available, skipping service restart');
          return res.json({ 
            message: 'Code updated successfully, but Docker services could not be restarted automatically.',
            success: true,
            warning: 'Docker not available - please restart services manually using: ./restart-simple.sh',
            changes: {
              from: currentCommit.trim().substring(0, 7),
              to: newCommit.trim().substring(0, 7)
            }
          });
        }
      }
    }
    
    console.log('Update completed successfully');
    res.json({ 
      message: 'Update completed successfully! Services are restarting...',
      success: true,
      changes: {
        from: currentCommit.trim().substring(0, 7),
        to: newCommit.trim().substring(0, 7)
      }
    });
  } catch (error) {
    console.error('Error performing update:', error);
    res.status(500).json({ 
      error: 'Failed to perform update',
      details: error instanceof Error ? error.message : 'Unknown error',
      success: false
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
