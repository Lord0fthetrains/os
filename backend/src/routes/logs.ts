import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const router = Router();
const execAsync = promisify(exec);

// Get recent system logs (journalctl if present, else /var/log/syslog)
router.get('/system', async (req, res) => {
  try {
    const lines = Number(req.query.lines ?? 200);
    const cmd = `command -v journalctl >/dev/null 2>&1 && journalctl -n ${lines} --no-pager || tail -n ${lines} /var/log/syslog`;
    const { stdout } = await execAsync(cmd, { maxBuffer: 5 * 1024 * 1024 });
    res.json({ source: 'system', lines, log: stdout });
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({ error: 'Failed to fetch system logs' });
  }
});

// Get docker container logs
router.get('/docker', async (req, res) => {
  try {
    const { container } = req.query as { container?: string };
    const lines = Number(req.query.lines ?? 200);
    if (!container) {
      return res.status(400).json({ error: 'container query param is required' });
    }

    const { stdout } = await execAsync(`docker logs --tail ${lines} ${container}`, { maxBuffer: 5 * 1024 * 1024 });
    res.json({ source: 'docker', container, lines, log: stdout });
  } catch (error) {
    console.error('Error fetching docker logs:', error);
    res.status(500).json({ error: 'Failed to fetch docker logs' });
  }
});

export default router;


