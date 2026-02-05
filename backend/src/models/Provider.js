import { pool } from '../utils/db.js';

export class Provider {
  // Create a new provider
  static async create({ email, name, website }) {
    const query = `
      INSERT INTO providers (email, name, website)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [email, name, website]);
    return result.rows[0];
  }

  // Find provider by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM providers WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Find provider by ID
  static async findById(id) {
    const query = 'SELECT * FROM providers WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Verify provider
  static async verify(id) {
    const query = `
      UPDATE providers 
      SET verified = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}
