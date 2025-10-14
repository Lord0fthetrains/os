import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const router = Router();
const execAsync = promisify(exec);

// Logged-in sessions (who)
router.get('/sessions', async (req, res) => {
  try {
    const { stdout } = await execAsync('who');
    const sessions = stdout
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        // user pts/0 2025-10-14 12:34 (192.168.1.10)
        const parts = line.split(/\s+/);
        return {
          user: parts[0],
          tty: parts[1],
          date: parts.slice(2, 5).join(' '),
          host: parts[5]?.replace(/[()]/g, '') || null
        };
      });
    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// SSH history (auth logs)
router.get('/ssh-history', async (req, res) => {
  try {
    const lines = Number(req.query.lines ?? 200);
    const cmd = `grep -i 'sshd' /var/log/auth.log | tail -n ${lines}`;
    const { stdout } = await execAsync(cmd, { maxBuffer: 2 * 1024 * 1024 });
    res.json({ lines, log: stdout });
  } catch (error) {
    console.error('Error fetching ssh history:', error);
    res.status(500).json({ error: 'Failed to fetch ssh history' });
  }
});

export default router;


