import { Router } from 'express';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const router = Router();
const execAsync = promisify(exec);

// Simple thresholds; could be made configurable later
const DEFAULTS = {
  cpuLoadWarn: 2.0, // 1-min load average
  memUsageWarnPct: 85,
  diskUsageWarnPct: 85,
};

router.get('/', async (req, res) => {
  try {
    const cpuLoad1 = os.loadavg()[0];
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMemPct = Math.round(((totalMem - freeMem) / totalMem) * 100);

    // Disk usage (root) via df
    const { stdout } = await execAsync("df -h / | awk 'NR==2 {print $5}'");
    const diskPct = parseInt(stdout.trim().replace('%', ''), 10);

    const alerts: Array<{ level: 'warning' | 'critical'; message: string }> = [];

    if (cpuLoad1 > DEFAULTS.cpuLoadWarn) {
      alerts.push({ level: 'warning', message: `High CPU load: ${cpuLoad1.toFixed(2)} (1m)` });
    }
    if (usedMemPct > DEFAULTS.memUsageWarnPct) {
      alerts.push({ level: 'warning', message: `High memory usage: ${usedMemPct}%` });
    }
    if (!isNaN(diskPct) && diskPct > DEFAULTS.diskUsageWarnPct) {
      alerts.push({ level: 'warning', message: `High disk usage on /: ${diskPct}%` });
    }

    res.json({
      thresholds: DEFAULTS,
      metrics: {
        cpuLoad1,
        usedMemPct,
        diskPct,
      },
      alerts,
    });
  } catch (error) {
    console.error('Error generating alerts:', error);
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

export default router;


