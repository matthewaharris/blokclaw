import express from 'express';
import { query, validationResult } from 'express-validator';
import { pool } from '../utils/db.js';

const router = express.Router();

// GET /api/v1/stats/timeseries - Get time-series stats
router.get('/timeseries', [
  query('days').optional().isInt({ min: 1, max: 365 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const days = parseInt(req.query.days || 30);

    // Update today's stats first
    await pool.query('SELECT update_daily_stats()');

    // Fetch stats for the requested period
    const result = await pool.query(
      `SELECT date, apis_registered, unique_agents, total_api_count, total_agent_count
       FROM daily_stats
       WHERE date >= CURRENT_DATE - $1::integer
       ORDER BY date ASC`,
      [days]
    );

    res.json({
      period_days: days,
      data: result.rows.map(row => ({
        date: row.date,
        apis_registered: parseInt(row.apis_registered),
        unique_agents: parseInt(row.unique_agents),
        total_apis: parseInt(row.total_api_count),
        total_agents: parseInt(row.total_agent_count)
      }))
    });
  } catch (error) {
    console.error('Error fetching time-series stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/v1/stats/summary - Get current summary stats
router.get('/summary', async (req, res) => {
  try {
    // Update today's stats
    await pool.query('SELECT update_daily_stats()');

    const totalAPIs = await pool.query('SELECT COUNT(*) FROM apis WHERE active = true');
    const verifiedAPIs = await pool.query('SELECT COUNT(*) FROM apis WHERE verified = true AND active = true');
    const totalProviders = await pool.query('SELECT COUNT(*) FROM providers');
    const totalAgents = await pool.query('SELECT COUNT(*) FROM agents');
    
    // Today's stats
    const today = await pool.query(
      'SELECT apis_registered, unique_agents FROM daily_stats WHERE date = CURRENT_DATE'
    );

    res.json({
      total_apis: parseInt(totalAPIs.rows[0].count),
      verified_apis: parseInt(verifiedAPIs.rows[0].count),
      total_providers: parseInt(totalProviders.rows[0].count),
      total_agents: parseInt(totalAgents.rows[0].count),
      today: today.rows.length > 0 ? {
        apis_registered: parseInt(today.rows[0].apis_registered),
        unique_agents: parseInt(today.rows[0].unique_agents)
      } : {
        apis_registered: 0,
        unique_agents: 0
      }
    });
  } catch (error) {
    console.error('Error fetching summary stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
