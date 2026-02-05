import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { API } from '../models/API.js';
import { Provider } from '../models/Provider.js';

const router = express.Router();

// Helper to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Validation middleware
const validateAPI = [
  body('provider_email').isEmail().normalizeEmail(),
  body('name').trim().isLength({ min: 2, max: 255 }),
  body('short_description').trim().isLength({ min: 10, max: 500 }),
  body('long_description').optional().trim(),
  body('category').optional().trim().isLength({ max: 100 }),
  body('contract_type').optional().isIn(['openapi', 'custom']),
  body('contract_url').optional().isURL(),
  body('auth_type').optional().isIn(['none', 'apikey', 'oauth2', 'bearer']),
  body('pricing').optional().isIn(['free', 'freemium', 'paid']),
  body('tags').optional().isArray()
];

// POST /api/v1/apis - Register a new API
router.post('/', validateAPI, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      provider_email,
      name,
      short_description,
      long_description,
      category,
      contract_type = 'openapi',
      contract_url,
      contract_schema,
      auth_type = 'apikey',
      auth_instructions,
      test_endpoint,
      pricing = 'free',
      tags = [],
      endpoints = [],
      examples = []
    } = req.body;

    // Find or create provider
    let provider = await Provider.findByEmail(provider_email);
    if (!provider) {
      return res.status(404).json({ 
        error: 'Provider not found. Please register as a provider first.',
        hint: 'POST /api/v1/providers'
      });
    }

    // Generate slug
    let slug = generateSlug(name);
    
    // Check if slug exists, append number if needed
    let existing = await API.findBySlug(slug);
    if (existing) {
      let counter = 1;
      while (existing) {
        slug = `${generateSlug(name)}-${counter}`;
        existing = await API.findBySlug(slug);
        counter++;
      }
    }

    // Create API
    const api = await API.create({
      providerId: provider.id,
      name,
      slug,
      shortDescription: short_description,
      longDescription: long_description,
      category,
      contractType: contract_type,
      contractUrl: contract_url,
      contractSchema: contract_schema,
      authType: auth_type,
      authInstructions: auth_instructions,
      testEndpoint: test_endpoint,
      pricing,
      tags
    });

    // Add endpoints if provided
    if (endpoints && endpoints.length > 0) {
      for (const endpoint of endpoints) {
        await API.addEndpoint(api.id, endpoint);
      }
    }

    // Add examples if provided
    if (examples && examples.length > 0) {
      for (const example of examples) {
        await API.addExample(api.id, {
          title: example.title,
          description: example.description,
          requestExample: example.request,
          responseExample: example.response
        });
      }
    }

    res.status(201).json({
      message: 'API registered successfully',
      api: {
        id: api.id,
        slug: api.slug,
        name: api.name,
        url: `/api/v1/apis/${api.slug}`
      }
    });
  } catch (error) {
    console.error('Error creating API:', error);
    res.status(500).json({ error: 'Failed to create API' });
  }
});

// GET /api/v1/apis - List all APIs
router.get('/', [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('category').optional().trim(),
  query('verified').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { limit = 20, offset = 0, category, verified } = req.query;
    
    const apis = await API.list({
      limit: parseInt(limit),
      offset: parseInt(offset),
      category,
      verified: verified !== undefined ? verified === 'true' : undefined
    });

    res.json({
      apis,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: apis.length
      }
    });
  } catch (error) {
    console.error('Error listing APIs:', error);
    res.status(500).json({ error: 'Failed to list APIs' });
  }
});

// GET /api/v1/apis/:slug - Get API details
router.get('/:slug', async (req, res) => {
  try {
    const api = await API.findBySlug(req.params.slug);
    if (!api) {
      return res.status(404).json({ error: 'API not found' });
    }

    // Increment view count
    await API.incrementViews(api.id);

    // Get endpoints and examples
    const endpoints = await API.getEndpoints(api.id);
    const examples = await API.getExamples(api.id);

    res.json({
      ...api,
      endpoints,
      examples
    });
  } catch (error) {
    console.error('Error fetching API:', error);
    res.status(500).json({ error: 'Failed to fetch API' });
  }
});

export default router;
