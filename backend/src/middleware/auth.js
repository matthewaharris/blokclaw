import jwt from 'jsonwebtoken';
import { Provider } from '../models/Provider.js';

export function authenticateProvider(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    Provider.findById(decoded.id).then(provider => {
      if (!provider) {
        return res.status(401).json({ error: 'Provider not found' });
      }
      req.provider = provider;
      next();
    }).catch(() => {
      res.status(500).json({ error: 'Authentication failed' });
    });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireVerifiedEmail(req, res, next) {
  if (!req.provider || !req.provider.email_verified) {
    return res.status(403).json({ error: 'Email verification required' });
  }
  next();
}

export function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  const token = authHeader.slice(7);
  if (token !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Invalid admin credentials' });
  }

  next();
}
