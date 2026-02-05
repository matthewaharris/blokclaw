import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import providersRouter from '../src/routes/providers.js';
import apisRouter from '../src/routes/apis.js';
import searchRouter from '../src/routes/search.js';
import agentsRouter from '../src/routes/agents.js';

// Create test app
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1/providers', providersRouter);
app.use('/api/v1/apis', apisRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/agents', agentsRouter);

describe('BlokClaw API Tests', () => {
  
  describe('GET /api/v1/apis', () => {
    it('should return list of APIs', async () => {
      const res = await request(app).get('/api/v1/apis');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('apis');
      expect(Array.isArray(res.body.apis)).toBe(true);
    });

    it('should filter by category', async () => {
      const res = await request(app).get('/api/v1/apis?category=weather');
      expect(res.statusCode).toBe(200);
      if (res.body.apis.length > 0) {
        expect(res.body.apis[0].category).toBe('weather');
      }
    });
  });

  describe('GET /api/v1/search', () => {
    it('should search APIs by query', async () => {
      const res = await request(app).get('/api/v1/search?q=weather');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('results');
      expect(Array.isArray(res.body.results)).toBe(true);
    });

    it('should filter by tags', async () => {
      const res = await request(app).get('/api/v1/search?tags=weather,forecast');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('results');
    });
  });

  describe('POST /api/v1/providers', () => {
    it('should require valid email', async () => {
      const res = await request(app)
        .post('/api/v1/providers')
        .send({ email: 'invalid-email', name: 'Test' });
      expect(res.statusCode).toBe(400);
    });

    it('should require name', async () => {
      const res = await request(app)
        .post('/api/v1/providers')
        .send({ email: 'test@example.com' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/apis', () => {
    it('should require provider_email', async () => {
      const res = await request(app)
        .post('/api/v1/apis')
        .send({ name: 'Test API', short_description: 'Test description' });
      expect(res.statusCode).toBe(400);
    });

    it('should require short_description with min length', async () => {
      const res = await request(app)
        .post('/api/v1/apis')
        .send({
          provider_email: 'test@example.com',
          name: 'Test API',
          short_description: 'Short'
        });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/agents/discover', () => {
    it('should return structured agent-friendly API list', async () => {
      const res = await request(app).get('/api/v1/agents/discover');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('apis');
      expect(res.body).toHaveProperty('count');
      
      if (res.body.apis.length > 0) {
        const api = res.body.apis[0];
        expect(api).toHaveProperty('description');
        expect(api).toHaveProperty('provider');
        expect(api).toHaveProperty('auth');
        expect(api).toHaveProperty('contract');
        expect(api).toHaveProperty('endpoints');
      }
    });

    it('should filter by auth_type', async () => {
      const res = await request(app).get('/api/v1/agents/discover?auth_type=apikey');
      expect(res.statusCode).toBe(200);
      if (res.body.apis.length > 0) {
        expect(res.body.apis.every(api => api.auth.type === 'apikey')).toBe(true);
      }
    });
  });

  describe('POST /api/v1/agents/register', () => {
    it('should require agent_id', async () => {
      const res = await request(app)
        .post('/api/v1/agents/register')
        .send({ name: 'TestAgent' });
      expect(res.statusCode).toBe(400);
    });

    it('should accept valid agent registration', async () => {
      const res = await request(app)
        .post('/api/v1/agents/register')
        .send({ 
          agent_id: 'test-agent-' + Date.now(),
          name: 'TestAgent',
          version: '1.0.0',
          platform: 'openclaw'
        });
      expect([201, 200]).toContain(res.statusCode);
    });
  });

  describe('POST /api/v1/agents/submit', () => {
    it('should require all mandatory fields', async () => {
      const res = await request(app)
        .post('/api/v1/agents/submit')
        .send({ agent_id: 'test-agent' });
      expect(res.statusCode).toBe(400);
    });
  });
});
