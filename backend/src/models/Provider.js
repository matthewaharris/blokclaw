import { pool } from '../utils/db.js';

export class Provider {
  // Create a new provider (legacy, no password)
  static async create({ email, name, website, tosAcceptedAt }) {
    const query = `
      INSERT INTO providers (email, name, website, tos_accepted_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [email, name, website, tosAcceptedAt || null]);
    return result.rows[0];
  }

  // Create a new provider with password
  static async createWithPassword({ email, name, website, tosAcceptedAt, passwordHash, verificationToken, verificationTokenExpires }) {
    const query = `
      INSERT INTO providers (email, name, website, tos_accepted_at, password_hash, verification_token, verification_token_expires)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [
      email, name, website, tosAcceptedAt || null,
      passwordHash, verificationToken, verificationTokenExpires
    ]);
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

  // Find provider by verification token
  static async findByVerificationToken(token) {
    const query = 'SELECT * FROM providers WHERE verification_token = $1';
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  // Verify email via token
  static async verifyEmail(token) {
    const query = `
      UPDATE providers
      SET email_verified = true,
          verification_token = NULL,
          verification_token_expires = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE verification_token = $1
        AND verification_token_expires > CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  // Upgrade a passwordless provider (created by agent) with password + verification
  static async upgradeWithPassword(id, { passwordHash, verificationToken, verificationTokenExpires, name, website, tosAcceptedAt }) {
    const query = `
      UPDATE providers
      SET password_hash = $1, verification_token = $2, verification_token_expires = $3,
          name = COALESCE($4, name), website = COALESCE($5, website),
          tos_accepted_at = COALESCE($6, tos_accepted_at), updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    const result = await pool.query(query, [
      passwordHash, verificationToken, verificationTokenExpires,
      name, website, tosAcceptedAt, id
    ]);
    return result.rows[0];
  }

  // Set domain verification code
  static async setDomainVerificationCode(id, code) {
    const query = `
      UPDATE providers SET domain_verification_code = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 RETURNING *
    `;
    const result = await pool.query(query, [code, id]);
    return result.rows[0];
  }

  // Mark domain as verified and set provider + their APIs as verified
  static async verifyDomain(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `UPDATE providers SET domain_verified = true, verified = true, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 RETURNING *`,
        [id]
      );
      await client.query(
        `UPDATE apis SET verified = true, updated_at = CURRENT_TIMESTAMP WHERE provider_id = $1`,
        [id]
      );
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Verify provider (admin action)
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
