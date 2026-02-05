import express from 'express';
import { query, validationResult } from 'express-validator';
import { API } from '../models/API.js';

const router = express.Router();

// GET /api/v1/search - Search APIs
router.get('/', [
  query('q').optional().trim(),
  query('category').optional().trim(),
  query('tags').optional(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { q, category, tags, limit = 20, offset = 0 } = req.query;

    // Parse tags if provided as comma-separated string
    let tagsArray = null;
    if (tags) {
      tagsArray = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
    }

    const apis = await API.search({
      query: q,
      category,
      tags: tagsArray,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      query: q,
      filters: { category, tags: tagsArray },
      results: apis,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: apis.length
      }
    });
  } catch (error) {
    console.error('Error searching APIs:', error);
    res.status(500).json({ error: 'Failed to search APIs' });
  }
});

export default router;
