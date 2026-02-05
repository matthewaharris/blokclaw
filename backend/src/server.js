import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection } from './utils/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'blokclaw-api' });
});

// API routes (to be added)
app.get('/api/v1', (req, res) => {
  res.json({ 
    message: 'BlokClaw API v1',
    endpoints: {
      health: '/health',
      apis: '/api/v1/apis',
      search: '/api/v1/search'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🐻 BlokClaw API running on http://localhost:${PORT}`);
  
  // Test database connection
  const dbOk = await testConnection();
  if (dbOk) {
    console.log('✅ Database connected');
  } else {
    console.error('❌ Database connection failed');
  }
});
