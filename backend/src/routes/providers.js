import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { Provider } from '../models/Provider.js';
import { writeLimiter, loginLimiter } from '../middleware/rateLimiter.js';
import { authenticateProvider } from '../middleware/auth.js';
import { sendVerificationEmail } from '../utils/email.js';

const router = express.Router();

// Validation middleware
const validateProvider = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().isLength({ min: 2, max: 255 }),
  body('website').optional().isURL(),
  body('tos_accepted').equals('true').withMessage('You must accept the Terms of Service')
];

// POST /api/v1/providers - Register a new provider
router.post('/', writeLimiter, validateProvider, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, name, website } = req.body;

    const existing = await Provider.findByEmail(email);
    if (existing && existing.password_hash) {
      return res.status(409).json({ error: 'Provider with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomUUID();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    let provider;
    if (existing && !existing.password_hash) {
      // Upgrade agent-created passwordless provider
      provider = await Provider.upgradeWithPassword(existing.id, {
        passwordHash,
        verificationToken,
        verificationTokenExpires,
        name,
        website,
        tosAcceptedAt: new Date()
      });
    } else {
      provider = await Provider.createWithPassword({
        email,
        name,
        website,
        tosAcceptedAt: new Date(),
        passwordHash,
        verificationToken,
        verificationTokenExpires
      });
    }

    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    await sendVerificationEmail(email, verificationToken, baseUrl);

    res.status(201).json({
      message: 'Provider registered. Please check your email to verify your account.',
      provider: {
        id: provider.id,
        email: provider.email,
        name: provider.name
      }
    });
  } catch (error) {
    console.error('Error creating provider:', error);
    res.status(500).json({ error: 'Failed to create provider' });
  }
});

// GET /api/v1/providers/verify - Verify email
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    const provider = await Provider.verifyEmail(token);
    if (!provider) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// POST /api/v1/providers/login - Login
router.post('/login', loginLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const provider = await Provider.findByEmail(email);
    if (!provider || !provider.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, provider.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!provider.email_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    const token = jwt.sign(
      { id: provider.id, email: provider.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      provider: {
        id: provider.id,
        email: provider.email,
        name: provider.name,
        verified: provider.verified
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// GET /api/v1/providers/me - Get current provider profile
router.get('/me', authenticateProvider, async (req, res) => {
  res.json({
    id: req.provider.id,
    email: req.provider.email,
    name: req.provider.name,
    website: req.provider.website,
    verified: req.provider.verified,
    email_verified: req.provider.email_verified,
    created_at: req.provider.created_at
  });
});

// GET /api/v1/providers/:id - Get provider details (public)
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
