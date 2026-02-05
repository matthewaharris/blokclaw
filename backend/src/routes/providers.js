import express from 'express';
import { body, validationResult } from 'express-validator';
import { Provider } from '../models/Provider.js';

const router = express.Router();

// Validation middleware
const validateProvider = [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().isLength({ min: 2, max: 255 }),
  body('website').optional().isURL()
];

// POST /api/v1/providers - Register a new provider
router.post('/', validateProvider, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, name, website } = req.body;

    // Check if provider already exists
    const existing = await Provider.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Provider with this email already exists' });
    }

    const provider = await Provider.create({ email, name, website });
    
    res.status(201).json({
      message: 'Provider registered successfully',
      provider: {
        id: provider.id,
        email: provider.email,
        name: provider.name,
        verified: provider.verified
      }
    });
  } catch (error) {
    console.error('Error creating provider:', error);
    res.status(500).json({ error: 'Failed to create provider' });
  }
});

// GET /api/v1/providers/:id - Get provider details
router.get('/:id', async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json({
      id: provider.id,
      name: provider.name,
      website: provider.website,
      verified: provider.verified,
      created_at: provider.created_at
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

export default router;
