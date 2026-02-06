import { pool } from '../utils/db.js';

export class API {
  // Create a new API
  static async create({
    providerId,
    name,
    slug,
    shortDescription,
    longDescription,
    category,
    contractType,
    contractUrl,
    contractSchema,
    authType,
    authInstructions,
    testEndpoint,
    pricing,
    tags,
    tosAcceptedAt
  }) {
    const query = `
      INSERT INTO apis (
        provider_id, name, slug, short_description, long_description,
        category, contract_type, contract_url, contract_schema,
        auth_type, auth_instructions, test_endpoint, pricing, tags,
        tos_accepted_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const result = await pool.query(query, [
      providerId, name, slug, shortDescription, longDescription,
      category, contractType, contractUrl, contractSchema,
      authType, authInstructions, testEndpoint, pricing, tags,
      tosAcceptedAt || null
    ]);
    return result.rows[0];
  }

  // Find API by ID
  static async findById(id) {
    const query = `
      SELECT a.*, p.name as provider_name, p.email as provider_email
      FROM apis a
      LEFT JOIN providers p ON a.provider_id = p.id
      WHERE a.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find API by slug
  static async findBySlug(slug) {
    const query = `
      SELECT a.*, a.health_status, a.last_health_check, a.openapi_valid, a.openapi_errors,
             p.name as provider_name, p.email as provider_email
      FROM apis a
      LEFT JOIN providers p ON a.provider_id = p.id
      WHERE a.slug = $1
    `;
    const result = await pool.query(query, [slug]);
    return result.rows[0];
  }

  // Update health status
  static async updateHealthStatus(id, { healthStatus, healthCheckFailures }) {
    const query = `
      UPDATE apis SET health_status = $1, health_check_failures = $2, last_health_check = CURRENT_TIMESTAMP
      WHERE id = $3
    `;
    await pool.query(query, [healthStatus, healthCheckFailures, id]);
  }

  // Update OpenAPI validation result
  static async updateOpenAPIValidation(id, { openapiValid, openapiErrors }) {
    const query = `
      UPDATE apis SET openapi_valid = $1, openapi_errors = $2 WHERE id = $3
    `;
    await pool.query(query, [openapiValid, openapiErrors ? JSON.stringify(openapiErrors) : null, id]);
  }

  // List all APIs with pagination
  static async list({ limit = 20, offset = 0, category, verified, active = true }) {
    let query = `
      SELECT a.id, a.name, a.slug, a.short_description, a.category,
             a.auth_type, a.pricing, a.tags, a.verified, a.view_count,
             a.health_status, a.created_at, p.name as provider_name
      FROM apis a
      LEFT JOIN providers p ON a.provider_id = p.id
      WHERE a.active = $1
    `;
    const params = [active];
    let paramCount = 1;

    if (category) {
      paramCount++;
      query += ` AND a.category = $${paramCount}`;
      params.push(category);
    }

    if (verified !== undefined) {
      paramCount++;
      query += ` AND a.verified = $${paramCount}`;
      params.push(verified);
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Search APIs
  static async search({ query, category, tags, limit = 20, offset = 0 }) {
    let sql = `
      SELECT a.id, a.name, a.slug, a.short_description, a.category,
             a.auth_type, a.pricing, a.tags, a.verified, a.view_count,
             a.created_at, p.name as provider_name
      FROM apis a
      LEFT JOIN providers p ON a.provider_id = p.id
      WHERE a.active = true
    `;
    const params = [];
    let paramCount = 0;

    if (query) {
      paramCount++;
      // Build prefix-matching tsquery: "redd" becomes "redd:*" so partial words match
      const tsquerySql = `(
        SELECT websearch_to_tsquery('english', $${paramCount})
      )`;
      paramCount++;
      // Also do an ILIKE fallback for short/partial terms
      sql += ` AND (
        to_tsvector('english', a.name || ' ' || a.short_description) @@ to_tsquery('english', $${paramCount - 1})
        OR a.name ILIKE $${paramCount}
        OR a.short_description ILIKE $${paramCount}
        OR EXISTS (SELECT 1 FROM unnest(a.tags) tag WHERE tag ILIKE $${paramCount})
      )`;
      // Build prefix tsquery: split words, append :* to each, join with &
      const prefixQuery = query.trim().split(/\s+/).map(w => w.replace(/[^a-zA-Z0-9]/g, '') + ':*').join(' & ');
      params.push(prefixQuery);
      params.push(`%${query}%`);
    }

    if (category) {
      paramCount++;
      sql += ` AND a.category = $${paramCount}`;
      params.push(category);
    }

    if (tags && tags.length > 0) {
      paramCount++;
      sql += ` AND a.tags && $${paramCount}`;
      params.push(tags);
    }

    sql += ` ORDER BY a.view_count DESC, a.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(sql, params);
    return result.rows;
  }

  // Increment view count
  static async incrementViews(id) {
    const query = 'UPDATE apis SET view_count = view_count + 1 WHERE id = $1';
    await pool.query(query, [id]);
  }

  // Add endpoint to API
  static async addEndpoint(apiId, { url, method, description }) {
    const query = `
      INSERT INTO api_endpoints (api_id, url, method, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [apiId, url, method, description]);
    return result.rows[0];
  }

  // Get endpoints for API
  static async getEndpoints(apiId) {
    const query = 'SELECT * FROM api_endpoints WHERE api_id = $1';
    const result = await pool.query(query, [apiId]);
    return result.rows;
  }

  // Add example to API
  static async addExample(apiId, { title, description, requestExample, responseExample }) {
    const query = `
      INSERT INTO api_examples (api_id, title, description, request_example, response_example)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [
      apiId, title, description, requestExample, responseExample
    ]);
    return result.rows[0];
  }

  // Get examples for API
  static async getExamples(apiId) {
    const query = 'SELECT * FROM api_examples WHERE api_id = $1';
    const result = await pool.query(query, [apiId]);
    return result.rows;
  }
}
