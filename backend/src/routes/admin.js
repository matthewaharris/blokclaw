import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { adminLimiter } from '../middleware/rateLimiter.js';
import { pool } from '../utils/db.js';

const router = express.Router();

router.use(authenticateAdmin, adminLimiter);

// GET /api/v1/admin/reports - List reports
router.get('/reports', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT r.*, a.name as api_name, a.slug as api_slug
      FROM api_reports r
      LEFT JOIN apis a ON r.api_id = a.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE r.status = $1';
      params.push(status);
    }

    query += ' ORDER BY r.created_at DESC LIMIT 100';

    const result = await pool.query(query, params);
    res.json({ reports: result.rows });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// PATCH /api/v1/admin/reports/:id - Update report status
router.patch('/reports/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      `UPDATE api_reports
       SET status = $1, reviewed_by = 'admin', reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report: result.rows[0] });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// GET /api/v1/admin/apis - List all APIs including inactive
router.get('/apis', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.name, a.slug, a.short_description, a.category,
             a.verified, a.active, a.health_status, a.openapi_valid,
             a.view_count, a.created_at,
             p.name as provider_name, p.email as provider_email
      FROM apis a
      LEFT JOIN providers p ON a.provider_id = p.id
      ORDER BY a.created_at DESC
      LIMIT 200
    `);

    res.json({ apis: result.rows });
  } catch (error) {
    console.error('Error fetching APIs:', error);
    res.status(500).json({ error: 'Failed to fetch APIs' });
  }
});

// PATCH /api/v1/admin/apis/:slug - Toggle verified/active
router.patch('/apis/:slug', async (req, res) => {
  try {
    const { verified, active } = req.body;
    const updates = [];
    const params = [];
    let paramCount = 0;

    if (verified !== undefined) {
      paramCount++;
      updates.push(`verified = $${paramCount}`);
      params.push(verified);
    }

    if (active !== undefined) {
      paramCount++;
      updates.push(`active = $${paramCount}`);
      params.push(active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    paramCount++;
    params.push(req.params.slug);

    const result = await pool.query(
      `UPDATE apis SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE slug = $${paramCount}
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'API not found' });
    }

    res.json({ api: result.rows[0] });
  } catch (error) {
    console.error('Error updating API:', error);
    res.status(500).json({ error: 'Failed to update API' });
  }
});

// GET /api/v1/admin/stats - Admin stats overview
router.get('/stats', async (req, res) => {
  try {
    const [reportCounts, unhealthyApis, unverifiedProviders] = await Promise.all([
      pool.query(`
        SELECT status, COUNT(*) as count
        FROM api_reports
        GROUP BY status
      `),
      pool.query(`SELECT COUNT(*) FROM apis WHERE health_status = 'unhealthy' AND active = true`),
      pool.query(`SELECT COUNT(*) FROM providers WHERE email_verified = false OR email_verified IS NULL`)
    ]);

    const reports = {};
    reportCounts.rows.forEach(r => { reports[r.status] = parseInt(r.count); });

    res.json({
      reports,
      unhealthy_apis: parseInt(unhealthyApis.rows[0].count),
      unverified_providers: parseInt(unverifiedProviders.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

export default router;
