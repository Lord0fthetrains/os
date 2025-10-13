import { Router } from 'express';
import { ApiIntegrations } from '../services/apiIntegrations';

const router = Router();
const apiIntegrations = new ApiIntegrations();

// Get weather data
router.get('/weather', async (req, res) => {
  try {
    const { city = 'London' } = req.query;
    const weather = await apiIntegrations.getWeatherData(city as string);
    res.json(weather);
  } catch (error) {
    console.error('Error getting weather data:', error);
    res.status(500).json({ error: 'Failed to get weather data' });
  }
});

// Get news data
router.get('/news', async (req, res) => {
  try {
    const { category = 'technology', limit = '10' } = req.query;
    const news = await apiIntegrations.getNewsData(
      category as string,
      parseInt(limit as string)
    );
    res.json(news);
  } catch (error) {
    console.error('Error getting news data:', error);
    res.status(500).json({ error: 'Failed to get news data' });
  }
});

// Get crypto prices
router.get('/crypto', async (req, res) => {
  try {
    const { limit = '10' } = req.query;
    const crypto = await apiIntegrations.getCryptoPrices(parseInt(limit as string));
    res.json(crypto);
  } catch (error) {
    console.error('Error getting crypto data:', error);
    res.status(500).json({ error: 'Failed to get crypto data' });
  }
});

// Get GitHub repos
router.get('/github', async (req, res) => {
  try {
    const { username, limit = '5' } = req.query;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const repos = await apiIntegrations.getGitHubRepos(
      username as string,
      parseInt(limit as string)
    );
    res.json(repos);
  } catch (error) {
    console.error('Error getting GitHub data:', error);
    res.status(500).json({ error: 'Failed to get GitHub data' });
  }
});

// Get system status
router.get('/status', async (req, res) => {
  try {
    const status = await apiIntegrations.getSystemStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({ error: 'Failed to get system status' });
  }
});

export default router;
