import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const router = Router();
const execAsync = promisify(exec);

// List services matching a pattern
router.get('/', async (req, res) => {
  try {
    const pattern = (req.query.q as string) || 'nginx|apache2|docker|ssh|sshd';
    const { stdout } = await execAsync(`systemctl list-units --type=service --all --no-pager | egrep -i '${pattern}' || true`);
    res.json({ output: stdout });
  } catch (error) {
    console.error('Error listing services:', error);
    res.status(500).json({ error: 'Failed to list services' });
  }
});

// Control a service
router.post('/:name/:action', async (req, res) => {
  try {
    const { name, action } = req.params as { name: string; action: string };
    const allowed = new Set(['start', 'stop', 'restart', 'enable', 'disable', 'status']);
    if (!allowed.has(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    const { stdout, stderr } = await execAsync(`systemctl ${action} ${name}`, { timeout: 15000 });
    res.json({ success: true, output: stdout, error: stderr });
  } catch (error) {
    console.error('Error controlling service:', error);
    res.status(500).json({ error: 'Failed to control service' });
  }
});

export default router;


