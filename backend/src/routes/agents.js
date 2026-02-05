import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { API } from '../models/API.js';
import { Provider } from '../models/Provider.js';
import { pool } from '../utils/db.js';

const router = express.Router();

// POST /api/v1/agents/register - Register an agent (for tracking)
router.post('/register', [
  body('agent_id').trim().isLength({ min: 1, max: 255 }),
  body('name').optional().trim().isLength({ max: 255 }),
  body('version').optional().trim().isLength({ max: 50 }),
  body('platform').optional().trim().isLength({ max: 100 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { agent_id, name, version, platform } = req.body;

    // Check if agent exists
    const existing = await pool.query(
      'SELECT * FROM agents WHERE agent_id = $1',
      [agent_id]
    );

    if (existing.rows.length > 0) {
      // Update last_seen
      await pool.query(
        'UPDATE agents SET last_seen = CURRENT_TIMESTAMP WHERE agent_id = $1',
        [agent_id]
      );
      return res.json({ 
        message: 'Agent updated',
        agent_id,
        returning: true
      });
    }

    // Create new agent
    await pool.query(
      'INSERT INTO agents (agent_id, name, version, platform) VALUES ($1, $2, $3, $4)',
      [agent_id, name, version, platform]
    );

    res.status(201).json({
      message: 'Agent registered successfully',
      agent_id,
      returning: false
    });
  } catch (error) {
    console.error('Error registering agent:', error);
    res.status(500).json({ error: 'Failed to register agent' });
  }
});

// GET /api/v1/agents/discover - Optimized discovery endpoint for agents
router.get('/discover', [
  query('q').optional().trim(),
  query('category').optional().trim(),
  query('tags').optional(),
  query('auth_type').optional().trim(),
  query('pricing').optional().trim(),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { q, category, tags, auth_type, pricing, limit = 20 } = req.query;

    // Parse tags
    let tagsArray = null;
    if (tags) {
      tagsArray = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
    }

    // Build query
    let sql = `
      SELECT 
        a.id, a.name, a.slug, a.short_description, a.long_description,
        a.category, a.contract_type, a.contract_url, a.contract_schema,
        a.auth_type, a.auth_instructions, a.test_endpoint,
        a.pricing, a.tags, a.verified,
        p.name as provider_name, p.email as provider_email, p.website as provider_website
      FROM apis a
      LEFT JOIN providers p ON a.provider_id = p.id
      WHERE a.active = true AND a.verified = true
    `;
    const params = [];
    let paramCount = 0;

    if (q) {
      paramCount++;
      sql += ` AND (
        to_tsvector('english', a.name) @@ plainto_tsquery('english', $${paramCount})
        OR to_tsvector('english', a.short_description) @@ plainto_tsquery('english', $${paramCount})
      )`;
      params.push(q);
    }

    if (category) {
      paramCount++;
      sql += ` AND a.category = $${paramCount}`;
      params.push(category);
    }

    if (tagsArray && tagsArray.length > 0) {
      paramCount++;
      sql += ` AND a.tags && $${paramCount}`;
      params.push(tagsArray);
    }

    if (auth_type) {
      paramCount++;
      sql += ` AND a.auth_type = $${paramCount}`;
      params.push(auth_type);
    }

    if (pricing) {
      paramCount++;
      sql += ` AND a.pricing = $${paramCount}`;
      params.push(pricing);
    }

    sql += ` ORDER BY a.view_count DESC, a.created_at DESC LIMIT $${paramCount + 1}`;
    params.push(parseInt(limit));

    const result = await pool.query(sql, params);

    // For each API, get endpoints
    const apis = await Promise.all(result.rows.map(async (api) => {
      const endpoints = await API.getEndpoints(api.id);
      return {
        ...api,
        endpoints
      };
    }));

    res.json({
      count: apis.length,
      apis: apis.map(api => ({
        id: api.id,
        name: api.name,
        slug: api.slug,
        description: {
          short: api.short_description,
          long: api.long_description
        },
        provider: {
          name: api.provider_name,
          email: api.provider_email,
          website: api.provider_website
        },
        category: api.category,
        tags: api.tags,
        pricing: api.pricing,
        contract: {
          type: api.contract_type,
          url: api.contract_url,
          schema: api.contract_schema
        },
        auth: {
          type: api.auth_type,
          instructions: api.auth_instructions,
          test_endpoint: api.test_endpoint
        },
        endpoints: api.endpoints,
        verified: api.verified
      }))
    });
  } catch (error) {
    console.error('Error discovering APIs:', error);
    res.status(500).json({ error: 'Failed to discover APIs' });
  }
});

// POST /api/v1/agents/submit - Quick API submission for agents
router.post('/submit', [
  body('agent_id').trim().isLength({ min: 1, max: 255 }),
  body('provider_email').isEmail().normalizeEmail(),
  body('provider_name').trim().isLength({ min: 2, max: 255 }),
  body('api_name').trim().isLength({ min: 2, max: 255 }),
  body('description').trim().isLength({ min: 10, max: 500 }),
  body('category').optional().trim(),
  body('contract_url').optional().isURL(),
  body('auth_type').optional().isIn(['none', 'apikey', 'oauth2', 'bearer']),
  body('tags').optional().isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      agent_id,
      provider_email,
      provider_name,
      api_name,
      description,
      category,
      contract_url,
      auth_type = 'apikey',
      tags = []
    } = req.body;

    // Track agent activity
    await pool.query(
      'UPDATE agents SET api_submissions = api_submissions + 1, last_seen = CURRENT_TIMESTAMP WHERE agent_id = $1',
      [agent_id]
    );

    // Find or create provider
    let provider = await Provider.findByEmail(provider_email);
    if (!provider) {
      provider = await Provider.create({
        email: provider_email,
        name: provider_name,
        website: contract_url || ''
      });
    }

    // Generate slug
    const slug = api_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if API already exists
    const existing = await API.findBySlug(slug);
    if (existing) {
      return res.status(409).json({ 
        error: 'API with this name already exists',
        slug: existing.slug
      });
    }

    // Create API
    const api = await API.create({
      providerId: provider.id,
      name: api_name,
      slug,
      shortDescription: description,
      longDescription: '',
      category: category || 'other',
      contractType: 'openapi',
      contractUrl: contract_url,
      contractSchema: null,
      authType: auth_type,
      authInstructions: '',
      testEndpoint: '',
      pricing: 'free',
      tags
    });

    res.status(201).json({
      message: 'API submitted successfully',
      api: {
        id: api.id,
        slug: api.slug,
        name: api.name
      }
    });
  } catch (error) {
    console.error('Error submitting API:', error);
    res.status(500).json({ error: 'Failed to submit API' });
  }
});

export default router;
